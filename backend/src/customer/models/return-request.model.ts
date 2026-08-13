import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

export enum ReturnStatus {
  REQUESTED='REQUESTED',
  APPROVED='APPROVED',
  REJECTED='REJECTED',
  RECEIVED='RECEIVED',
  REFUNDED='REFUNDED',
}

@Table({
  tableName:'return_requests',
  timestamps:true,
  underscored:true,
})
export class ReturnRequest extends Model<ReturnRequest> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id:string;

  @Column({
    field:'order_id',
    type:DataType.UUID,
    allowNull:false,
  })
  declare orderId:string;

  @Column({
    field:'user_id',
    type:DataType.UUID,
    allowNull:false,
  })
  declare userId:string;

  @Column({
    type:DataType.STRING(500),
    allowNull:false,
  })
  declare reason:string;

  @Default(ReturnStatus.REQUESTED)
  @Column({
    type:DataType.ENUM(
      ...Object.values(ReturnStatus),
    ),
    allowNull:false,
  })
  declare status:ReturnStatus;

  @Column({
    field:'admin_note',
    type:DataType.STRING(500),
    allowNull:true,
  })
  declare adminNote:string|null;
}
