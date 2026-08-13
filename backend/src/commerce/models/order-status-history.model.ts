import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName:'order_status_history', timestamps:true, underscored:true })
export class OrderStatusHistory extends Model<OrderStatusHistory> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Column({ field:'order_id', type:DataType.UUID, allowNull:false }) declare orderId:string;
  @Column({ field:'previous_status', type:DataType.STRING(40), allowNull:true }) declare previousStatus:string|null;
  @Column({ field:'new_status', type:DataType.STRING(40), allowNull:false }) declare newStatus:string;
  @Column({ field:'actor_id', type:DataType.UUID, allowNull:true }) declare actorId:string|null;
  @Column({ type:DataType.STRING(300), allowNull:true }) declare note:string|null;
}
