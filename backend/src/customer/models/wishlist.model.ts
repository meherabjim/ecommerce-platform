import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName:'wishlists',
  timestamps:true,
  underscored:true,
  indexes:[
    {
      unique:true,
      fields:['user_id','product_id'],
    },
  ],
})
export class Wishlist extends Model<Wishlist> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id:string;

  @Column({
    field:'user_id',
    type:DataType.UUID,
    allowNull:false,
  })
  declare userId:string;

  @Column({
    field:'product_id',
    type:DataType.UUID,
    allowNull:false,
  })
  declare productId:string;
}
