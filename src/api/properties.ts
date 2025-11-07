import { supabase } from '../lib/supabase';
import { Image } from 'react-native'

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'draft' | 'archived';
export type PropertySiteStatus = 'published' | 'unpublished' | 'featured';

export interface PropertyImage {
  source: any;
  alt?: string;  // Optional alt text
}

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
  listed_by ?: string; // UUID of the profile
  site_status: string;
  status: string;
  category?: string; // UUID of the category
  description?: string;
  owners_note?: string;
  instagram_link?: string;
  estimated_open?: string;
  images?: Array<PropertyImage>;
  created_at: string; // ISO date string
  last_edited: string; // ISO date string
  [key: string]: any; // Allow for additional properties from the database
}

/**
 * Fetches all properties from the Supabase "properties" table.
 * Returns an array of properties with their location data.
 */
export async function fetchProperties(): Promise<Property[]> {
  try {
    console.log('Fetching properties from Supabase...');
    
    const { data, error } = await supabase
      .from('properties')
      .select('*');

    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }

    if (!data) {
      console.warn('No properties data returned from Supabase');
      return [];
    }

    console.log(`Successfully fetched ${data.length} properties`);
    return data.map((property) => ({
      id: property.id,
      latitude: property.latitude,
      longitude: property.longitude,
      address: property.address || property.address_line || property.location || undefined,
      ...property, // Include all other fields from the database
    }));
  } catch (err) {
    console.error('fetchProperties exception:', err);
    throw err;
  }
}

/**
 * Fetches properties within a bounding box (for visible map area + buffer).
 * This is used to load properties only for the visible map region plus neighboring off-screen locations.
 */
export async function fetchPropertiesInBounds(bounds: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}): Promise<Property[]> {
  try {
    console.log('Fetching properties in bounds:', bounds);
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('site_status', 'active')
      .gte('latitude', bounds.minLat)
      .lte('latitude', bounds.maxLat)
      .gte('longitude', bounds.minLng)
      .lte('longitude', bounds.maxLng);
  
    if (error) {
      console.error('Error fetching properties in bounds:', error);
      throw error;
    }

    if (!data) {
      console.warn('No properties data returned from Supabase');
      return [];
    }

    console.log(`Successfully fetched ${data.length} properties in bounds`);
    const my_images = [
        require("../assets/images/fillers/mc-shop-image.png"), 
        require("../assets/images/fillers/mc-shop-image1.png"), 
        require("../assets/images/fillers/mc-shop-image.png"), 
        require("../assets/images/fillers/mc-shop-image1.png")
    ]
    // Map the raw data to Property objects
    const properties: Property[] = data.map((property) => ({
      id: property.id,
      title: property.title,
      address_1: property.address_1,
      address_2: property.address_2,
      city: property.city,
      state: property.state,
      county: property.county,
      postal_code: property.postal_code,
      latitude: property.latitude,
      longitude: property.longitude,
      listed_by: property.listed_by,
      site_status: property.site_status,
      status: property.status,
      category: property.category,
      description: property.description,
      owners_note: property.owners_note,
      instagram_link: property.instagram_link,
      
      images: my_images.map((img, index) => ({
        source: img,
        alt: `Property image ${index + 1}`,
      })) || [],
      estimated_open: property.estimated_open,
      created_at: property.created_at,
      last_edited: property.last_edited
    }));

    //console.log('Mapped properties:', properties);
    return properties;
  } catch (err) {
    console.error('fetchPropertiesInBounds exception:', err);
    throw err;
  }
}
