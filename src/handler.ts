import Jimp from "jimp";

import { Router } from "./router";
import { createImageBuffer } from "./helpers";

const dimensionRe = /\/(\d+)x(\d+)\/?/;
const colorRe = /\/(?<w>\d+)x(?<h>\d+)\/(?<bg>[0-9a-f]{3,6})\/(?<fg>[0-9a-f]{3,6})\/?/i;

export async function handleRequest(request: Request): Promise<Response> {
  const r = new Router();

  r.get("/", rootHandler);
  r.get(dimensionRe, dimensionHandler);

  const res = await r.route(request);
  return res;
}

async function rootHandler() {
  return imageResponse(766, 388, "#cceeff", Jimp.MIME_PNG);
}

async function dimensionHandler(req: Request) {
  const match = req.url.match(dimensionRe);
  if (match === null || match.length !== 2) {
    return new Response("unable to find dimensions", {
      status: 400,
      statusText: "dimensions were unfindable",
      headers: {
        "content-type": "text/plain",
      },
    });
  }
  const dims = match.map((m) => Number(m));
  if (dims.some((n) => Number.isNaN(n))) {
    return new Response("non-numeric dimensions", {
      status: 400,
      statusText: "dimensions were not numbers",
      headers: {
        "content-type": "text/plain",
      },
    });
  }
  const [width, height] = dims;
  return imageResponse(width, height, "#cceeff", Jimp.MIME_PNG);
}

async function imageResponse(
  width: number,
  height: number,
  bg_color: string,
  fmt: string,
) {
  try {
    const buf = await createImageBuffer(width, height, bg_color, fmt);
    return new Response(buf, { status: 200 });
  } catch (err) {
    return new Response("unable to create an image", {
      status: 500,
      statusText: JSON.stringify({ err }),
      headers: {
        "content-type": "application/json",
      },
    });
  }
}
