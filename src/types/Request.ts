import { TimeSlot } from '../types/TimeSlot';
import { AttributeOptionData } from './Category';

export type CreateRequestPayload = {
  senderId?: string;
  name?: string;
  description?: string;
  address?: string;
  images?: string[];
  collectionSchedule?: TimeSlot[];
  product?: {
    parentCategoryId?: string;
    subCategoryId?: string;
    sizeTierId?: string | null;
    brandId?: string;
    attributes?: AttributeOptionData[];
  };
};

export * from './Request';
