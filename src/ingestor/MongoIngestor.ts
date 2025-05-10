import { Inject } from '@nestjs/common';
import { MongoClient, OptionalId, Document } from 'mongodb';
import * as process from 'node:process';

export class MongoIngestor<T> {
  private readonly batch: T[] = [];
  private readonly batchSize;
  private readonly dbName: string;
  private readonly collectionName: string;

  constructor(
    @Inject('MONGO_CLIENT') private readonly client: MongoClient,
    collectionName: string,
    batchSize?: number,
  ) {
    this.dbName = process.env.DB_NAME || 'db';
    this.collectionName = collectionName;
    this.batchSize = batchSize || 100;
  }

  public async ingestByBatches(document: T, done: boolean): Promise<void> {
    this.batch.push(document);

    if (this.batch.length >= this.batchSize || done) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const db = this.client.db(this.dbName);
    const collection = db.collection(this.collectionName);

    try {
      await collection.bulkWrite(
        (this.batch as OptionalId<Document>[]).map(
          (doc: OptionalId<Document>) => ({
            updateOne: {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              filter: { id: doc.id },
              update: { $set: doc },
              upsert: true,
            },
          }),
        ),
      );
      console.log(
        `inserted ${this.batch.length} documents to ${this.collectionName}`,
      );
    } catch (error) {
      console.error('Failed to insert batch:', error);
    }

    this.batch.length = 0;
  }
}
