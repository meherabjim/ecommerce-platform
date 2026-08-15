import {
  Column, DataType, Default, Model, PrimaryKey, Table,
} from 'sequelize-typescript';

@Table({ tableName:'homepage_sections', timestamps:true, underscored:true })
export class HomepageSection extends Model<HomepageSection> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Column({type:DataType.STRING(80),allowNull:false})
  declare type:string;

  @Column({type:DataType.STRING(180),allowNull:true})
  declare title:string|null;

  @Column({type:DataType.STRING(300),allowNull:true})
  declare subtitle:string|null;

  @Default(true) @Column(DataType.BOOLEAN)
  declare enabled:boolean;

  @Default(0)
  @Column({field:'sort_order',type:DataType.INTEGER})
  declare sortOrder:number;

  @Default({})
  @Column({type:DataType.JSONB,allowNull:false})
  declare config:Record<string,any>;

  @Column({field:'schedule_from',type:DataType.DATE,allowNull:true})
  declare scheduleFrom:Date|null;

  @Column({field:'schedule_to',type:DataType.DATE,allowNull:true})
  declare scheduleTo:Date|null;
}
