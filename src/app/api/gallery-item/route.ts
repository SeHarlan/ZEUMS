import { createGalleryItemHandler } from "@/server/handlers/galleryItem/createGalleryItem";
import { deleteGalleryItemHandler } from "@/server/handlers/galleryItem/deleteGalleryItem";
import { updateGalleryItemHandler } from "@/server/handlers/galleryItem/updateGalleryItem";

export {
  createGalleryItemHandler as POST,
  deleteGalleryItemHandler as DELETE,
  updateGalleryItemHandler as PATCH,
};