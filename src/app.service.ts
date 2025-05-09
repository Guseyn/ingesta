import { Inject, Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { PROPERTY_COLLECTION_NAME } from './model/Property';
import { CITY_COLLECTION_NAME } from './model/City';
import * as process from 'node:process';

interface PropertyRequest {
  id?: number;
  name?: string;
  country?: string;
  city?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

interface CityRequest {
  id?: string;
  city?: string;
  availability?: boolean;
  priceSegment?: 'high' | 'medium' | 'low';
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class AppService {
  constructor(@Inject('MONGO_CLIENT') private readonly client: MongoClient) {}

  public async getProperties({
    id,
    name,
    country,
    city,
    isAvailable,
    minPrice,
    maxPrice,
  }: PropertyRequest) {
    const db = this.client.db(process.env.DB_NAME || 'db');
    const collection = db.collection(PROPERTY_COLLECTION_NAME);

    const filter: any = {};

    if (id !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.id = id;
    }

    if (name !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.name = { $regex: name, $options: 'i' };
    }

    if (isAvailable !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.isAvailable = isAvailable;
    }

    if (country !== undefined || city !== undefined) {
      if (country !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter['address.country'] = { $regex: country, $options: 'i' };
      }
      if (city !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter['address.city'] = { $regex: city, $options: 'i' };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.priceForNight = {};
      if (minPrice !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.priceForNight.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.priceForNight.$lte = maxPrice;
      }
    }

    return await collection.find(filter).toArray();
  }

  public async getCities({
    id,
    city,
    availability,
    priceSegment,
    minPrice,
    maxPrice,
  }: CityRequest) {
    const db = this.client.db(process.env.DB_NAME || 'db');
    const collection = db.collection(CITY_COLLECTION_NAME);

    const filter: any = {};

    if (id !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.id = id;
    }

    if (city !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.city = { $regex: city, $options: 'i' };
    }

    if (availability !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.availability = availability;
    }

    if (priceSegment !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.priceSegment = priceSegment;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.pricePerNight = {};
      if (minPrice !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.pricePerNight.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.pricePerNight.$lte = maxPrice;
      }
    }

    return await collection.find(filter).toArray();
  }
}
