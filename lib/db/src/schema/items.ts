import { createInsertSchema } from "drizzle-zod";
import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const itemsTable = pgTable("lost_found_items", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  itemName: text("item_name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  itemDate: date("item_date", { mode: "string" }).notNull(),
  contactInformation: text("contact_information").notNull(),
  photoPath: text("photo_path"),
  clerkUserId: text("clerk_user_id").notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertItemSchema = createInsertSchema(itemsTable).omit({
  id: true,
  postedAt: true,
});

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof itemsTable.$inferSelect;