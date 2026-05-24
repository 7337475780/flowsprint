import { AuditLog, IAuditLog } from './audit.model.js';

/**
 * Asynchronously logs a system auditing event.
 * Suppresses failures so auditing never blocks active business transactions.
 */
export const logEvent = async (
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: any
): Promise<IAuditLog | null> => {
  try {
    const log = await AuditLog.create({
      userId,
      action,
      entityType,
      entityId: entityId || undefined,
      metadata,
      timestamp: new Date(),
    });
    return log;
  } catch (error) {
    console.error('⚠️ [Audit] Failed to register system audit log event:', error);
    return null;
  }
};

/**
 * Retrieves a paginated and filtered list of audit logs (Admins only).
 */
export const getLogs = async (query: any) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const dbQuery: any = {};

  if (query.userId) {
    dbQuery.userId = query.userId;
  }
  if (query.action) {
    dbQuery.action = query.action;
  }
  if (query.entityType) {
    dbQuery.entityType = query.entityType;
  }
  if (query.entityId) {
    dbQuery.entityId = query.entityId;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(dbQuery)
      .populate('userId', 'name email avatar')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(dbQuery),
  ]);

  return {
    data: logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
