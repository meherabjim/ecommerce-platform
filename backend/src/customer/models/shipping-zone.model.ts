import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName:'shipping_zones',
  timestamps:true,
  underscored:true,
})
export class ShippingZone extends Model<ShippingZone> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id:string;

  @Column({
    type:DataType.STRING(100),
    allowNull:false,
  })
  declare district:string;

  @Column({
    type:DataType.STRING(120),
    allowNull:true,
  })
  declare area:string|null;

  @Column({
    type:DataType.DECIMAL(12,2),
    allowNull:false,
  })
  declare charge:string;

  @Default(3000)
  @Column({
    field:'free_shipping_threshold',
    type:DataType.DECIMAL(12,2),
    allowNull:false,
  })
  declare freeShippingThreshold:string;

  @Default(true)
  @Column({
    type:DataType.BOOLEAN,
    allowNull:false,
  })
  declare active:boolean;
}
