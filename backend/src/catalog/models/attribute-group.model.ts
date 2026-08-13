import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

@Table({ tableName: 'attribute_groups', timestamps: true, underscored: true })
export class AttributeGroup extends Model<AttributeGroup> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id: string;
  @Unique @Column({ type: DataType.STRING(80), allowNull: false }) declare name: string;
  @Unique @Column({ type: DataType.STRING(100), allowNull: false }) declare code: string;
  @Default(true) @Column({ type: DataType.BOOLEAN, allowNull: false }) declare active: boolean;
}
