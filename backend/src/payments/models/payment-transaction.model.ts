import {
  Column, DataType, Default, Model, PrimaryKey, Table, Unique,
} from 'sequelize-typescript';

export enum PaymentTransactionType {
  CHARGE='CHARGE',
  PARTIAL_PAYMENT='PARTIAL_PAYMENT',
  DUE_COLLECTION='DUE_COLLECTION',
  COD_COLLECTION='COD_COLLECTION',
  MANUAL_PAYMENT='MANUAL_PAYMENT',
  REFUND='REFUND',
}

export enum PaymentTransactionStatus {
  PENDING='PENDING',
  VERIFIED='VERIFIED',
  FAILED='FAILED',
  CANCELLED='CANCELLED',
}

@Table({tableName:'payment_transactions',timestamps:true,underscored:true})
export class PaymentTransaction extends Model<PaymentTransaction> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Column({field:'order_id',type:DataType.UUID,allowNull:false})
  declare orderId:string;

  @Column({field:'user_id',type:DataType.UUID,allowNull:false})
  declare userId:string;

  @Default('MANUAL')
  @Column({type:DataType.STRING(60),allowNull:false})
  declare provider:string;

  @Column({type:DataType.STRING(40),allowNull:false})
  declare type:PaymentTransactionType;

  @Default(PaymentTransactionStatus.PENDING)
  @Column({type:DataType.STRING(40),allowNull:false})
  declare status:PaymentTransactionStatus;

  @Column({type:DataType.DECIMAL(12,2),allowNull:false})
  declare amount:string;

  @Default('BDT')
  @Column({type:DataType.STRING(10),allowNull:false})
  declare currency:string;

  @Column({field:'external_reference',type:DataType.STRING(180),allowNull:true})
  declare externalReference:string|null;

  @Unique
  @Column({field:'idempotency_key',type:DataType.STRING(180),allowNull:true})
  declare idempotencyKey:string|null;

  @Column({field:'payment_method',type:DataType.STRING(80),allowNull:true})
  declare paymentMethod:string|null;

  @Default({})
  @Column({field:'provider_payload',type:DataType.JSONB,allowNull:false})
  declare providerPayload:Record<string,any>;

  @Column({field:'verified_at',type:DataType.DATE,allowNull:true})
  declare verifiedAt:Date|null;

  @Column({field:'failed_reason',type:DataType.STRING(500),allowNull:true})
  declare failedReason:string|null;

  @Column({field:'created_by',type:DataType.UUID,allowNull:true})
  declare createdBy:string|null;
}
