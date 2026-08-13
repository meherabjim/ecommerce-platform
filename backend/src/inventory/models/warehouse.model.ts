import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
@Table({ tableName:'warehouses', timestamps:true, underscored:true })
export class Warehouse extends Model<Warehouse> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Unique @Column({type:DataType.STRING(120),allowNull:false}) declare name:string;
  @Unique @Column({type:DataType.STRING(30),allowNull:false}) declare code:string;
  @Column({type:DataType.STRING(300),allowNull:true}) declare address:string|null;
  @Default(true) @Column({type:DataType.BOOLEAN,allowNull:false}) declare active:boolean;
}
