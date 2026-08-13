import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
@Table({ tableName:'inventory', timestamps:true, underscored:true, indexes:[{unique:true,fields:['warehouse_id','variant_id']}] })
export class Inventory extends Model<Inventory> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Column({field:'warehouse_id',type:DataType.UUID,allowNull:false}) declare warehouseId:string;
  @Column({field:'variant_id',type:DataType.UUID,allowNull:false}) declare variantId:string;
  @Default(0) @Column({field:'stock_on_hand',type:DataType.INTEGER,allowNull:false}) declare stockOnHand:number;
  @Default(0) @Column({type:DataType.INTEGER,allowNull:false}) declare reserved:number;
  @Default(5) @Column({field:'reorder_level',type:DataType.INTEGER,allowNull:false}) declare reorderLevel:number;
}
