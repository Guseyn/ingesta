import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { S3Reader } from '../reader/S3Reader';
import { Property } from '../model/Property';
import { MongoIngestor } from '../ingestor/MongoIngestor';

@Injectable()
export class PropertyCron {
  private readonly logger = new Logger(PropertyCron.name);
  private isRunning = false;

  constructor(
    @Inject('PROPERTY_READER')
    private readonly propertyS3Reader: S3Reader<Property>,
    @Inject('PROPERTY_INGESTOR')
    private readonly propertyMongoIngestor: MongoIngestor<Property>,
  ) {}

  @Cron('0 */12 * * *') // every 12 hours
  async handleCron() {
    if (this.isRunning) {
      this.logger.warn('Previous job still running. Skipping...');
      return;
    }

    this.isRunning = true;
    this.logger.log('Property Cron job started...');
    try {
      await this.propertyS3Reader.streamJSON(async (property: Property) => {
        await this.propertyMongoIngestor.ingestByBatches(property);
      });
    } catch (error) {
      this.logger.error('Error in Property Cron job:', error);
    } finally {
      this.isRunning = false;
      this.logger.log('Property Cron job finished.');
    }
  }

  async runImmediately() {
    this.logger.log('Starting Property Cron manually on module init...');
    await this.handleCron();
  }
}
