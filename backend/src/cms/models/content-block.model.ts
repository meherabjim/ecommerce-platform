import {
  Column, DataType, Default, Model, PrimaryKey, Table,
} from 'sequelize-typescript';

@Table({ tableName:'content_blocks', timestamps:true, underscored:true })
export class ContentBlock extends Model<ContentBlock> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Column({type:DataType.STRING(80),allowNull:false})
  declare kind:string;

  @Column({type:DataType.STRING(180),allowNull:false})
  declare title:string;

  @Column({type:DataType.STRING(300),allowNull:true})
  declare subtitle:string|null;

  @Column({type:DataType.TEXT,allowNull:true})
  declare body:string|null;

  @Column({field:'image_url',type:DataType.TEXT,allowNull:true})
  declare imageUrl:string|null;

  @Column({field:'link_label',type:DataType.STRING(100),allowNull:true})
  declare linkLabel:string|null;

  @Column({field:'link_url',type:DataType.TEXT,allowNull:true})
  declare linkUrl:string|null;

  @Default(true) @Column(DataType.BOOLEAN)
  declare active:boolean;

  @Default(0)
  @Column({field:'sort_order',type:DataType.INTEGER})
  declare sortOrder:number;

  @Default({})
  @Column({type:DataType.JSONB,allowNull:false})
  declare metadata:Record<string,any>;
}
