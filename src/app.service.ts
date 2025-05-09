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
  priceSegment?: 'high' | 'medium' | 'low' ;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class AppService {
  constructor(
    @Inject('MONGO_CLIENT') private readonly client: MongoClient
  ) {}

  public async getProperties({ id, name, country, city, isAvailable, minPrice, maxPrice }: PropertyRequest) {
    const db = this.client.db(process.env.DB_NAME || 'db');
    const collection = db.collection(PROPERTY_COLLECTION_NAME);

    const filter: any = {};

    if (id !== undefined) {
      filter.id = id;
    }

    if (name !== undefined) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable;
    }

    if (country !== undefined || city !== undefined) {
      if (country !== undefined) {
        filter['address.country'] = { $regex: country, $options: 'i' };
      }
      if (city !== undefined) {
        filter['address.city'] = { $regex: city, $options: 'i' };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.priceForNight = {};
      if (minPrice !== undefined) {
        filter.priceForNight.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.priceForNight.$lte = maxPrice;
      }
    }

    return await collection.find(filter).toArray()
  }

  public async getCities({ id, city, availability, priceSegment, minPrice, maxPrice }: CityRequest) {
    const db = this.client.db(process.env.DB_NAME || 'db');
    const collection = db.collection(CITY_COLLECTION_NAME);

    const filter: any = {};

    if (id !== undefined) {
      filter.id = id;
    }

    if (city !== undefined) {
      filter.city = { $regex: city, $options: 'i' };;
    }

    if (availability !== undefined) {
      filter.availability = availability;
    }

    if (priceSegment !== undefined) {
      filter.priceSegment = priceSegment;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNight = {};
      if (minPrice !== undefined) {
        filter.pricePerNight.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.pricePerNight.$lte = maxPrice;
      }
    }

    return await collection.find(filter).toArray()
  }
}
