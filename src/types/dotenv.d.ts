declare module 'dotenv' {
  export function config(options?: { path?: string; encoding?: string; debug?: boolean; override?: boolean }): { parsed?: Record<string, string>; error?: Error };
}