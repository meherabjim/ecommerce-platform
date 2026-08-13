import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName:'order_items', timestamps:true, underscored:true })
export class OrderItem extends Model<OrderItem> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Column({ field:'order_id', type:DataType.UUID, allowNull:false }) declare orderId:string;
  @Column({ field:'variant_id', type:DataType.UUID, allowNull:false }) declare variantId:string;
  @Column({ field:'product_name', type:DataType.STRING(180), allowNull:false }) declare productName:string;
  @Column({ type:DataType.STRING(80), allowNull:false }) declare sku:string;
  @Column({ type:DataType.STRING(12), allowNull:false }) declare barcode:string;
  @Column({ type:DataType.JSONB, allowNull:false, defaultValue:{} }) declare attributes:Record<string,string>;
  @Column({ type:DataType.DECIMAL(12,2), allowNull:false }) declare unitPrice:string;
  @Column({ type:DataType.INTEGER, allowNull:false }) declare quantity:number;
  @Column({ type:DataType.DECIMAL(12,2), allowNull:false }) declare lineTotal:string;
}
