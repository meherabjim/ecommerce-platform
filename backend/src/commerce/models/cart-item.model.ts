import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'cart_items', timestamps: true, underscored: true,
  indexes: [{ unique: true, fields: ['cart_id', 'variant_id'] }] })
export class CartItem extends Model<CartItem> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id: string;
  @Column({ field: 'cart_id', type: DataType.UUID, allowNull: false }) declare cartId: string;
  @Column({ field: 'variant_id', type: DataType.UUID, allowNull: false }) declare variantId: string;
  @Default(1) @Column({ type: DataType.INTEGER, allowNull: false }) declare quantity: number;
}
