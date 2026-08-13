import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

export enum OrderStatus {
  PENDING='PENDING', CONFIRMED='CONFIRMED', PROCESSING='PROCESSING',
  PACKED='PACKED', SHIPPED='SHIPPED', DELIVERED='DELIVERED', CANCELLED='CANCELLED'
}
export enum PaymentMode { COD='COD', FULL_ONLINE='FULL_ONLINE', PARTIAL='PARTIAL' }
export enum PaymentStatus { UNPAID='UNPAID', PENDING='PENDING', PARTIAL='PARTIAL', PAID='PAID', FAILED='FAILED', REFUNDED='REFUNDED' }

@Table({ tableName: 'orders', timestamps: true, underscored: true })
export class Order extends Model<Order> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Unique @Column({ field:'order_number', type:DataType.STRING(40), allowNull:false }) declare orderNumber:string;
  @Column({ field:'user_id', type:DataType.UUID, allowNull:false }) declare userId:string;
  @Default(OrderStatus.PENDING) @Column({ type:DataType.ENUM(...Object.values(OrderStatus)), allowNull:false }) declare status:OrderStatus;
  @Default(PaymentMode.COD) @Column({ field:'payment_mode', type:DataType.ENUM(...Object.values(PaymentMode)), allowNull:false }) declare paymentMode:PaymentMode;
  @Default(PaymentStatus.UNPAID) @Column({ field:'payment_status', type:DataType.ENUM(...Object.values(PaymentStatus)), allowNull:false }) declare paymentStatus:PaymentStatus;
  @Column({ type:DataType.DECIMAL(12,2), allowNull:false }) declare subtotal:string;
  @Default(0) @Column({ field:'shipping_charge', type:DataType.DECIMAL(12,2), allowNull:false }) declare shippingCharge:string;
  @Default(0) @Column({ type:DataType.DECIMAL(12,2), allowNull:false }) declare discount:string;
  @Column({ type:DataType.DECIMAL(12,2), allowNull:false }) declare total:string;
  @Column({ field:'customer_name', type:DataType.STRING(120), allowNull:false }) declare customerName:string;
  @Column({ field:'phone', type:DataType.STRING(30), allowNull:false }) declare phone:string;
  @Column({ field:'email', type:DataType.STRING(180), allowNull:true }) declare email:string|null;
  @Column({ field:'address_line', type:DataType.STRING(300), allowNull:false }) declare addressLine:string;
  @Column({ field:'city', type:DataType.STRING(100), allowNull:false }) declare city:string;
  @Column({ field:'postal_code', type:DataType.STRING(30), allowNull:true }) declare postalCode:string|null;
  @Column({ field:'notes', type:DataType.STRING(500), allowNull:true }) declare notes:string|null;
}
