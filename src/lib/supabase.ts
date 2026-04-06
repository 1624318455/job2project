import { SupabaseClient } from '@supabase/supabase-js';

type InMemoryStore = Record<string, Record<string, unknown>[]>;

declare global {
  // eslint-disable-next-line no-var
  var __mockSupabaseStore: InMemoryStore | undefined;
  // eslint-disable-next-line no-var
  var __generatedCode: Record<string, Record<string, string>> | undefined;
}

const store: InMemoryStore = globalThis.__mockSupabaseStore || {
  tasks: [],
  generated_projects: [],
};
globalThis.__mockSupabaseStore = store;

if (!globalThis.__generatedCode) {
  globalThis.__generatedCode = {};
}

export function getGeneratedCode(taskId: string): Record<string, string> | undefined {
  console.log('[getGeneratedCode] taskId:', taskId, 'keys in store:', Object.keys(globalThis.__generatedCode || {}).join(', '));
  return globalThis.__generatedCode?.[taskId];
}

export function setGeneratedCode(taskId: string, code: Record<string, string>) {
  if (!globalThis.__generatedCode) {
    globalThis.__generatedCode = {};
  }
  globalThis.__generatedCode[taskId] = code;
  console.log('[setGeneratedCode] taskId:', taskId, 'files:', Object.keys(code).length, 'total keys:', Object.keys(globalThis.__generatedCode).join(', '));
}

function createMockClient(): SupabaseClient {
  const client: any = {
    from(tableName: string) {
      return {
        select(_selector?: string) {
          return {
            eq(col: string, val: string) {
              return {
                single() {
                  const rows = store[tableName] || [];
                  const found = rows.find((r) => r[col] === val);
                  return Promise.resolve({ data: found || null, error: found ? null : { message: 'Not found' } });
                },
              };
            },
            order(col: string, opts?: { ascending: boolean }) {
              const rows = store[tableName] || [];
              const sorted = [...rows].sort((a: any, b: any) => {
                const av = a[col], bv = b[col];
                return opts?.ascending === false
                  ? (bv > av ? 1 : -1)
                  : (av > bv ? 1 : -1);
              });
              return Promise.resolve({ data: sorted, error: null });
            },
          };
        },
        insert(row: any) {
          const record = {
            ...row,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          store[tableName] = store[tableName] || [];
          store[tableName].push(record);
          return {
            select() {
              return {
                single() {
                  return Promise.resolve({ data: record, error: null });
                },
              };
            },
          };
        },
        update(fields: Record<string, unknown>) {
          return {
            eq(col: string, val: string) {
              const rows = store[tableName] || [];
              for (const row of rows) {
                if (row[col] === val) {
                  Object.assign(row, fields, { updated_at: new Date().toISOString() });
                }
              }
              return Promise.resolve({ data: null, error: null });
            },
          };
        },
      };
    },
  };

  return client as unknown as SupabaseClient;
}

let supabase: SupabaseClient;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    const u = new URL(url);
    return (u.protocol === 'http:' || u.protocol === 'https:') && !url.includes('your_') && !url.includes('example.supabase');
  } catch {
    return false;
  }
};

if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized with real URL');
  } catch (e) {
    console.warn('Supabase real client failed, falling back to mock:', e);
    supabase = createMockClient();
  }
} else {
  console.warn('Supabase not configured, using in-memory mock');
  supabase = createMockClient();
}

export { supabase };
export default supabase;
