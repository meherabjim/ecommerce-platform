import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

export enum PromotionType { PERCENT='PERCENT', FIXED='FIXED' }
export enum CampaignType { COUPON='COUPON', FLASH_SALE='FLASH_SALE', FIRST_ORDER='FIRST_ORDER' }

@Table({ tableName:'promotions', timestamps:true, underscored:true })
export class Promotion extends Model<Promotion> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Unique @Column({ type:DataType.STRING(50), allowNull:false }) declare code:string;
  @Column({ type:DataType.STRING(140), allowNull:false }) declare name:string;
  @Column({ type:DataType.ENUM(...Object.values(PromotionType)), allowNull:false }) declare type:PromotionType;
  @Default(CampaignType.COUPON) @Column({ field:'campaign_type', type:DataType.ENUM(...Object.values(CampaignType)), allowNull:false }) declare campaignType:CampaignType;
  @Column({ type:DataType.DECIMAL(12,2), allowNull:false }) declare value:string;
  @Default(0) @Column({ field:'min_order', type:DataType.DECIMAL(12,2), allowNull:false }) declare minOrder:string;
  @Column({ field:'max_discount', type:DataType.DECIMAL(12,2), allowNull:true }) declare maxDiscount:string|null;
  @Column({ field:'starts_at', type:DataType.DATE, allowNull:true }) declare startsAt:Date|null;
  @Column({ field:'ends_at', type:DataType.DATE, allowNull:true }) declare endsAt:Date|null;
  @Column({ field:'usage_limit', type:DataType.INTEGER, allowNull:true }) declare usageLimit:number|null;
  @Default(1) @Column({ field:'per_user_limit', type:DataType.INTEGER, allowNull:false }) declare perUserLimit:number;
  @Default(false) @Column({ field:'first_order_only', type:DataType.BOOLEAN, allowNull:false }) declare firstOrderOnly:boolean;
  @Default(0) @Column({ field:'used_count', type:DataType.INTEGER, allowNull:false }) declare usedCount:number;
  @Default(true) @Column({ type:DataType.BOOLEAN, allowNull:false }) declare active:boolean;
  @Default(false) @Column({ type:DataType.BOOLEAN, allowNull:false }) declare featured:boolean;
}
