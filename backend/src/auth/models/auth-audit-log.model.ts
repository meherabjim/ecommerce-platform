import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';


@Table({
  tableName: 'auth_audit_logs',
  timestamps: true,
})
export class AuthAuditLog extends Model {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;


  @Column({
    type: DataType.UUID,
    field: 'user_id',
    allowNull: true,
  })
  declare userId: string;


  @Column({
    type: DataType.STRING,
  })
  declare action: string;


  @Column({
    type: DataType.STRING,
    field: 'ip_address',
    allowNull: true,
  })
  declare ipAddress: string;


  @Column({
    type: DataType.TEXT,
    field: 'user_agent',
    allowNull: true,
  })
  declare userAgent: string;


  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare metadata: any;

}