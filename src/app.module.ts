import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertyIngestor } from './ingestor/providers/PropertyIngestor';
import { MongoClientProvider } from './mongo/MongoClientProvider';
import { CityIngestor } from './ingestor/providers/CityIngestor';
import { PropertyReader } from './reader/providers/PropertyReader';
import { CityReader } from './reader/providers/CityReader';
import { ScheduleModule } from '@nestjs/schedule';
import { CityCron } from './cron/CityCron';
import { PropertyCron } from './cron/PropertyCron';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MongoClientProvider,
    PropertyReader,
    CityReader,
    PropertyIngestor,
    CityIngestor,
    PropertyCron,
    CityCron
  ],
})
export class AppModule {}
