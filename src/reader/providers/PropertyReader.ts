import { S3Reader } from '../S3Reader';
import { Property } from '../../model/Property';

export const PropertyReader = {
  provide: 'PROPERTY_READER',
  useFactory: () => {
    return new S3Reader<Property>(
      'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json',
    );
  },
  inject: [],
};
