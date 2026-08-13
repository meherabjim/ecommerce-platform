import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

@Table({ tableName: 'brands', timestamps: true, underscored: true })
export class Brand extends Model<Brand> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id: string;
  @Column({ type: DataType.STRING(120), allowNull: false }) declare name: string;
  @Unique @Column({ type: DataType.STRING(150), allowNull: false }) declare slug: string;
  @Column({ field: 'logo_url', type: DataType.STRING(500), allowNull: true }) declare logoUrl: string | null;
  @Column({ type: DataType.TEXT, allowNull: true }) declare description: string | null;
  @Default(true) @Column({ type: DataType.BOOLEAN, allowNull: false }) declare active: boolean;
}
