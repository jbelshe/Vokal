import { DatabaseImage } from '../schemas/images';
import { DBVote } from '../types/vote';


export interface Property {
  id: string;
  title: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  county: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  listed_by?: string; // UUID of the profile
  site_status: string;
  status: string;
  category?: string; // UUID of the category
  description?: string;
  owners_note?: string;
  instagram_link?: string;
  estimated_open?: string;
  cover_image?: DatabaseImage;
  cover_image_path?: string;
  cover_image_url?: string;
  image_paths?: Array<string>;
  image_urls?: Array<string>;
  created_at: string; // ISO date string
  last_edited: string; // ISO date string
  vote: DBVote | null;
  [key: string]: any; // Allow for additional properties from the database
}