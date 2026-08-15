import {
  Column, DataType, Default, Model, PrimaryKey, Table, Unique,
} from 'sequelize-typescript';

@Table({tableName:'payment_webhook_events',timestamps:true,underscored:true})
export class PaymentWebhookEvent extends Model<PaymentWebhookEvent> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Column({type:DataType.STRING(60),allowNull:false})
  declare provider:string;

  @Unique
  @Column({field:'event_key',type:DataType.STRING(220),allowNull:false})
  declare eventKey:string;

  @Default(false)
  @Column({field:'signature_valid',type:DataType.BOOLEAN,allowNull:false})
  declare signatureValid:boolean;

  @Default({})
  @Column({type:DataType.JSONB,allowNull:false})
  declare payload:Record<string,any>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare processed:boolean;

  @Column({field:'processed_at',type:DataType.DATE,allowNull:true})
  declare processedAt:Date|null;
}
