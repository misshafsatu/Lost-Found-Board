import { and, desc, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateItemBody,
  CreateItemResponse,
  ListItemsQueryParams,
  ListItemsResponse,
} from "@workspace/api-zod";
import { db, itemsTable } from "@workspace/db";

import { getClerkUserId, requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/items", async (req, res): Promise<void> => {
  const parsed = ListItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid search parameters" });
    return;
  }

  const { search, location } = parsed.data;
  const filters = [];

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    filters.push(
      or(
        ilike(itemsTable.itemName, term),
        ilike(itemsTable.description, term),
      ),
    );
  }

  if (location?.trim()) {
    filters.push(ilike(itemsTable.location, `%${location.trim()}%`));
  }

  const items = await db
    .select({
      id: itemsTable.id,
      type: itemsTable.type,
      itemName: itemsTable.itemName,
      description: itemsTable.description,
      location: itemsTable.location,
      itemDate: itemsTable.itemDate,
      contactInformation: itemsTable.contactInformation,
      photoPath: itemsTable.photoPath,
      postedAt: itemsTable.postedAt,
    })
    .from(itemsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(itemsTable.postedAt))
    .limit(100);

  res.json(ListItemsResponse.parse(items));
});

router.post("/items", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid item details" });
    return;
  }

  const userId = getClerkUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const [item] = await db
    .insert(itemsTable)
    .values({
      ...parsed.data,
      itemDate: parsed.data.itemDate.toISOString().slice(0, 10),
      photoPath: parsed.data.photoPath ?? null,
      clerkUserId: userId,
    })
    .returning({
      id: itemsTable.id,
      type: itemsTable.type,
      itemName: itemsTable.itemName,
      description: itemsTable.description,
      location: itemsTable.location,
      itemDate: itemsTable.itemDate,
      contactInformation: itemsTable.contactInformation,
      photoPath: itemsTable.photoPath,
      postedAt: itemsTable.postedAt,
    });

  res.status(201).json(CreateItemResponse.parse(item));
});

export default router;