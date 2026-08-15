import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName:'promotion_redemptions', timestamps:true, underscored:true })
export class PromotionRedemption extends Model<PromotionRedemption> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Column({ field:'promotion_id', type:DataType.UUID, allowNull:false }) declare promotionId:string;
  @Column({ field:'user_id', type:DataType.UUID, allowNull:false }) declare userId:string;
  @Column({ field:'order_id', type:DataType.UUID, allowNull:true }) declare orderId:string|null;
  @Default(0) @Column({ type:DataType.DECIMAL(12,2), allowNull:false }) declare discount:string;
}
