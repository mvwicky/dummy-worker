import { Route, Condition, Handler } from "./types";

const Method = (method: string) => (req: Request) =>
  req.method.toLowerCase() === method.toLowerCase();
const Connect = Method("connect");
const Delete = Method("delete");
const Get = Method("get");
const Head = Method("head");
const Options = Method("options");
const Patch = Method("patch");
const Post = Method("post");
const Put = Method("put");
const Trace = Method("trace");

const Header = (header: string, val: string) => (req: Request) =>
  req.headers.get(header) === val;
const Host = (host: string) => Header("host", host.toLowerCase());
const Referrer = (host: string) => Header("referrer", host.toLowerCase());

const Path = (regExp: RegExp | string) => (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const match = path.match(regExp) || [];
  return match[0] === path;
};

export class Router {
  routes: Route[];
  constructor(readonly prefix: string = "") {
    if (!prefix.startsWith("/")) {
      this.prefix = `/${prefix}`;
    } else {
      this.prefix = prefix;
    }

    this.routes = [];
  }

  handle(conditions: Condition, handler: Handler) {
    this.routes.push({ conditions, handler });
    return this;
  }

  private prepUrl(url: RegExp | string) {
    const strUrl: string = typeof url === "string" ? url : url.toString();
    const flags: string | undefined =
      typeof url === "string" ? undefined : url.flags;

    const close = strUrl.lastIndexOf("/");
    const re = new RegExp(
      ["/", this.prefix, strUrl.slice(1, close)].join(""),
      flags,
    );
    return re;
  }

  connect(url: RegExp | string, handler: Handler) {
    return this.handle([Connect, Path(url)], handler);
  }

  delete(url: RegExp | string, handler: Handler) {
    return this.handle([Delete, Path(url)], handler);
  }

  get(url: RegExp | string, handler: Handler) {
    return this.handle([Get, Path(url)], handler);
  }

  head(url: RegExp | string, handler: Handler) {
    return this.handle([Head, Path(url)], handler);
  }

  options(url: RegExp | string, handler: Handler) {
    return this.handle([Options, Path(url)], handler);
  }

  patch(url: RegExp | string, handler: Handler) {
    return this.handle([Patch, Path(url)], handler);
  }

  post(url: RegExp | string, handler: Handler) {
    return this.handle([Post, Path(url)], handler);
  }

  put(url: RegExp | string, handler: Handler) {
    return this.handle([Put, Path(url)], handler);
  }

  trace(url: RegExp | string, handler: Handler) {
    return this.handle([Trace, Path(url)], handler);
  }

  all(handler: Handler) {
    return this.handle([], handler);
  }

  async route(req: Request) {
    const route = this.resolve(req);
    if (route !== undefined) {
      return route.handler(req);
    }
    return new Response(`resource not found\n${req.url}`, {
      status: 404,
      statusText: "not found",
      headers: {
        "content-type": "text/plain",
      },
    });
  }

  resolve(req: Request) {
    return this.routes.find((r) => {
      if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
        return true;
      }
      if (typeof r.conditions === "function") {
        return r.conditions(req);
      }
      return r.conditions.every((c) => c(req));
    });
  }
}
