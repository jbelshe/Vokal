
import { supabase } from '../lib/supabase';
import { DatabaseImage } from '../schemas/images';

export async function getImageURL(bucket: string, path: string): Promise<string> {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 60*60);
        console.log("Signed Image URL:", data?.signedUrl);
        return data?.signedUrl || '';
    } catch (error) {
        console.error('Error generating image URL:', error);
        return '';
    }
}

export function buildImageURL(bucket: string, path: string): string {
    const projectUrl = process.env.EXPO_PUBLIC_SUPABASE_URL; 
    return `${projectUrl}/storage/v1/object/public/${bucket}/${path}`;
}


// In api/images.ts
export async function fetchCoverImage(propertyId: string): Promise<DatabaseImage> {
    console.log("Property ID:", propertyId);
    const { data, error } = await supabase
        .from("property_image_links")
        .select(`
            images (
                id,
                bucket,
                path,
                width,
                height,
                mime
            )
        `)
        .eq("property_id", propertyId)
        .eq("is_cover", true)
        .single<{ images: DatabaseImage }>();


    console.log("Cover Image Data:", data?.images);
    if (error) throw error;

    return data?.images;
}
