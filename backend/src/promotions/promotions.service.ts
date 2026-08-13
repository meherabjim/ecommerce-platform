import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Promotion, PromotionType } from './models/promotion.model';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(@InjectModel(Promotion) private model:typeof Promotion){}

  async create(dto:CreatePromotionDto){
    const code=dto.code.trim().toUpperCase();
    if(await this.model.findOne({where:{code}})) throw new ConflictException('Coupon code already exists.');
    return this.model.create({
      ...dto,
      code,
      minOrder:dto.minOrder??0,
      maxDiscount:dto.maxDiscount??null,
      startsAt:dto.startsAt?new Date(dto.startsAt):null,
      endsAt:dto.endsAt?new Date(dto.endsAt):null,
      usageLimit:dto.usageLimit??null,
      active:dto.active??true,
      featured:dto.featured??false,
    } as any);
  }

  list(){return this.model.findAll({order:[['createdAt','DESC']]});}

  async toggle(id:string){
    const p=await this.model.findByPk(id);
    if(!p) throw new NotFoundException('Promotion not found.');
    p.active=!p.active;
    await p.save();
    return p;
  }

  async featured(){
    const now=new Date();
    const rows=await this.model.findAll({where:{active:true,featured:true},order:[['createdAt','DESC']]});
    return rows.filter(p=>(!p.startsAt||p.startsAt<=now)&&(!p.endsAt||p.endsAt>=now));
  }

  async calculate(code:string|undefined, subtotal:number){
    if(!code) return {promotion:null,discount:0};
    const p=await this.model.findOne({where:{code:code.trim().toUpperCase()}});
    if(!p||!p.active) throw new BadRequestException('Invalid or inactive coupon.');
    const now=new Date();
    if(p.startsAt&&p.startsAt>now) throw new BadRequestException('Coupon is not active yet.');
    if(p.endsAt&&p.endsAt<now) throw new BadRequestException('Coupon has expired.');
    if(p.usageLimit!==null&&p.usedCount>=p.usageLimit) throw new BadRequestException('Coupon usage limit reached.');
    if(subtotal<Number(p.minOrder||0)) throw new BadRequestException(`Minimum order is BDT ${p.minOrder}.`);

    let discount=p.type===PromotionType.PERCENT ? subtotal*(Number(p.value)/100) : Number(p.value);
    if(p.maxDiscount!==null) discount=Math.min(discount,Number(p.maxDiscount));
    discount=Math.min(discount,subtotal);
    return {promotion:p,discount:Number(discount.toFixed(2))};
  }

  async markUsed(id:string, transaction:any){
    const p=await this.model.findByPk(id,{transaction,lock:transaction.LOCK.UPDATE});
    if(!p) return;
    p.usedCount+=1;
    await p.save({transaction});
  }
}
