declare module 'node-fetch' {
  import { RequestInfo, RequestInit, Response } from 'node';
  export default function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
  export { RequestInfo, RequestInit, Response };
}