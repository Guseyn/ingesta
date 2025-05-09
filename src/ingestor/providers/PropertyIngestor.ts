import { MongoClient } from 'mongodb';
import { MongoIngestor } from '../MongoIngestor';
import { PROPERTY_COLLECTION_NAME } from '../../model/Property';

export const PropertyIngestor = {
  provide: 'PROPERTY_INGESTOR',
  useFactory: (client: MongoClient) => {
    return new MongoIngestor(client, PROPERTY_COLLECTION_NAME, 100);
  },
  inject: ['MONGO_CLIENT'],
};
