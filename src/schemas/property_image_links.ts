export interface PropertyImageLink {
    id: string;
    property_id: string;
    image_id: string;
    is_cover: boolean;
    order_index: number;
    caption?: string;
    alt_text?: string;
    created_at: string;
}