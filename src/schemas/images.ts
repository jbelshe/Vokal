export interface DatabaseImage {
    id: string;
    bucket: string;
    path: string;
    source: string;
    external_url: string;
    mime: string;
    width: number;
    height: number;
    size_bytes: number;
    checksum: string;
    status: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}