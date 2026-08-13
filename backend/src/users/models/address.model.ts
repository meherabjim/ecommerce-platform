import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

export enum AddressType {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER',
}

export enum LocationSource {
  GPS = 'GPS',
  MANUAL = 'MANUAL',
  NONE = 'NONE',
}

@Table({
  tableName: 'addresses',
  timestamps: true,
  underscored: true,
})
export class Address extends Model<Address> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    field: 'user_id',
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @Column({
    field: 'recipient_name',
    type: DataType.STRING(120),
    allowNull: false,
  })
  declare recipientName: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
  })
  declare phone: string;

  @Default(AddressType.HOME)
  @Column({
    type: DataType.ENUM(...Object.values(AddressType)),
    allowNull: false,
  })
  declare type: AddressType;

  @Column({
    type: DataType.STRING(80),
    allowNull: false,
  })
  declare division: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare district: string;

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
  })
  declare area: string;

  @Column({
    field: 'address_line',
    type: DataType.STRING(300),
    allowNull: false,
  })
  declare addressLine: string;

  @Column({
    type: DataType.STRING(160),
    allowNull: true,
  })
  declare landmark: string | null;

  @Column({
    field: 'postal_code',
    type: DataType.STRING(30),
    allowNull: true,
  })
  declare postalCode: string | null;

  @Column({
    type: DataType.DECIMAL(10, 7),
    allowNull: true,
  })
  declare latitude: string | null;

  @Column({
    type: DataType.DECIMAL(10, 7),
    allowNull: true,
  })
  declare longitude: string | null;

  @Default(LocationSource.NONE)
  @Column({
    field: 'location_source',
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare locationSource: LocationSource;

  @Default(false)
  @Column({
    field: 'is_default',
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare isDefault: boolean;
}
