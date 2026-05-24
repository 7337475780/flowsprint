import { Schema, model, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId: Schema.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: Schema.Types.ObjectId;
  metadata?: any;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Auditing requires performing user reference'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Auditing action name is required'],
      index: true,
    },
    entityType: {
      type: String,
      required: [true, 'Auditing target entity type is required'],
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We use explicit timestamp field
  }
);

export const AuditLog = model<IAuditLog, Model<IAuditLog>>('AuditLog', auditLogSchema);
export default AuditLog;
