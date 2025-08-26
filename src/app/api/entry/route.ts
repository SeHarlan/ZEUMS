import { createEntryHandler } from "@/server/handlers/entry/createEntry";
import { deleteEntryHandler } from "@/server/handlers/entry/deleteEntry";
import { updateEntryHandler } from "@/server/handlers/entry/updateEntry";

export {
  createEntryHandler as POST,
  deleteEntryHandler as DELETE,
  updateEntryHandler as PATCH,
};
