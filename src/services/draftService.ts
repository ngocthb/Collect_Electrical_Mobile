// Lightweight draft storage for forms (CreateAddress / CreateRequest)
// Uses AsyncStorage if available, falls back to in-memory store.
import { Platform } from 'react-native';

type CreateAddressDraft = {
  name?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

type CreateRequestDraft = {
  name?: string;
  category?: string;
  description?: string;
  address?: string;
  images?: any[];
  timeSlots?: Record<string, string[]>;
};

let AsyncStorage: any;
try {
  // optional dependency
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const MEM: Record<string, any> = {};

const storageGet = async (key: string) => {
  if (AsyncStorage) {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
  return MEM[key] ?? null;
};

const storageSet = async (key: string, val: any) => {
  if (AsyncStorage) {
    await AsyncStorage.setItem(key, JSON.stringify(val));
    return;
  }
  MEM[key] = val;
};

const storageRemove = async (key: string) => {
  if (AsyncStorage) {
    await AsyncStorage.removeItem(key);
    return;
  }
  delete MEM[key];
};

const ADDR_KEY = 'draft:create_address';
const REQ_KEY = 'draft:create_request';

const saveCreateAddressDraft = async (d: CreateAddressDraft) => {
  try {
    await storageSet(ADDR_KEY, d);
  } catch (e) {
    // ignore
  }
};

const getCreateAddressDraft = async (): Promise<CreateAddressDraft | null> => {
  try {
    return await storageGet(ADDR_KEY);
  } catch (e) {
    return null;
  }
};

const clearCreateAddressDraft = async () => {
  try {
    await storageRemove(ADDR_KEY);
  } catch (e) {
    // ignore
  }
};

const saveCreateRequestDraft = async (d: CreateRequestDraft) => {
  try {
    await storageSet(REQ_KEY, d);
  } catch (e) {
    // ignore
  }
};

const getCreateRequestDraft = async (): Promise<CreateRequestDraft | null> => {
  try {
    return await storageGet(REQ_KEY);
  } catch (e) {
    return null;
  }
};

const clearCreateRequestDraft = async () => {
  try {
    await storageRemove(REQ_KEY);
  } catch (e) {
    // ignore
  }
};

export default {
  // address
  saveCreateAddressDraft,
  getCreateAddressDraft,
  clearCreateAddressDraft,
  // request
  saveCreateRequestDraft,
  getCreateRequestDraft,
  clearCreateRequestDraft,
};
