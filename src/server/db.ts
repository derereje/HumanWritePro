// Mock Database Client
export const db = {
  user: {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    findMany: () => Promise.resolve([]),
    delete: () => Promise.resolve({}),
  },
  humanizerHistory: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  project: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
  },
};
