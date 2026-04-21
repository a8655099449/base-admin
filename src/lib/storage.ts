const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 365;

const storage = {
  set: (key: string, value: unknown, expire: number | null = DEFAULT_CACHE_TIME) => {
    const data = JSON.stringify({
      value,
      expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
    });
    localStorage.setItem(`sofa-${key}`.toUpperCase(), data);
  },
  get: <T>(key: string, def: T): T => {
    const item = localStorage.getItem(`sofa-${key}`.toUpperCase());
    if (item) {
      try {
        const data = JSON.parse(item);
        const { value, expire } = data;
        if (expire === null || expire >= Date.now()) {
          return value as T;
        }
        localStorage.removeItem(`sofa-${key}`.toUpperCase());
      } catch (_e) {
        return def;
      }
    }
    return def;
  },
  remove: (key: string) => {
    localStorage.removeItem(`sofa-${key}`.toUpperCase());
  },
  clear: () => {
    localStorage.clear();
  }
};

export default storage;
