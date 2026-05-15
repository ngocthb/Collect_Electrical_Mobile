export interface SubCategory {
  id: string;
  name: string;
  parentCategoryId: string;
}

export interface SizeTier {
  id: string;
  name: string;
}

export interface Attribute {
  id: string;
  name: string;
  minValue: number;
}

export interface Category {
  id: string;
  name: string;
  parentCategoryId: string | null;
}

export interface AttributeOptionData {
  attributeId: string;
  optionId: string | null;
  value: number | null;
}

export interface AttributeOption {
  attributeOptionId: string;
  optionName: string;
}

export * from './Category';
