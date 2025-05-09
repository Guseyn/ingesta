import { MongoClient } from 'mongodb';

export const MongoClientProvider = {
  provide: 'MONGO_CLIENT',
  useFactory: async () => {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    await client.connect();
    return client;
  },
};
