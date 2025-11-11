import { getMintDatesHandler } from "@/server/handlers/assets/getMintDates";
import { updateEntryDatesHandler } from "@/server/handlers/entry/updateEntryDates";

export {
  updateEntryDatesHandler as PATCH,
  getMintDatesHandler as POST,
};
