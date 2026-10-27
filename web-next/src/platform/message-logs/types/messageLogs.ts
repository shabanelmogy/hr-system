import { z } from "zod";

export const messageStatuses = ["pending", "accepted", "failed", "cancelled", "uncertain"] as const;
export const messageTemplates = ["email-confirmation", "password-reset", "user-invitation"] as const;
const rowSchema = z.object({
  id: z.string().uuid(), startedOnUtc: z.string().datetime(), completedOnUtc: z.string().datetime().nullable(), durationMs: z.number().nonnegative().nullable(),
  type: z.literal("email"), templateId: z.enum(messageTemplates), language: z.enum(["en", "ar"]), recipient: z.string().max(320), subject: z.string().max(512),
  status: z.enum(messageStatuses), phase: z.enum(["configuration", "render", "connect", "authenticate", "send", "accepted", "disconnect"]),
  cause: z.enum(["disabled", "configuration", "content", "connection", "authentication", "rejected", "cancelled", "communication", "unknown"]).nullable(),
  smtpStatusCode: z.number().int().min(100).max(599).nullable(), correlationId: z.string().nullable(), snapshotTruncated: z.boolean(),
});
export const messageLogPageSchema = z.object({ items: z.array(rowSchema), totalCount: z.number().int().nonnegative(), page: z.number().int().positive(), pageSize: z.number().int().positive() });
export const messageLogDetailSchema = z.object({ entry: rowSchema, snapshotHtml: z.string().max(65536).nullable() });
export type MessageLogRow = z.infer<typeof rowSchema>;
export type MessageLogDetail = z.infer<typeof messageLogDetailSchema>;
export type MessageLogStatus = typeof messageStatuses[number];
export type MessageTemplate = typeof messageTemplates[number];
export type MessageLogCriteria = { fromUtc?: string; toUtc?: string; status?: MessageLogStatus; templateId?: MessageTemplate; recipient?: string; search?: string; page: number; pageSize: number };
export type MessageLogFilters = { from: string; to: string; status: "" | MessageLogStatus; templateId: "" | MessageTemplate; recipient: string };
