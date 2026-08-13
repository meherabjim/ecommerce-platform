import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
export enum InventoryMovementType { OPENING='OPENING', ADJUSTMENT='ADJUSTMENT', SALE='SALE', RETURN='RETURN', RESERVATION='RESERVATION', RELEASE='RELEASE' }
@Table({tableName:'inventory_movements',timestamps:true,underscored:true})
export class InventoryMovement extends Model<InventoryMovement> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Column({field:'warehouse_id',type:DataType.UUID,allowNull:false}) declare warehouseId:string;
  @Column({field:'variant_id',type:DataType.UUID,allowNull:false}) declare variantId:string;
  @Column({type:DataType.ENUM(...Object.values(InventoryMovementType)),allowNull:false}) declare type:InventoryMovementType;
  @Column({type:DataType.INTEGER,allowNull:false}) declare quantity:number;
  @Column({field:'balance_after',type:DataType.INTEGER,allowNull:false}) declare balanceAfter:number;
  @Column({type:DataType.STRING(300),allowNull:true}) declare note:string|null;
}
