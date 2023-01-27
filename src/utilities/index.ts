import { idGenerator } from './identity-generate';
import { lruCache } from './lru-cache';
import { axiosInstance } from './axios';
import { puppeteerUtil } from './puppeteer.util';

function sleep(sec: number) {
  return new Promise((res) => setTimeout(res, sec * 1000))
}

export {
  idGenerator,
  lruCache,
  axiosInstance,
  puppeteerUtil,
  
  sleep
}