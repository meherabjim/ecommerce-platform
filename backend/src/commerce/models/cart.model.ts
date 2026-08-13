import { Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

@Table({ tableName: 'carts', timestamps: true, underscored: true })
export class Cart extends Model<Cart> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id: string;
  @Unique @Column({ field: 'user_id', type: DataType.UUID, allowNull: false }) declare userId: string;
}
