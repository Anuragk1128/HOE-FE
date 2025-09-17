// hooks/useLocationServices.ts
import { useState, useCallback } from 'react';

interface LocationCoordinates {
  latitude: string;
  longitude: string;
  accuracy?: number;
}

interface AddressData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface GeocodeResult {
  latitude: string;
  longitude: string;
  full_address: string;
  place_formatted?: string;
  isValid: boolean;
}

interface ReverseGeocodeResult {
  full_address: string;
  place_formatted: string;
  coordinates: [number, number];
}

export const useLocationServices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hoe-be.onrender.com';

  const getCurrentLocation = useCallback((): Promise<LocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage: string;
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage = "An unknown error occurred";
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  const validateAddress = useCallback(async (addressData: AddressData): Promise<GeocodeResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/geocoding/validate-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Address validation failed');
      }

      return data.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const getAddressFromCoordinates = useCallback(async (latitude: string, longitude: string): Promise<ReverseGeocodeResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/geocoding/reverse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Address lookup failed');
      }

      return data.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const getCurrentLocationAddress = useCallback(async () => {
    try {
      setLoading(true);
      const coordinates = await getCurrentLocation();
      const addressData = await getAddressFromCoordinates(
        coordinates.latitude, 
        coordinates.longitude
      );
      
      return {
        coordinates,
        address: addressData
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCurrentLocation, getAddressFromCoordinates]);

  return {
    loading,
    error,
    getCurrentLocation,
    validateAddress,
    getAddressFromCoordinates,
    getCurrentLocationAddress
  };
};
