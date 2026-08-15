import {
  Column, DataType, Default, Model, PrimaryKey, Table,
} from 'sequelize-typescript';

@Table({tableName:'shipment_events',timestamps:true,underscored:true})
export class ShipmentEvent extends Model<ShipmentEvent> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Column({field:'shipment_id',type:DataType.UUID,allowNull:false})
  declare shipmentId:string;

  @Column({field:'provider_status',type:DataType.STRING(120),allowNull:false})
  declare providerStatus:string;

  @Column({field:'normalized_status',type:DataType.STRING(60),allowNull:false})
  declare normalizedStatus:string;

  @Column({type:DataType.STRING(500),allowNull:true})
  declare note:string|null;

  @Default(DataType.NOW)
  @Column({field:'event_time',type:DataType.DATE,allowNull:false})
  declare eventTime:Date;

  @Default({})
  @Column({field:'raw_payload',type:DataType.JSONB,allowNull:false})
  declare rawPayload:Record<string,any>;
}
