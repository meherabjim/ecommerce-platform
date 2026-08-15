import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Promotion, PromotionType, CampaignType } from './models/promotion.model';
import { PromotionRedemption } from './models/promotion-redemption.model';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { Order } from '../commerce/models/order.model';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion) private model:typeof Promotion,
    @InjectModel(PromotionRedemption) private redemptionModel:typeof PromotionRedemption,
    @InjectModel(Order) private orderModel:typeof Order,
  ){}

  async create(dto:CreatePromotionDto){
    const code=dto.code.trim().toUpperCase();
    if(await this.model.findOne({where:{code}})) throw new ConflictException('Coupon code already exists.');
    if(dto.startsAt&&dto.endsAt&&new Date(dto.startsAt)>=new Date(dto.endsAt)) throw new BadRequestException('Campaign end time must be after start time.');
    const campaignType=dto.campaignType??CampaignType.COUPON;
    return this.model.create({
      ...dto, code, campaignType,
      firstOrderOnly:dto.firstOrderOnly??campaignType===CampaignType.FIRST_ORDER,
      perUserLimit:dto.perUserLimit??1,
      minOrder:dto.minOrder??0, maxDiscount:dto.maxDiscount??null,
      startsAt:dto.startsAt?new Date(dto.startsAt):null,
      endsAt:dto.endsAt?new Date(dto.endsAt):null,
      usageLimit:dto.usageLimit??null, active:dto.active??true, featured:dto.featured??false,
    } as any);
  }

  list(){return this.model.findAll({order:[['createdAt','DESC']]});}

  async toggle(id:string){
    const p=await this.model.findByPk(id);
    if(!p) throw new NotFoundException('Promotion not found.');
    p.active=!p.active; await p.save(); return p;
  }

  async featured(){
    const now=new Date();
    const rows=await this.model.findAll({where:{active:true,featured:true},order:[['createdAt','DESC']]});
    return rows.filter(p=>(!p.startsAt||p.startsAt<=now)&&(!p.endsAt||p.endsAt>=now));
  }

  async active(){
    const now=new Date();
    const rows=await this.model.findAll({where:{active:true},order:[['featured','DESC'],['createdAt','DESC']]});
    return rows.filter(p=>(!p.startsAt||p.startsAt<=now)&&(!p.endsAt||p.endsAt>=now));
  }

  async calculate(code:string|undefined, subtotal:number, userId?:string){
    if(!code) return {promotion:null,discount:0};
    const p=await this.model.findOne({where:{code:code.trim().toUpperCase()}});
    if(!p||!p.active) throw new BadRequestException('Invalid or inactive coupon.');
    const now=new Date();
    if(p.startsAt&&p.startsAt>now) throw new BadRequestException('Campaign is not active yet.');
    if(p.endsAt&&p.endsAt<now) throw new BadRequestException('Campaign has expired.');
    if(p.usageLimit!==null&&p.usedCount>=p.usageLimit) throw new BadRequestException('Campaign usage limit reached.');
    if(subtotal<Number(p.minOrder||0)) throw new BadRequestException(`Minimum order is BDT ${p.minOrder}.`);

    if(userId){
      const userUses=await this.redemptionModel.count({where:{promotionId:p.id,userId}});
      if(userUses>=Number(p.perUserLimit||1)) throw new BadRequestException('You have reached the usage limit for this campaign.');
      if(p.firstOrderOnly){
        const orderCount=await this.orderModel.count({where:{userId}});
        if(orderCount>0) throw new BadRequestException('This campaign is only available for a customer’s first order.');
      }
    }

    let discount=p.type===PromotionType.PERCENT ? subtotal*(Number(p.value)/100) : Number(p.value);
    if(p.maxDiscount!==null) discount=Math.min(discount,Number(p.maxDiscount));
    discount=Math.min(discount,subtotal);
    return {promotion:p,discount:Number(discount.toFixed(2))};
  }

  async markUsed(id:string, userId:string, orderId:string, discount:number, transaction:any){
    const p=await this.model.findByPk(id,{transaction,lock:transaction.LOCK.UPDATE});
    if(!p) return;
    if(p.usageLimit!==null&&p.usedCount>=p.usageLimit) throw new BadRequestException('Campaign usage limit reached.');
    const userUses=await this.redemptionModel.count({where:{promotionId:id,userId},transaction});
    if(userUses>=Number(p.perUserLimit||1)) throw new BadRequestException('You have reached the usage limit for this campaign.');
    p.usedCount+=1;
    await p.save({transaction});
    await this.redemptionModel.create({promotionId:id,userId,orderId,discount} as any,{transaction});
  }
}
