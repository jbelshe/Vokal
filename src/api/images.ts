
import { supabase } from '../lib/supabase';
import { DatabaseImage } from '../schemas/images';

export async function getImageURL(bucket: string, path: string): Promise<string> {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 60*60);
        console.log("Image URL:", data?.signedUrl);
        return data?.signedUrl || '';
    } catch (error) {
        console.error('Error generating image URL:', error);
        return '';
    }
}


// https://wjhnxvtqvehvhvhlwosk.supabase.co/storage/v1/object/sign/properties_bucket/property_images/62053829-fad1-4463-8269-ebbd1cae098c/83309cea-1064-45c8-b3c6-18fa5d933509/original.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mZmNkZWQwYi1kZTg1LTRkMDgtYTIzMi1kNWU0OTg2NDIyOTQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9wZXJ0aWVzX2J1Y2tldC9wcm9wZXJ0eV9pbWFnZXMvNjIwNTM4MjktZmFkMS00NDYzLTgyNjktZWJiZDFjYWUwOThjLzgzMzA5Y2VhLTEwNjQtNDVjOC1iM2M2LTE4ZmE1ZDkzMzUwOS9vcmlnaW5hbC5qcGVnIiwiaWF0IjoxNzYzNTkzNDQ4LCJleHAiOjE3NjM1OTcwNDh9.pJfsmK5_AoZXRqJkJlcb8vieoYyOkw33pWIs7RoXWMk"
// https://wjhnxvtqvehvhvhlwosk.supabase.co/storage/v1/object/sign/properties_bucket/property_images/0996f31d-5e23-4f93-9e3f-3780fcb739ca/1fe873b5-de1c-4392-b436-8c6bb944f0d8/1024.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mZmNkZWQwYi1kZTg1LTRkMDgtYTIzMi1kNWU0OTg2NDIyOTQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9wZXJ0aWVzX2J1Y2tldC9wcm9wZXJ0eV9pbWFnZXMvMDk5NmYzMWQtNWUyMy00ZjkzLTllM2YtMzc4MGZjYjczOWNhLzFmZTg3M2I1LWRlMWMtNDM5Mi1iNDM2LThjNmJiOTQ0ZjBkOC8xMDI0LmpwZWciLCJpYXQiOjE3NjM1OTMzNjEsImV4cCI6MTc2NDE5ODE2MX0.c2fEi5bbXdkFFhj9nVugrQoQbRe4gnKJ549zyoQDz4g


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

// export async function getImageURL(bucket: string, path: string): Promise<string> {
//     if (!bucket || !path) return '';
//     try {
//         const { data } = supabase.storage
//             .from(bucket)
//             .getPublicUrl(path);
//         console.log("Image URL:", data);
//         return data.publicUrl;
//     } catch (error) {
//         console.error('Error generating image URL:', error);
//         return '';
//     }
// }



// export async function fetchPropertyImages(propertyId: string): Promise<string[]> {
//   const { data, error } = await supabase
//     .from('property_images')
//     .select(`
//         id,
//         order_index,
//         is_cover,
//         caption,
//         alt_text,
//         images (
//             id,
//             bucket,
//             path,
//             width,
//             height,
//             mime
//         )
//     `)
//     .eq('id', propertyId)
//     .order('order_index', { ascending: true });
//   if (error) throw error;
//   return data?.map(img => img.images[0].path) || [];
// }