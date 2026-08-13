import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

export enum ProductStatus { DRAFT='DRAFT', ACTIVE='ACTIVE', INACTIVE='INACTIVE', ARCHIVED='ARCHIVED' }

@Table({ tableName: 'products', timestamps: true, underscored: true })
export class Product extends Model<Product> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id: string;
  @Column({ type: DataType.STRING(180), allowNull: false }) declare name: string;
  @Unique @Column({ type: DataType.STRING(220), allowNull: false }) declare slug: string;
  @Column({ field: 'category_id', type: DataType.UUID, allowNull: false }) declare categoryId: string;
  @Column({ field: 'brand_id', type: DataType.UUID, allowNull: true }) declare brandId: string | null;
  @Column({ type: DataType.TEXT, allowNull: true }) declare description: string | null;
  @Column({ field: 'short_description', type: DataType.STRING(500), allowNull: true }) declare shortDescription: string | null;
  @Column({ field: 'primary_image_url', type: DataType.STRING(500), allowNull: true }) declare primaryImageUrl: string | null;
  @Default(ProductStatus.DRAFT) @Column({ type: DataType.ENUM(...Object.values(ProductStatus)), allowNull: false }) declare status: ProductStatus;
  @Default(false) @Column({ type: DataType.BOOLEAN, allowNull: false }) declare featured: boolean;
}
