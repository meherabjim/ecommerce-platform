import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

@Table({ tableName: 'categories', timestamps: true, underscored: true })
export class Category extends Model<Category> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id: string;
  @Column({ type: DataType.STRING(120), allowNull: false }) declare name: string;
  @Unique @Column({ type: DataType.STRING(150), allowNull: false }) declare slug: string;
  @Unique @Column({ field: 'barcode_prefix', type: DataType.STRING(2), allowNull: false }) declare barcodePrefix: string;
  @Column({ type: DataType.TEXT, allowNull: true }) declare description: string | null;
  @Column({ field: 'image_url', type: DataType.STRING(500), allowNull: true }) declare imageUrl: string | null;
  @Default(true) @Column({ type: DataType.BOOLEAN, allowNull: false }) declare active: boolean;
  @Default(1) @Column({ field: 'next_barcode_serial', type: DataType.INTEGER, allowNull: false }) declare nextBarcodeSerial: number;
}
