import { MongoClient } from 'mongodb';
import { MongoIngestor } from '../MongoIngestor';
import { CITY_COLLECTION_NAME } from '../../model/City';

export const CityIngestor = {
  provide: 'CITY_INGESTOR',
  useFactory: (client: MongoClient) => {
    return new MongoIngestor(client, CITY_COLLECTION_NAME, 100);
  },
  inject: ['MONGO_CLIENT'],
};
