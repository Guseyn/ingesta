import {
  Inject,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { MongoClientProvider } from './MongoClientProvider';
import { MongoClient } from 'mongodb';

@Module({
  providers: [MongoClientProvider],
  exports: ['MONGO_CLIENT'],
})
export class MongoModule implements OnModuleInit, OnApplicationShutdown {
  constructor(@Inject('MONGO_CLIENT') private readonly client: MongoClient) {}

  onModuleInit() {
    console.log('MongoModule initialized');
  }

  async onApplicationShutdown(signal: string) {
    console.log(`Closing MongoDB connection due to ${signal}...`);
    await this.client.close();
  }
}
