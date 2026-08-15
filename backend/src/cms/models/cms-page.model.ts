import {
  Column, DataType, Default, Model, PrimaryKey, Table, Unique,
} from 'sequelize-typescript';

export enum CmsPageStatus {
  DRAFT='DRAFT',
  PUBLISHED='PUBLISHED',
  ARCHIVED='ARCHIVED',
}

@Table({ tableName:'cms_pages', timestamps:true, underscored:true })
export class CmsPage extends Model<CmsPage> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id:string;

  @Unique @Column({type:DataType.STRING(160),allowNull:false})
  declare slug:string;

  @Column({type:DataType.STRING(220),allowNull:false})
  declare title:string;

  @Default('') @Column({type:DataType.TEXT,allowNull:false})
  declare body:string;

  @Default(CmsPageStatus.DRAFT)
  @Column({type:DataType.STRING(30),allowNull:false})
  declare status:CmsPageStatus;

  @Column({field:'meta_title',type:DataType.STRING(220),allowNull:true})
  declare metaTitle:string|null;

  @Column({field:'meta_description',type:DataType.STRING(320),allowNull:true})
  declare metaDescription:string|null;

  @Default(0)
  @Column({field:'sort_order',type:DataType.INTEGER})
  declare sortOrder:number;

  @Column({field:'published_at',type:DataType.DATE,allowNull:true})
  declare publishedAt:Date|null;
}
