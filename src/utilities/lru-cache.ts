import  LRU from 'lru-cache';

export const lruCache = new LRU({
  max: 10000,
  maxAge: 1000 * 60,
});
 