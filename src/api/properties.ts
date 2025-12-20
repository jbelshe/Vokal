import { supabase } from '../lib/supabase';
import { buildImageURL } from './images';
import { Property } from '../types/property';
import { DBVote } from '../types/vote';
import { ImageSize } from '../types/imageSizes'
import { convertImagePath } from '@/lib/imageHelper';

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'draft' | 'archived';
export type PropertySiteStatus = 'published' | 'unpublished' | 'featured';


/**
 * Fetches all properties from the Supabase "properties" table.
 * Returns an array of properties with their location data.
 */
export async function fetchProperties(profileId: string): Promise<Property[]> {
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
}, profileId: string): Promise<Property[]> {
  try {
    console.log('Fetching properties in bounds:', bounds, "for ", profileId);

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_image_links (
          is_cover,
          order_index,
          images (
            id,
            bucket,
            path
          )
        ),
        votes (
          user_id,
          choice, 
          free_text
        )
        `)
      .eq('site_status', 'active')
      .gte('latitude', bounds.minLat)
      .lte('latitude', bounds.maxLat)
      .gte('longitude', bounds.minLng)
      .lte('longitude', bounds.maxLng)
      .eq("votes.user_id", profileId);


    console.log("CHECK MY DATA", data);
    // console.log("CHECK MY DATA", data?.[0].votes);

        
    if (!data) {
      console.warn('No properties data returned from Supabase');
      return [];
    }
    console.log(`Successfully fetched ${data.length} properties in bounds`);

    // Map the raw data to Property objects
    const properties: Property[] = await Promise.all(
      data.map(async (property) => {
        // Sort property_image_links to get cover image first, then by order_index
        const sortedLinks = property.property_image_links?.length > 0
          ? [...property.property_image_links].sort((a, b) => {
              // First sort by is_cover (cover images first)
              if (a.is_cover && !b.is_cover) return -1;
              if (!a.is_cover && b.is_cover) return 1;
              // Then sort by order_index
              return (a.order_index || 0) - (b.order_index || 0);
            })
          : [];
        
        const link = sortedLinks?.[0];
        const img = link?.images;
        const bucket = img?.bucket;
        const path = img?.path;

        const voted_on = property.votes?.length > 0;
        const vote : DBVote | null = voted_on ? 
        {
            choice_id: property.votes?.[0].choice,
            free_text: property.votes?.[0].free_text
        }
        : null;

        const cover_image_path = path || "../assets/images/fillers/mc-shop-image1.png";
        const cover_image_url =  bucket && path ? convertImagePath(buildImageURL(bucket, path), ImageSize.SIZE_512) : '';
        const image_paths = bucket && sortedLinks && sortedLinks.length > 0 
          ? sortedLinks
              .filter((link: { images?: { path: string } }) => link?.images?.path)
              .map((link: { images: { path: string } }) => link.images.path)
          : [];
        const image_urls = image_paths && bucket 
          ? image_paths.map((path: string) => {
              return path ? buildImageURL(bucket, path) : '';
            }).filter((url: string) => url !== '')
          : [];

        return {
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
          description: property.description,
          owners_note: property.owners_note,
          link_type: property.link_type,
          link_url: property.link_url,
          cover_image_path,
          cover_image_url,
          tenant: property.tenant,
          image_paths,
          image_urls,
          estimated_open: property.estimated_open,
          created_at: property.created_at,
          last_edited: property.last_edited,
          vote: voted_on ? vote : null,

        };
      })
    );

    console.log('Mapped properties:', properties);
    return properties;
  } catch (err) {
    console.error('fetchPropertiesInBounds exception:', err);
    throw err;
  }
}



export async function fetchPropertiesForUser(userId: string, offset: number, limit: number = 10): Promise<Property[]> {
  try {
    console.log('Fetching properties for user:', userId, offset, limit);

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_image_links (
          is_cover,
          order_index,
          images (
            id,
            bucket,
            path
          )
        ),
        votes!inner (
          user_id,
          choice, 
          free_text,
          updated_at
        )
      `)
      .eq("votes.user_id", userId)
      // .range(offset, offset + limit - 1)
      .order('updated_at', { referencedTable: 'votes', ascending: false });

    console.log("Fetch properties query:", { userId, offset, limit, data });

    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }

    if (!data) {
      console.warn('No properties data returned from Supabase');
      return [];
    }
    console.log(`Successfully fetched ${data.length} properties in bounds`);

    // Map the raw data to Property objects
    const properties: Property[] = await Promise.all(
      data.map(async (property) => {
        // Sort property_image_links to get cover image first, then by order_index
        const sortedLinks = property.property_image_links?.length > 0
          ? [...property.property_image_links].sort((a, b) => {
              // First sort by is_cover (cover images first)
              if (a.is_cover && !b.is_cover) return -1;
              if (!a.is_cover && b.is_cover) return 1;
              // Then sort by order_index
              return (a.order_index || 0) - (b.order_index || 0);
            })
          : [];
        
        const link = sortedLinks?.[0];
        const img = link?.images;
        const bucket = img?.bucket;
        const path = img?.path;

        const voted_on = property.votes?.length > 0;
        const vote : DBVote | null = voted_on ? 
        {
            choice_id: property.votes?.[0].choice,
            free_text: property.votes?.[0].free_text
        }
        : null;

        const cover_image_path = path || "../assets/images/fillers/mc-shop-image1.png";
        const cover_image_url =  bucket && path ? convertImagePath(buildImageURL(bucket, path), ImageSize.SIZE_512) : '';
        const image_paths = bucket && sortedLinks && sortedLinks.length > 0 
          ? sortedLinks
              .filter((link: { images?: { path: string } }) => link?.images?.path)
              .map((link: { images: { path: string } }) => link.images.path)
          : [];
        const image_urls = image_paths && bucket 
          ? image_paths.map((path: string) => {
              return path ? buildImageURL(bucket, path) : '';
            }).filter((url: string) => url !== '')
          : [];

        return {
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
          description: property.description,
          owners_note: property.owners_note,
          link_type: property.link_type,
          link_url: property.link_url,
          cover_image_path,
          cover_image_url,
          tenant: property.tenant,
          image_paths,
          image_urls,
          estimated_open: property.estimated_open,
          created_at: property.created_at,
          last_edited: property.last_edited,
          vote: voted_on ? vote : null,

        };
      })
    );

    console.log('Mapped properties:', properties);
    return properties;
  } catch (err) {
    console.error('fetchPropertiesInBounds exception:', err);
    throw err;
  }
}