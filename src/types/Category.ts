export type SubCategory = {
  id: string;
  name: string;
  parentCategoryId: string;
};

export type SizeTier = {
  id: string;
  name: string;
};

export type Attribute = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  parentCategoryId: string | null;
};

export type AttributeOptionData = {
  attributeId: string;
  optionId: string | null;
  value: number | null;
};

export type AttributeOption = {
  attributeOptionId: string;
  optionName: string;
};

export * from './Category';
