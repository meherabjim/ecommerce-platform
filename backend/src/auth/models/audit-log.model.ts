import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
})
export class AuditLog extends Model<AuditLog> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ field: 'actor_user_id', type: DataType.UUID, allowNull: true })
  declare actorUserId: string | null;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare action: string;

  @Column({ field: 'entity_type', type: DataType.STRING(80), allowNull: true })
  declare entityType: string | null;

  @Column({ field: 'entity_id', type: DataType.STRING(120), allowNull: true })
  declare entityId: string | null;

  @Column({ field: 'ip_address', type: DataType.STRING(80), allowNull: true })
  declare ipAddress: string | null;

  @Column({ field: 'user_agent', type: DataType.STRING(500), allowNull: true })
  declare userAgent: string | null;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare metadata: Record<string, unknown>;
}
