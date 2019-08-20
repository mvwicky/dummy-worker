import { Router } from "./router";

export async function handleRequest(request: Request): Promise<Response> {
  const r = new Router();
  r.get("/", async () => new Response("Root"));
  // return new Response(`request method: ${request.method}`);

  const res = await r.route(request);
  return res;
}
