import {
  Column, DataType, Default, Model, PrimaryKey, Table, Unique,
} from 'sequelize-typescript';

@Table({ tableName:'store_settings', timestamps:true, underscored:true })
export class StoreSetting extends Model<StoreSetting> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Unique @Column({type:DataType.STRING(120),allowNull:false})
  declare key:string;

  @Default({})
  @Column({type:DataType.JSONB,allowNull:false})
  declare value:Record<string,any>;

  @Default('GENERAL')
  @Column({field:'group_name',type:DataType.STRING(80),allowNull:false})
  declare groupName:string;

  @Column({type:DataType.STRING(255),allowNull:true})
  declare description:string|null;
}
