import User from "./User";
import Entry from "./Entry/Entry";
import Wallet from "./Wallet"; 
import AuthUser from "./AuthUser";
import GalleryItem from "./Gallery/GalleryItem";
import Gallery from "./Gallery/Gallery";


// Force model initialization
const models = {
  User,
  Entry,
  Wallet, 
  AuthUser,
  GalleryItem,
  Gallery,
};

export default models;
