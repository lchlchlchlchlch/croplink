import {
  boolean,
  decimal,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// postgres schema defined for drizzle

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").default("farmer").notNull(),
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by").references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const crop = pgTable("crop", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull().default(0),
  image: text("image"),
});

export const request = pgTable("request", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  date: timestamp("date").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  approved: boolean("approved").default(false).notNull(),
});

export const requestItem = pgTable("request_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  requestId: uuid("request_id")
    .notNull()
    .references(() => request.id, { onDelete: "cascade" }),
  cropId: uuid("crop_id")
    .notNull()
    .references(() => crop.id, { onDelete: "cascade" }),
  image: text("image"),
  amount: integer("amount").notNull().default(0),
});

export const chatRoom = pgTable("chat_room", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().default("General Chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessage = pgTable("chat_message", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatRoomId: uuid("chat_room_id")
    .notNull()
    .references(() => chatRoom.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatRoomUser = pgTable(
  "chat_room_user",
  {
    chatRoomId: uuid("chat_room_id")
      .notNull()
      .references(() => chatRoom.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey(t.chatRoomId, t.userId),
  }),
);

export const order = pgTable("order", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  cropId: uuid("crop_id")
    .notNull()
    .references(() => crop.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
