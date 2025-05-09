import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { S3Reader } from '../reader/S3Reader';
import { MongoIngestor } from '../ingestor/MongoIngestor';
import { City } from '../model/City';

@Injectable()
export class CityCron {
  private readonly logger = new Logger(CityCron.name);
  private isRunning = false;

  constructor(
    @Inject('CITY_READER') private readonly cityS3Reader: S3Reader<City>,
    @Inject('CITY_INGESTOR') private readonly cityMongoIngestor: MongoIngestor<City>,
  ) {}

  @Cron('0 */12 * * *') // every 12 hours
  async handleCron() {
    if (this.isRunning) {
      this.logger.warn('Previous job still running. Skipping...');
      return;
    }

    this.isRunning = true;
    this.logger.log('City Cron job started...');
    try {
      await this.cityS3Reader.streamJSON(async (city: City) => {
        await this.cityMongoIngestor.ingestByBatches(city);
      })
    } catch (error) {
      this.logger.error('Error in Property City job:', error);
    } finally {
      this.isRunning = false;
      this.logger.log('Property Cron job finished.');
    }
  }

  async runImmediately() {
    this.logger.log('Starting City Cron manually on module init...');
    await this.handleCron();
  }
}
