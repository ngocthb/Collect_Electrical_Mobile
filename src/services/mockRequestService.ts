type RequestItem = {
  id: number;
  name: string;
  category?: string;
  description?: string;
  image?: any; // primary thumbnail for lists
  time: string; // human-friendly time
  address?: string;
  images?: any[]; // array of local require or uri
  sender?: {
    id?: string | number;
    name?: string;
    phone?: string;
    avatar?: string | null;
    address?: string;
    lat?: number;
    lng?: number;
  };
  date?: string | Date;
  timeSlots?: Record<string, string[]>;
  status: string;
};

let nextId = 1000;

// Legacy store (user-facing) - keep original Vietnamese text/status so user screens behave exactly as before
let legacyStore: RequestItem[] = [
  {
    id: 1,
    name: 'Tủ lạnh cũ',
    category: 'Gia dụng',
    description: 'Không lạnh, kêu to',
    time: '3 phút trước',
    date: new Date().toISOString(),
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
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    address: 'Khu C, Phường D',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'Đã hoàn thành',
  },
];

// Delivery store (delivery-facing) - includes sender info, standardized status keys and multiple dates for testing
let deliveryStore: RequestItem[] = [
  {
    id: 1,
    name: 'Tủ lạnh cũ',
    category: 'Gia dụng',
    description: 'Không lạnh, kêu to',
    time: '3 phút trước',
    date: new Date().toISOString(),
    address: 'Hẻm 123, Phường A, Quận B',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'pending',
    sender: {
      id: 'SHP-001',
      name: 'Người gửi A',
      phone: '0901234567',
      avatar: null,
      address: 'Hẻm 123, Phường A, Quận B',
      lat: 10.85,
      lng: 106.8333,
    },
  },
  {
    id: 2,
    name: 'Máy giặt cũ',
    category: 'Gia dụng',
    description: 'Bơm nước yếu',
    time: '3 tháng trước',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    address: 'Khu C, Phường D',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'completed',
    sender: {
      id: 'SHP-002',
      name: 'Người gửi B',
      phone: '0902222333',
      avatar: null,
      address: 'Khu C, Phường D',
      lat: 10.76,
      lng: 106.68,
    },
  },
  {
    id: 3,
    name: 'Tivi LED',
    category: 'Điện tử',
    description: 'Màn hình bị sọc',
    time: 'Hôm qua',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    address: '123 Đường Số 5, Quận 7',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'failed',
    sender: {
      id: 'SHP-003',
      name: 'Người gửi C',
      phone: '0903333444',
      avatar: null,
      address: '123 Đường Số 5, Quận 7',
      lat: 10.75,
      lng: 106.7,
    },
  },
  {
    id: 4,
    name: 'Lò vi sóng',
    category: 'Gia dụng',
    description: 'Bảng điều khiển lỗi',
    time: 'Ngày mai',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    address: 'Số 50, Đường ABC',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'pending',
    sender: {
      id: 'SHP-004',
      name: 'Người gửi D',
      phone: '0904444555',
      avatar: null,
      address: 'Số 50, Đường ABC',
      lat: 10.77,
      lng: 106.69,
    },
  },
  // Added two items (one failed, one completed) for today's date to help testing
  {
    id: 5,
    name: 'Bếp điện cũ',
    category: 'Gia dụng',
    description: 'Không nóng đều',
    time: 'Vừa xong',
    date: new Date().toISOString(),
    address: 'Số 12, Đường XYZ',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'failed',
    sender: {
      id: 'SHP-005',
      name: 'Người gửi E',
      phone: '0905555666',
      avatar: null,
      address: 'Số 12, Đường XYZ',
      lat: 10.8,
      lng: 106.82,
    },
  },
  {
    id: 6,
    name: 'Máy xay sinh tố cũ',
    category: 'Nhà bếp',
    description: 'Lồng bị kẹt',
    time: 'Vừa xong',
    date: new Date().toISOString(),
    address: 'Số 99, Phố ABC',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'completed',
    sender: {
      id: 'SHP-006',
      name: 'Người gửi F',
      phone: '0906666777',
      avatar: null,
      address: 'Số 99, Phố ABC',
      lat: 10.79,
      lng: 106.7,
    },
  },
  {
    id: 7,
    name: 'Quạt điện cũ',
    category: 'Điện dân dụng',
    description: 'Quạt quay yếu',
    time: 'Vừa xong',
    date: new Date().toISOString(),
    address: 'Số 7, Ngõ 2, Phường Y',
    images: [require('../assets/images/avatar.jpg')],
    image: require('../assets/images/avatar.jpg'),
    status: 'pending',
    sender: {
      id: 'SHP-007',
      name: 'Người gửi G',
      phone: '0907777888',
      avatar: null,
      address: 'Số 7, Ngõ 2, Phường Y',
      lat: 10.78,
      lng: 106.71,
    },
  },
];

const delay = (ms = 200) =>
  new Promise<void>(res => setTimeout(() => res(), ms));

// User-facing APIs (legacy) operate on legacyStore
const list = async (): Promise<RequestItem[]> => {
  await delay();
  return [...legacyStore];
};

const get = async (id: number): Promise<RequestItem | undefined> => {
  await delay();
  return legacyStore.find(s => s.id === id);
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
  legacyStore = [item, ...legacyStore];
  return item;
};

const update = async (id: number, patch: Partial<RequestItem>) => {
  await delay();
  let updated: RequestItem | undefined;
  legacyStore = legacyStore.map(i => {
    if (i.id === id) {
      updated = { ...i, ...patch };
      return updated!;
    }
    return i;
  });
  return updated;
};

// Delivery-facing APIs operate on deliveryStore (enriched data)
const listDelivery = async (): Promise<RequestItem[]> => {
  await delay();
  return [...deliveryStore];
};

const getDelivery = async (id: number): Promise<RequestItem | undefined> => {
  await delay();
  return deliveryStore.find(s => s.id === id);
};

const createDelivery = async (
  data: Partial<RequestItem>,
): Promise<RequestItem> => {
  await delay();
  const item: RequestItem = {
    id: nextId++,
    name: data.name || 'Yêu cầu mới',
    category: data.category,
    description: data.description,
    time: data.time || 'Vừa xong',
    address: data.address,
    images: data.images,
    image:
      data.image || (Array.isArray(data.images) ? data.images[0] : undefined),
    timeSlots: data.timeSlots,
    status: data.status || 'pending',
    sender: data.sender,
    date: data.date ?? new Date().toISOString(),
  };
  deliveryStore = [item, ...deliveryStore];
  return item;
};

const updateDelivery = async (id: number, patch: Partial<RequestItem>) => {
  await delay();
  let updated: RequestItem | undefined;
  deliveryStore = deliveryStore.map(i => {
    if (i.id === id) {
      updated = { ...i, ...patch };
      return updated!;
    }
    return i;
  });
  return updated;
};

const completedDelivery = async (id: number) => {
  await delay();
  let updated: RequestItem | undefined;
  deliveryStore = deliveryStore.map(i => {
    if (i.id === id) {
      updated = { ...i, status: 'completed' };
      return updated!;
    }
    return i;
  });
  return updated;
};

const cancelDelivery = async (id: number) => {
  await delay();
  let updated: RequestItem | undefined;
  deliveryStore = deliveryStore.map(i => {
    if (i.id === id) {
      updated = { ...i, status: 'failed' };
      return updated!;
    }
    return i;
  });
  return updated;
};

export default {
  // legacy user APIs
  list,
  get,
  create,
  update,
  // delivery APIs
  listDelivery,
  getDelivery,
  createDelivery,
  updateDelivery,
  completedDelivery,
  cancelDelivery,
};
