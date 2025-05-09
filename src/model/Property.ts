export interface Property {
  id: number;
  name: string;
  address: {
    country: string;
    city: string;
  };
  isAvailable: boolean;
  priceForNight: number;
}

export const PROPERTY_COLLECTION_NAME = 'properties';
