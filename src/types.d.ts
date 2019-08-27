import { KVNamespace } from "@cloudflare/workers-types";

declare global {
  const myKVNamespace: KVNamespace;
}

interface MatchOptions {
  ignoreMethod: boolean;
}

interface DeleteOptions {
  ignoreMethod: boolean;
}

interface CFCache {
  put(request: Request, response: Response): Promise<undefined>;
  match(request: Request, options?: MatchOptions): Promise<Response>;
  delete(request: Request, options?: DeleteOptions): Promise<boolean>;
}

interface CFCacheDefault {
  default: CFCache;
}

declare const caches: CFCacheDefault;

interface Handler {
  (request: Request): Promise<Response>;
}

type Dimensions = [number, number];

type ReqMatcher = (req: Request) => boolean;

type Condition = ReqMatcher[] | ReqMatcher;

interface Route {
  conditions: Condition;
  handler: Handler;
}
