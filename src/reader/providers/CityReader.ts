import { S3Reader } from '../S3Reader';
import { City } from '../../model/City';

export const CityReader = {
  provide: 'CITY_READER',
  useFactory: () => {
    return new S3Reader<City>(
      'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json'
    );
  },
  inject: [],
};
