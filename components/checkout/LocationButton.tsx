// components/checkout/LocationButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocationServices } from '@/hooks/useLocationServices';
import { toast } from 'sonner';

interface LocationButtonProps {
  onLocationDetected: (addressData: any) => void;
  disabled?: boolean;
  className?: string;
}

export const LocationButton: React.FC<LocationButtonProps> = ({
  onLocationDetected,
  disabled = false,
  className = ""
}) => {
  const { loading, getCurrentLocationAddress } = useLocationServices();

  const handleGetCurrentLocation = async () => {
    try {
      toast.info('Getting your current location...');
      
      const locationData = await getCurrentLocationAddress();
      
      // Parse the address and create addressData object
      const fullAddress = locationData.address.full_address || '';
      const addressParts = fullAddress.split(',').map(part => part.trim());
      
      // Extract city, state, postal code from the address
      // Only fill city, state, postal code, and country - NOT address fields
      const addressData = {
        addressLine1: '', // Don't auto-fill address fields
        addressLine2: '', // Don't auto-fill address fields
        city: extractCity(addressParts),
        state: extractState(addressParts),
        postalCode: extractPostalCode(fullAddress),
        country: 'India',
        latitude: locationData.coordinates.latitude,
        longitude: locationData.coordinates.longitude,
        landmark: ''
      };
      
      onLocationDetected(addressData);
      toast.success('Location detected successfully! Please verify the address details.');
      
    } catch (err: any) {
      console.error('Location detection error:', err);
      toast.error(`Failed to get location: ${err.message}`);
    }
  };

  // Helper functions to extract address components
  const extractCity = (parts: string[]) => {
    const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Gurgaon', 'Gurugram', 'Noida'];
    return parts.find(part => 
      indianCities.some(city => part.toLowerCase().includes(city.toLowerCase()))
    ) || parts[parts.length - 3] || '';
  };

  const extractState = (parts: string[]) => {
    return parts[parts.length - 2] || '';
  };

  const extractPostalCode = (address: string) => {
    const postalMatch = address.match(/\b\d{6}\b/);
    return postalMatch ? postalMatch[0] : '';
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGetCurrentLocation}
      disabled={loading || disabled}
      className={`w-full flex items-center justify-center gap-2 ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {loading ? 'Getting Location...' : 'Use My Current Location'}
    </Button>
  );
};
