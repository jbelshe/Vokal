// hooks/useUserLocation.ts
import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
  errorMessage: string | null;
};

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    status: 'idle',
    errorMessage: null,
  });

  const requestLocation = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'requesting', errorMessage: null }));

      // 1. Check existing permission
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

      let finalStatus = existingStatus;

      // 2. If not granted, request it
      if (existingStatus !== 'granted') {
        const { status: requestedStatus } = await Location.requestForegroundPermissionsAsync();
        finalStatus = requestedStatus;
      }

      if (finalStatus !== 'granted') {
        setState(prev => ({
          ...prev,
          status: 'denied',
          errorMessage: 'Location permission not granted.',
        }));
        return null;
      }

      // 3. Permission granted → get current position
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = pos.coords;

      setState({
        latitude,
        longitude,
        status: 'granted',
        errorMessage: null,
      });

      return { latitude, longitude };
    } catch (err: any) {
      console.error('Error getting location', err);
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err?.message ?? 'Failed to get location.',
      }));
      return null;
    }
  }, []);

  return {
    ...state,
    requestLocation,
  };
}
