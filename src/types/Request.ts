import { TimeSlot } from '../types/TimeSlot';

export type CreateRequestPayload = {
  senderId?: string;
  name: string;
  description?: string;
  address?: string;
  images?: string[];
  collectionSchedule?: TimeSlot[];
  product?: {
    parentCategoryId?: string;
    subCategoryId?: string;
    sizeTierId?: string | null;
    attributes?: Array<{
      attributeId: string;
      value: string;
    }>;
  };
};

export * from './Request';
