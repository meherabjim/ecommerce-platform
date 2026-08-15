import {
  Column, DataType, Default, Model, PrimaryKey, Table,
} from 'sequelize-typescript';

export enum RefundStatus {
  REQUESTED='REQUESTED',
  APPROVED='APPROVED',
  PROCESSING='PROCESSING',
  COMPLETED='COMPLETED',
  FAILED='FAILED',
  REJECTED='REJECTED',
}

@Table({tableName:'refunds',timestamps:true,underscored:true})
export class Refund extends Model<Refund> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Column({field:'order_id',type:DataType.UUID,allowNull:false})
  declare orderId:string;

  @Column({field:'payment_transaction_id',type:DataType.UUID,allowNull:true})
  declare paymentTransactionId:string|null;

  @Column({type:DataType.DECIMAL(12,2),allowNull:false})
  declare amount:string;

  @Column({type:DataType.STRING(500),allowNull:false})
  declare reason:string;

  @Default(RefundStatus.REQUESTED)
  @Column({type:DataType.STRING(40),allowNull:false})
  declare status:RefundStatus;

  @Column({field:'provider_reference',type:DataType.STRING(180),allowNull:true})
  declare providerReference:string|null;

  @Column({field:'processed_by',type:DataType.UUID,allowNull:true})
  declare processedBy:string|null;

  @Column({field:'processed_at',type:DataType.DATE,allowNull:true})
  declare processedAt:Date|null;

  @Default({})
  @Column({type:DataType.JSONB,allowNull:false})
  declare metadata:Record<string,any>;
}
