import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

@Table({ tableName: 'product_variants', timestamps: true, underscored: true })
export class ProductVariant extends Model<ProductVariant> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id: string;
  @Column({ field: 'product_id', type: DataType.UUID, allowNull: false }) declare productId: string;
  @Unique @Column({ type: DataType.STRING(80), allowNull: false }) declare sku: string;
  @Unique @Column({ type: DataType.STRING(12), allowNull: false }) declare barcode: string;
  @Column({ field: 'variant_code', type: DataType.STRING(4), allowNull: false }) declare variantCode: string;
  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} }) declare attributes: Record<string,string>;
  @Column({ type: DataType.DECIMAL(12,2), allowNull: false }) declare price: string;
  @Column({ field: 'sale_price', type: DataType.DECIMAL(12,2), allowNull: true }) declare salePrice: string | null;
  @Column({ field: 'cost_price', type: DataType.DECIMAL(12,2), allowNull: true }) declare costPrice: string | null;
  @Column({ type: DataType.DECIMAL(10,3), allowNull: true }) declare weight: string | null;
  @Column({ field: 'image_url', type: DataType.STRING(500), allowNull: true }) declare imageUrl: string | null;
  @Default(true) @Column({ type: DataType.BOOLEAN, allowNull: false }) declare active: boolean;
}
