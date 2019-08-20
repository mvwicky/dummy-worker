import { KVNamespace } from "@cloudflare/workers-types";

declare global {
  const myKVNamespace: KVNamespace;
}

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
