import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog } from './models/audit-log.model';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog)
    private readonly auditModel: typeof AuditLog,
  ) {}

  record(input: {
    actorUserId?: string | null;
    action: string;
    entityType?: string | null;
    entityId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    return this.auditModel.create({
      actorUserId: input.actorUserId || null,
      action: input.action,
      entityType: input.entityType || null,
      entityId: input.entityId || null,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      metadata: input.metadata || {},
    } as any);
  }

  list(limit = 200) {
    return this.auditModel.findAll({
      order: [['createdAt', 'DESC']],
      limit: Math.min(Math.max(limit, 1), 500),
    });
  }
}
