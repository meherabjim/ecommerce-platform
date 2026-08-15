import {
  Column, DataType, Default, Model, PrimaryKey, Table,
} from 'sequelize-typescript';

export enum CodReconciliationStatus {
  PENDING='PENDING',
  PARTIAL='PARTIAL',
  SETTLED='SETTLED',
  DISPUTED='DISPUTED',
}

@Table({tableName:'cod_reconciliations',timestamps:true,underscored:true})
export class CodReconciliation extends Model<CodReconciliation> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Column({field:'shipment_id',type:DataType.UUID,allowNull:false})
  declare shipmentId:string;

  @Column({field:'order_id',type:DataType.UUID,allowNull:false})
  declare orderId:string;

  @Column({field:'expected_amount',type:DataType.DECIMAL(12,2),allowNull:false})
  declare expectedAmount:string;

  @Default(0)
  @Column({field:'collected_amount',type:DataType.DECIMAL(12,2),allowNull:false})
  declare collectedAmount:string;

  @Default(0)
  @Column({field:'settled_amount',type:DataType.DECIMAL(12,2),allowNull:false})
  declare settledAmount:string;

  @Default(CodReconciliationStatus.PENDING)
  @Column({type:DataType.STRING(40),allowNull:false})
  declare status:CodReconciliationStatus;

  @Column({field:'settlement_reference',type:DataType.STRING(180),allowNull:true})
  declare settlementReference:string|null;

  @Column({field:'settled_at',type:DataType.DATE,allowNull:true})
  declare settledAt:Date|null;

  @Column({type:DataType.STRING(500),allowNull:true})
  declare note:string|null;

  @Column({field:'created_by',type:DataType.UUID,allowNull:true})
  declare createdBy:string|null;
}
