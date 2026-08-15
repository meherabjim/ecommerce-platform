import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Warehouse } from './models/warehouse.model';
import { Inventory } from './models/inventory.model';
import { InventoryMovement, InventoryMovementType } from './models/inventory-movement.model';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Injectable()
export class InventoryService implements OnModuleInit {
  constructor(
    @InjectModel(Warehouse) private warehouseModel:typeof Warehouse,
    @InjectModel(Inventory) private inventoryModel:typeof Inventory,
    @InjectModel(InventoryMovement) private movementModel:typeof InventoryMovement,
    private sequelize:Sequelize,
  ) {}
  async onModuleInit(){ await this.ensureDefaultWarehouse(); }
  async ensureDefaultWarehouse(){
    const [w]=await this.warehouseModel.findOrCreate({where:{code:'MAIN'},defaults:{name:'Main Warehouse',code:'MAIN',address:'Primary stock location',active:true} as any}); return w;
  }
  async ensureVariantStock(variantId:string, openingStock=0){
    const w=await this.ensureDefaultWarehouse();
    const [inv,created]=await this.inventoryModel.findOrCreate({where:{warehouseId:w.id,variantId},defaults:{warehouseId:w.id,variantId,stockOnHand:openingStock,reserved:0,reorderLevel:5} as any});
    if(created && openingStock!==0) await this.movementModel.create({warehouseId:w.id,variantId,type:InventoryMovementType.OPENING,quantity:openingStock,balanceAfter:openingStock,note:'Opening stock'} as any);
    return inv;
  }
  async getDefaultInventory(variantId:string, transaction?:any){
    const w=await this.ensureDefaultWarehouse();
    const inv=await this.inventoryModel.findOne({where:{warehouseId:w.id,variantId},transaction,lock:transaction?.LOCK?.UPDATE});
    if(!inv) throw new NotFoundException('Inventory row not found for variant.');
    return {inv,w};
  }
  async reserve(variantId:string, quantity:number, transaction:any){
    const {inv,w}=await this.getDefaultInventory(variantId,transaction);
    const available=inv.stockOnHand-inv.reserved;
    if(quantity>available) throw new BadRequestException(`Only ${available} unit(s) available.`);
    inv.reserved+=quantity; await inv.save({transaction});
    await this.movementModel.create({warehouseId:w.id,variantId,type:InventoryMovementType.RESERVATION,quantity:-quantity,balanceAfter:inv.stockOnHand,note:'Reserved for order'} as any,{transaction});
  }
  async release(variantId:string, quantity:number, transaction:any){
    const {inv,w}=await this.getDefaultInventory(variantId,transaction);
    inv.reserved=Math.max(0,inv.reserved-quantity); await inv.save({transaction});
    await this.movementModel.create({warehouseId:w.id,variantId,type:InventoryMovementType.RELEASE,quantity, balanceAfter:inv.stockOnHand,note:'Order reservation released'} as any,{transaction});
  }
  async consumeReserved(variantId:string, quantity:number, transaction:any){
    const {inv,w}=await this.getDefaultInventory(variantId,transaction);
    if(inv.reserved<quantity || inv.stockOnHand<quantity) throw new BadRequestException('Reserved stock is inconsistent.');
    inv.reserved-=quantity; inv.stockOnHand-=quantity; await inv.save({transaction});
    await this.movementModel.create({warehouseId:w.id,variantId,type:InventoryMovementType.SALE,quantity:-quantity,balanceAfter:inv.stockOnHand,note:'Stock consumed by delivered order'} as any,{transaction});
  }
  async adjust(dto:AdjustInventoryDto){
    const w=dto.warehouseId?await this.warehouseModel.findByPk(dto.warehouseId):await this.ensureDefaultWarehouse();
    if(!w) throw new NotFoundException('Warehouse not found.');
    return this.sequelize.transaction(async t=>{
      let inv=await this.inventoryModel.findOne({where:{warehouseId:w.id,variantId:dto.variantId},transaction:t,lock:t.LOCK.UPDATE});
      if(!inv) inv=await this.inventoryModel.create({warehouseId:w.id,variantId:dto.variantId,stockOnHand:0,reserved:0,reorderLevel:5} as any,{transaction:t});
      const next=inv.stockOnHand+dto.quantity;
      if(next<0 || next<inv.reserved) throw new BadRequestException('Stock cannot be lower than zero or reserved stock.');
      inv.stockOnHand=next; await inv.save({transaction:t});
      await this.movementModel.create({warehouseId:w.id,variantId:dto.variantId,type:InventoryMovementType.ADJUSTMENT,quantity:dto.quantity,balanceAfter:next,note:dto.note||null} as any,{transaction:t});
      return {...inv.toJSON(),available:inv.stockOnHand-inv.reserved};
    });
  }
  async stockSummary(){ const rows=await this.inventoryModel.findAll(); return rows.map(r=>({...r.toJSON(),available:r.stockOnHand-r.reserved,lowStock:r.stockOnHand-r.reserved<=r.reorderLevel})); }
  warehouses(){ return this.warehouseModel.findAll({order:[['name','ASC']]}); }
  movements(){ return this.movementModel.findAll({order:[['createdAt','DESC']],limit:200}); }

  async createWarehouse(input:{name:string;code:string;address?:string}){
    const code=input.code.trim().toUpperCase();
    if(await this.warehouseModel.findOne({where:{code}})) throw new BadRequestException('Warehouse code already exists.');
    if(await this.warehouseModel.findOne({where:{name:input.name.trim()}})) throw new BadRequestException('Warehouse name already exists.');
    return this.warehouseModel.create({name:input.name.trim(),code,address:input.address?.trim()||null,active:true} as any);
  }

  async setReorderLevel(input:{variantId:string;warehouseId?:string;reorderLevel:number}){
    const w=input.warehouseId?await this.warehouseModel.findByPk(input.warehouseId):await this.ensureDefaultWarehouse();
    if(!w) throw new NotFoundException('Warehouse not found.');
    let inv=await this.inventoryModel.findOne({where:{warehouseId:w.id,variantId:input.variantId}});
    if(!inv) inv=await this.inventoryModel.create({warehouseId:w.id,variantId:input.variantId,stockOnHand:0,reserved:0,reorderLevel:input.reorderLevel} as any);
    inv.reorderLevel=input.reorderLevel;
    await inv.save();
    return {...inv.toJSON(),available:inv.stockOnHand-inv.reserved,lowStock:inv.stockOnHand-inv.reserved<=inv.reorderLevel};
  }

  async dashboard(){
    const [stock,warehouses,movements]=await Promise.all([this.stockSummary(),this.warehouses(),this.movements()]);
    const totals=stock.reduce((a:any,r:any)=>{
      a.stockOnHand+=Number(r.stockOnHand||0); a.reserved+=Number(r.reserved||0);
      a.available+=Number(r.available||0); if(r.lowStock)a.lowStock+=1;
      if(Number(r.available||0)<=0)a.outOfStock+=1; return a;
    },{stockOnHand:0,reserved:0,available:0,lowStock:0,outOfStock:0});
    return {totals,warehouses,stock,recentMovements:movements.slice(0,50)};
  }

  async lowStock(){
    const rows=await this.stockSummary();
    return rows.filter((row:any)=>row.lowStock).sort((a:any,b:any)=>a.available-b.available);
  }

}
