import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

export enum NotificationType {
  ORDER='ORDER',
  PAYMENT='PAYMENT',
  DELIVERY='DELIVERY',
  RETURN='RETURN',
  SYSTEM='SYSTEM',
}

@Table({
  tableName:'notifications',
  timestamps:true,
  underscored:true,
})
export class Notification extends Model<Notification> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id:string;

  @Column({
    field:'user_id',
    type:DataType.UUID,
    allowNull:false,
  })
  declare userId:string;

  @Default(NotificationType.SYSTEM)
  @Column({
    type:DataType.ENUM(
      ...Object.values(NotificationType),
    ),
    allowNull:false,
  })
  declare type:NotificationType;

  @Column({
    type:DataType.STRING(180),
    allowNull:false,
  })
  declare title:string;

  @Column({
    type:DataType.STRING(500),
    allowNull:false,
  })
  declare message:string;

  @Column({
    field:'reference_id',
    type:DataType.UUID,
    allowNull:true,
  })
  declare referenceId:string|null;

  @Default(false)
  @Column({
    field:'is_read',
    type:DataType.BOOLEAN,
    allowNull:false,
  })
  declare isRead:boolean;
}
