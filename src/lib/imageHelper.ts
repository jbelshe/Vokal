import { ImageSize } from '../types/imageSizes'

export function convertImagePath(path: string, maxQuality : ImageSize) : string {
    if (!path) return '';
    
    // Split the path by forward slashes and backslashes
    const parts = path.split(/[/\\]/);
    const filename = parts[parts.length - 1];
    parts.pop();
    const filepath = parts.join('/');
    // Extract the file extension
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Check if it's a valid image extension
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!imageExtensions.includes(extension)) {
        return path; // Return original if not a recognized image
    }
    // console.log("Start Path:", path);
    // console.log("NEW FILEPATH:", filepath + '/' + maxQuality + '.' + extension);
    // Add your image conversion logic here using maxQuality
    // For now, just return the original path
    return filepath + '/' + maxQuality + '.' + extension;
}