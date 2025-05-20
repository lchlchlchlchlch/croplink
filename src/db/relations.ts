import { relations } from "drizzle-orm";
import {
  user,
  session,
  account,
  verification,
  crop,
  request,
  requestItem,
} from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  verifications: many(verification),
  requests: many(request),
  requestItems: many(requestItem),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
  impersonator: one(user, {
    fields: [session.impersonatedBy],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// verification has no direct foreign key relations

export const requestRelations = relations(request, ({ one, many }) => ({
  user: one(user, {
    fields: [request.userId],
    references: [user.id],
  }),
  requestItems: many(requestItem),
}));

export const requestItemRelations = relations(requestItem, ({ one }) => ({
  user: one(user, {
    fields: [requestItem.userId],
    references: [user.id],
  }),
  request: one(request, {
    fields: [requestItem.requestId],
    references: [request.id],
  }),
  crop: one(crop, {
    fields: [requestItem.cropId],
    references: [crop.id],
  }),
}));

export const cropRelations = relations(crop, ({ many }) => ({
  requestItems: many(requestItem),
}));
