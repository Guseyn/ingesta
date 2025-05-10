import { MongoClient } from 'mongodb';
import { MongoIngestor } from '../MongoIngestor';
import { City, CITY_COLLECTION_NAME } from '../../model/City';

export const CityIngestor = {
  provide: 'CITY_INGESTOR',
  useFactory: (client: MongoClient) => {
    return new MongoIngestor<City>(client, CITY_COLLECTION_NAME, 100);
  },
  inject: ['MONGO_CLIENT'],
};
