export interface City {
  id: string;
  city: string;
  availability: boolean;
  priceSegment: 'high' | 'medium' | 'low';
  pricePerNight: number;
}

export const CITY_COLLECTION_NAME = 'cities';
