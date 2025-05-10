# Ingesta

# Tech Stack
1. TypeScript
1. NestJS
1. MongoDB 
1. Docker
1. Swagger
1. @nestjs/schedule
1. mongo-migrate library

# Build and Run in Docker

I decided to build and run everything in Docker to make the project self-contained.  
In the `docker-compose.yml` file, you can see two containers: one for MongoDB, and the other for the application itself. In `Dockerfile.dev`, I use the following command:

```bash
CMD ["npm", "run", "start:dev"]
```

This ensures that the app running in the container restarts automatically on any code change. This setup is primarily intended for development only.

To start the entire application, run the following command:

```bash
npm run docker:up
```

App available at http://localhost:3000
Swagger UI available at http://localhost:3000/api

# Application Logic

1. We run MongoDB migrations, where we add indices on main properties, it will allow us to perform quicker searches. I am using good old `mongo-migrate` library.
2. We create NestJS app structure.
3. We create validation pipe for requests, it will allow us to reduce boilerplate for handling `400` Bad Request requests.
4. We setup Swagger, so that we can easily test our APIs.
5. We run server on 3000 port.
6. We run cron jobs after. Cron Jobs also run every 12 hours.

# Project Structure

1. `src/cron` directory contains all cron jobs.
2. `src/dto` directory contains all DTOs for requests in our endpoints.
3. `src/ingestor` directory contains providers for ingesting the data into MongoDB.
4. `src/model` directory contains all models that we want to ingest.
5. `src/mongo` directory contains MongoDb provider.
6. `src/reader` directory contains all providers for reading the data from AWS S3.
7. `src/app.controller.ts` contains all endpoints for querying our models.
8. `src/app.module.ts` contains all dependencies and their configurations.
9. `src/app.service.ts` contains all the business logic for controllers.
10. `src/main.ts` bootstraps whole application.
11. `src/runMigrations.ts` contains logic for running migrations.

# How We Read from AWS S3

Files in S3 can be huge, so the best approach would be streaming them. The logic of reading is in `src/reader/S3Reader.ts`.

While we stream our `response.body`, on each `chunk` we call `parseJSONArrayStreamChunk` function. 
This is my custom parser, it's suited only for array of objects (which can be nested). 

Each `chunk` can be incomplete piece of JSON, so this function is quite smart to buffer pieces of JSON that can be parsed.

# How We Write to MongoDB

On each parsed object, we call ingestor, that fills batches of objects. Once it reaches its `batchSize` (100 by default), it ingest the whole batch.
in `src/ingestor/MongoIngestor.ts`, you can see how it works. We are using `collection.bulkWrite` to write many documents at once, and we also updating documents by id to avoid duplicates.
The only thing that we don't do is deleting obsolete documents, since it would require a lot more time.

# How to Add a New Model

Let's say, you want to work with a new model `Restaurant`, which you need read from AWS S3 and ingest it into MongoDB.

Below, you can see following steps that can help you to achieve that:

1. Add a Model `Restaurant` into `model` directory:

```ts
export interface Restaurant {
  id: string;
  country: string;
  city: string;
  availability: boolean;
  priceSegment: 'high' | 'medium' | 'low';
}

export const RESTAURANY_COLLECTION_NAME = 'restaurants';
```

2. Add a provider in `reader/provider` directory that corresponds to a new model:

```ts
export const RestaurantReader = {
  provide: 'RESTAURANT_READER',
  useFactory: () => {
    return new S3Reader<Restuarant>(
      'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/restaurants.json'
    );
  },
  inject: [],
};
```

3. Add a provider in `ingestor/providers` directory that correspond to a new model:

```ts
export const RestaurantIngestor = {
  provide: 'RESTAURANT_INGESTOR',
  useFactory: (client: MongoClient) => {
    return new MongoIngestor(client, RESTAURANT_COLLECTION_NAME, 100);
  },
  inject: ['MONGO_CLIENT'],
};

```

4. Add a cron job in `cron` directory:

```ts
@Injectable()
export class RestaurantCron {
  private readonly logger = new Logger(RestaurantCron.name);
  private isRunning = false;

  constructor(
    @Inject('RESTAURANT_READER') private readonly restaurantS3Reader: S3Reader<Restuarant>,
    @Inject('RESTAURANT_INGESTOR') private readonly restaurantMongoIngestor: MongoIngestor<Restuarant>,
  ) {}

  @Cron('0 */12 * * *') // every 12 hours
  async handleCron() {
    if (this.isRunning) {
      this.logger.warn('Previous job still running. Skipping...');
      return;
    }

    this.isRunning = true;
    this.logger.log('Restaurant Cron job started...');
    try {
      await this.restaurantS3Reader.streamJSON(async (restaurant: Restaurant) => {
        await this.restaurantMongoIngestor.ingestByBatches(restaurant);
      })
    } catch (error) {
      this.logger.error('Error in Restaurant Cron job:', error);
    } finally {
      this.isRunning = false;
      this.logger.log('Restaurant Cron job finished.');
    }
  }

  async runImmediately() {
    this.logger.log('Starting Restaurant Cron manually on module init...');
    await this.handleCron();
  }
}
```

As you can see, main logic in the lines:

```ts
await this.restaurantS3Reader.streamJSON(async (restaurant: Restaurant) => {
  await this.restaurantMongoIngestor.ingestByBatches(restaurant);
})
```

The code above can be read in the following way:
```text
1. We read stream from JSON file on S3
2. On each parsed object, we call ingestion process
3. Ingestion process fills a batch of objects, once it reaches its max capacity(100 by default), it ingests the whole batch of objects into MongoDB
```

5. In `main.ts`, you can run new cron job:

```ts
const propertyCron = app.get(PropertyCron);
const cityCron = app.get(CityCron);
const restaurantCron = app.get(RestaurantCron);
await Promise.all([
  propertyCron.runImmediately(),
  cityCron.runImmediately(),
  restaurantCron.runImmediately()
]);
```

6. In `app.module.ts`, add all the new providers and the new cron job.

7. Add new controller with swagger in `app.controller.ts`.
