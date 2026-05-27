/**
 * Tiny fluent-chain mock for the Supabase JS client used in lib/data and lib/storage.
 *
 * Each terminal call (single/maybeSingle/the awaited builder/createSignedUrls/etc.)
 * resolves with `{ data, error, count }` from a queued response. The chain just
 * records the calls so tests can assert against them.
 *
 * Extensions (for server actions):
 * - insert(payload) — chainable, resolves from queue
 * - delete() — chainable .eq, resolves from queue
 * - or(filter) — chainable (used by searchSunners)
 * - lte / gte — chainable range filters
 * - rpc(fnName, args) — top-level method, separate rpcQueue + rpcCalls
 */

export type QueryResponse = {
  data?: unknown;
  error?: { code?: string; message?: string } | null;
  count?: number | null;
};

export type FromCall = {
  table: string;
  ops: Array<{ method: string; args: unknown[] }>;
};

export type StorageCall = {
  bucket: string;
  method: string;
  args: unknown[];
};

export type RpcCall = {
  fn: string;
  args: unknown;
};

type Queue = Map<string, QueryResponse[]>;

function take(queue: Queue, table: string): QueryResponse {
  const list = queue.get(table);
  if (!list || list.length === 0) {
    return { data: [], error: null, count: 0 };
  }
  return list.shift() as QueryResponse;
}

export function createSupabaseMock(opts?: {
  authUser?: { id: string } | null;
  storage?: {
    createSignedUrls?: (paths: string[]) => QueryResponse;
    upload?: (path: string) => QueryResponse;
    createSignedUrl?: (path: string) => QueryResponse;
  };
}) {
  const queue: Queue = new Map();
  const fromCalls: FromCall[] = [];
  const storageCalls: StorageCall[] = [];

  // RPC support — separate queue keyed by function name
  const rpcQueue: Map<string, QueryResponse[]> = new Map();
  const rpcCalls: RpcCall[] = [];

  function queueResponse(table: string, response: QueryResponse) {
    const existing = queue.get(table) ?? [];
    existing.push(response);
    queue.set(table, existing);
  }

  function queueRpcResponse(fnName: string, response: QueryResponse) {
    const existing = rpcQueue.get(fnName) ?? [];
    existing.push(response);
    rpcQueue.set(fnName, existing);
  }

  function buildQueryBuilder(table: string) {
    const record: FromCall = { table, ops: [] };
    fromCalls.push(record);

    const builder: Record<string, unknown> = {};
    const chain = (method: string) => (...args: unknown[]) => {
      record.ops.push({ method, args });
      return builder;
    };

    builder.select = chain("select");
    builder.eq = chain("eq");
    builder.in = chain("in");
    builder.lt = chain("lt");
    builder.gt = chain("gt");
    builder.lte = chain("lte");
    builder.gte = chain("gte");
    builder.order = chain("order");
    builder.limit = chain("limit");
    builder.or = chain("or");

    // update() returns the same builder so callers can chain .eq().eq() etc.
    // Resolution happens via the builder's .then (awaiting the builder).
    builder.update = (payload: unknown) => {
      record.ops.push({ method: "update", args: [payload] });
      return builder;
    };

    // insert() returns the same builder; resolution happens via await / .then.
    builder.insert = (payload: unknown) => {
      record.ops.push({ method: "insert", args: [payload] });
      return builder;
    };

    // delete() returns the same builder; chain .eq() then await.
    builder.delete = () => {
      record.ops.push({ method: "delete", args: [] });
      return builder;
    };

    const resolveSingle = () => {
      record.ops.push({ method: "single", args: [] });
      return Promise.resolve(take(queue, table));
    };
    const resolveMaybeSingle = () => {
      record.ops.push({ method: "maybeSingle", args: [] });
      return Promise.resolve(take(queue, table));
    };

    builder.single = resolveSingle;
    builder.maybeSingle = resolveMaybeSingle;

    builder.then = (resolve: (v: QueryResponse) => unknown) => {
      return Promise.resolve(take(queue, table)).then(resolve);
    };

    return builder;
  }

  const storageApi = {
    from: (bucket: string) => ({
      upload: (path: string, body: unknown, options?: unknown) => {
        storageCalls.push({ bucket, method: "upload", args: [path, body, options] });
        const r = opts?.storage?.upload?.(path) ?? { data: { path }, error: null };
        return Promise.resolve(r);
      },
      createSignedUrl: (path: string, expiresIn: number) => {
        storageCalls.push({ bucket, method: "createSignedUrl", args: [path, expiresIn] });
        const r =
          opts?.storage?.createSignedUrl?.(path) ?? {
            data: { signedUrl: `signed://${path}` },
            error: null,
          };
        return Promise.resolve(r);
      },
      createSignedUrls: (paths: string[], expiresIn: number) => {
        storageCalls.push({ bucket, method: "createSignedUrls", args: [paths, expiresIn] });
        const r =
          opts?.storage?.createSignedUrls?.(paths) ?? {
            data: paths.map((p) => ({ path: p, signedUrl: `signed://${p}`, error: null })),
            error: null,
          };
        return Promise.resolve(r);
      },
    }),
  };

  const supabase = {
    from: (table: string) => buildQueryBuilder(table),
    storage: storageApi,
    auth: {
      getUser: async () => ({
        data: { user: opts?.authUser ?? null },
        error: null,
      }),
    },
    rpc: (fnName: string, args?: unknown) => {
      rpcCalls.push({ fn: fnName, args });
      return Promise.resolve(take(rpcQueue, fnName));
    },
  };

  return { supabase, queueResponse, fromCalls, storageCalls, queueRpcResponse, rpcCalls };
}

export type SupabaseMock = ReturnType<typeof createSupabaseMock>;
