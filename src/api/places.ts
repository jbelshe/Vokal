
const supabasePublicKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY!;
import { Platform } from "react-native";

export async function fetchPlaces(input: string): Promise<any> {

    try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            input
        )}&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY}&types=geocode`;

        const res = await fetch(url);
        const json = await res.json();

        console.log('Places API response:', json);

        return json;

    }
    catch (error) {
        console.error('Places API error:', error);
        throw error;
    }
}


type PlacePrediction = {
    description: string;
    place_id: string;
};

export async function fetchPredictedPlace(prediction: PlacePrediction) : Promise<any> {

    const key = Platform.OS === "android" ?
        process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_ANDROID :
        process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id
        }&key=${key}&fields=geometry/location,name,formatted_address`;

    const res = await fetch(detailsUrl);
    const json = await res.json();

    if (json.status !== 'OK') {
        console.warn('Place details error:', json.status, json.error_message);
        return;
    }
    return json

}