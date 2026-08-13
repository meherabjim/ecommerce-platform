import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'attribute_values', timestamps: true, underscored: true,
  indexes: [{ unique: true, fields: ['attribute_group_id', 'code'] }] })
export class AttributeValue extends Model<AttributeValue> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id: string;
  @Column({ field: 'attribute_group_id', type: DataType.UUID, allowNull: false }) declare attributeGroupId: string;
  @Column({ type: DataType.STRING(100), allowNull: false }) declare value: string;
  @Column({ type: DataType.STRING(30), allowNull: false }) declare code: string;
  @Default(0) @Column({ field: 'sort_order', type: DataType.INTEGER, allowNull: false }) declare sortOrder: number;
  @Default(true) @Column({ type: DataType.BOOLEAN, allowNull: false }) declare active: boolean;
}
