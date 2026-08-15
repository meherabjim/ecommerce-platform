import {
  Column, DataType, Default, Model, PrimaryKey, Table,
} from 'sequelize-typescript';

export enum ShipmentStatus {
  DRAFT='DRAFT',
  CREATED='CREATED',
  PICKUP_REQUESTED='PICKUP_REQUESTED',
  PICKED_UP='PICKED_UP',
  IN_TRANSIT='IN_TRANSIT',
  OUT_FOR_DELIVERY='OUT_FOR_DELIVERY',
  DELIVERED='DELIVERED',
  FAILED='FAILED',
  RETURNED='RETURNED',
  CANCELLED='CANCELLED',
}

@Table({tableName:'courier_shipments',timestamps:true,underscored:true})
export class CourierShipment extends Model<CourierShipment> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Column({field:'order_id',type:DataType.UUID,allowNull:false})
  declare orderId:string;

  @Default('INTERNAL')
  @Column({type:DataType.STRING(60),allowNull:false})
  declare provider:string;

  @Default(ShipmentStatus.DRAFT)
  @Column({type:DataType.STRING(60),allowNull:false})
  declare status:ShipmentStatus;

  @Column({field:'consignment_id',type:DataType.STRING(180),allowNull:true})
  declare consignmentId:string|null;

  @Column({field:'tracking_code',type:DataType.STRING(180),allowNull:true})
  declare trackingCode:string|null;

  @Column({field:'tracking_url',type:DataType.TEXT,allowNull:true})
  declare trackingUrl:string|null;

  @Default(0)
  @Column({field:'cod_amount',type:DataType.DECIMAL(12,2),allowNull:false})
  declare codAmount:string;

  @Default(0)
  @Column({field:'delivery_fee',type:DataType.DECIMAL(12,2),allowNull:false})
  declare deliveryFee:string;

  @Column({field:'recipient_name',type:DataType.STRING(180),allowNull:false})
  declare recipientName:string;

  @Column({type:DataType.STRING(40),allowNull:false})
  declare phone:string;

  @Column({field:'delivery_address',type:DataType.TEXT,allowNull:false})
  declare deliveryAddress:string;

  @Column({type:DataType.STRING(120),allowNull:true})
  declare district:string|null;

  @Column({type:DataType.STRING(160),allowNull:true})
  declare area:string|null;

  @Default({})
  @Column({field:'provider_payload',type:DataType.JSONB,allowNull:false})
  declare providerPayload:Record<string,any>;

  @Column({field:'created_by',type:DataType.UUID,allowNull:true})
  declare createdBy:string|null;

  @Column({field:'shipped_at',type:DataType.DATE,allowNull:true})
  declare shippedAt:Date|null;

  @Column({field:'delivered_at',type:DataType.DATE,allowNull:true})
  declare deliveredAt:Date|null;

  @Column({field:'failed_at',type:DataType.DATE,allowNull:true})
  declare failedAt:Date|null;

  @Column({field:'failure_reason',type:DataType.STRING(500),allowNull:true})
  declare failureReason:string|null;
}
