type Address = {
  id: number;
  name: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  outdated: boolean;
};

let nextId = 100;

let store: Address[] = [
  {
    id: 1,
    name: 'Trần Ngọc',
    phone: '+84 949 306 739',
    address:
      'Trường mầm non Tuổi Thơ KP3, Phường Trảng Dài, Thành Phố Biên Hòa, Đồng Nai',
    latitude: 10.954,
    longitude: 106.862,
    outdated: true,
  },
  {
    id: 2,
    name: 'Trần Ngọc',
    phone: '+84 949 117 939',
    address:
      'Gần Trường Tiểu Học Trảng Dài, Đường Nguyễn Khuyến, Phường Trảng Dài, Thành Phố Biên Hòa, Đồng Nai',
    latitude: 10.9535,
    longitude: 106.863,
    outdated: false,
  },
  {
    id: 3,
    name: 'Nguyễn Hoàng Minh Thư',
    phone: '+84 948 855 509',
    address:
      'Vinhomes Grand Park, Nguyễn Xiển Tòa S902, Phường Long Thạnh Mỹ, Thành Phố Thủ Đức, TP. Hồ Chí Minh',
    latitude: 10.8205,
    longitude: 106.7683,
    outdated: false,
  },
];

const delay = (ms = 200) =>
  new Promise<void>(res => setTimeout(() => res(), ms));

const list = async (): Promise<Address[]> => {
  await delay();
  // return a shallow copy
  return [...store];
};

const get = async (id: number): Promise<Address | undefined> => {
  await delay();
  return store.find(s => s.id === id);
};

const create = async (data: Partial<Address>): Promise<Address> => {
  await delay();
  const newItem: Address = {
    id: nextId++,
    name: data.name || 'Người dùng',
    phone: data.phone || '+84 900 000 000',
    address: data.address || 'Địa chỉ mới',
    latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
    longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
    outdated: !!data.outdated,
  };
  store = [newItem, ...store];
  return newItem;
};

const update = async (
  id: number,
  patch: Partial<Address>,
): Promise<Address | undefined> => {
  await delay();
  let updated: Address | undefined;
  store = store.map(item => {
    if (item.id === id) {
      updated = { ...item, ...patch };
      return updated;
    }
    return item;
  });
  return updated;
};

const remove = async (id: number): Promise<boolean> => {
  await delay();
  const before = store.length;
  store = store.filter(s => s.id !== id);
  return store.length < before;
};

export default {
  list,
  get,
  create,
  update,
  remove,
};
