// components/checkout/AddressValidator.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocationServices } from '@/hooks/useLocationServices';
import { toast } from 'sonner';

interface AddressValidatorProps {
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  onValidated: (coordinates: { latitude: string; longitude: string }) => void;
  disabled?: boolean;
}

export const AddressValidator: React.FC<AddressValidatorProps> = ({
  address,
  onValidated,
  disabled = false
}) => {
  const [isValidated, setIsValidated] = useState(false);
  const { loading, validateAddress } = useLocationServices();

  const handleValidateAddress = async () => {
    if (!address.addressLine1 || !address.city || !address.state || !address.postalCode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    try {
      toast.info('Validating address...');
      
      const validationResult = await validateAddress({
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      });

      if (validationResult.isValid) {
        onValidated({
          latitude: validationResult.latitude,
          longitude: validationResult.longitude
        });
        setIsValidated(true);
        toast.success('✅ Address saved successfully!');
      } else {
        setIsValidated(false);
        toast.error('❌ Address could not be saved. Please check and try again.');
      }
    } catch (err: any) {
      setIsValidated(false);
      toast.error(`Validation failed: ${err.message}`);
    }
  };

  const isComplete = address.addressLine1 && address.city && address.state && address.postalCode;

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={handleValidateAddress}
        disabled={loading || !isComplete || disabled}
        variant={isValidated ? "default" : "secondary"}
        className="w-full"
      >
        {loading ? 'Saving...' : isValidated ? '✅ Address Saved' : 'Save Address'}
      </Button>
      
      {isValidated && (
        <div className="text-sm text-green-600 text-center">
          Address verified and coordinates obtained
        </div>
      )}
    </div>
  );
};
