import { createGalleryHandler } from "@/server/handlers/gallery/createGallery";
import { deleteGalleryHandler } from "@/server/handlers/gallery/deleteGallery";
import { updateGalleryHandler } from "@/server/handlers/gallery/updateGallery";

export {
  createGalleryHandler as POST,
  deleteGalleryHandler as DELETE,
  updateGalleryHandler as PATCH,
};
