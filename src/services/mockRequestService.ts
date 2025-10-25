type RequestItem = {
  id: number;
  name: string;
  category?: string;
  description?: string;
  image?: any; // primary thumbnail for lists
  time: string; // human-friendly time
  address?: string;
  images?: any[]; // array of local require or uri
  timeSlots?: Record<string, string[]>;
  status: string;
};

let nextId = 1000;

let store: RequestItem[] = [
  {
    id: 1,
    name: 'Tủ lạnh cũ',
    category: 'Gia dụng',
    description: 'Không lạnh, kêu to',
    time: '3 phút trước',
    address: 'Hẻm 123, Phường A, Quận B',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'Đang chờ duyệt',
  },
  {
    id: 2,
    name: 'Máy giặt cũ',
    category: 'Gia dụng',
    description: 'Bơm nước yếu',
    time: '3 tháng trước',
    address: 'Khu C, Phường D',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'Đã hoàn thành',
  },
  // new requests will be added with status 'Đang chờ duyệt'
];

const delay = (ms = 200) =>
  new Promise<void>(res => setTimeout(() => res(), ms));

const list = async (): Promise<RequestItem[]> => {
  await delay();
  return [...store];
};

const get = async (id: number): Promise<RequestItem | undefined> => {
  await delay();
  return store.find(s => s.id === id);
};

const create = async (data: Partial<RequestItem>): Promise<RequestItem> => {
  await delay();
  const now = new Date();
  const item: RequestItem = {
    id: nextId++,
    name: data.name || 'Yêu cầu mới',
    category: data.category,
    description: data.description,
    time: data.time || 'Vừa xong',
    address: data.address,
    images: data.images,
    // keep a single thumbnail for list views (either explicit image or first image)
    image:
      data.image || (Array.isArray(data.images) ? data.images[0] : undefined),
    timeSlots: data.timeSlots,
    status: data.status || 'Đang chờ duyệt',
  };
  store = [item, ...store];
  return item;
};

const update = async (id: number, patch: Partial<RequestItem>) => {
  await delay();
  let updated: RequestItem | undefined;
  store = store.map(i => {
    if (i.id === id) {
      updated = { ...i, ...patch };
      return updated;
    }
    return i;
  });
  return updated;
};

export default { list, get, create, update };
