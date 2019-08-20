import Jimp from "jimp";

import { Router } from "./router";
import {
  createImageBuffer,
  matchDimensions,
  dimensionRe,
  colorRe,
  errResponse,
} from "./helpers";

export async function handleRequest(request: Request): Promise<Response> {
  const r = new Router();

  r.get("/", rootHandler);
  r.get(dimensionRe, dimensionHandler);
  r.get(colorRe, colorDimHandler);

  const res = await r.route(request);
  return res;
}

async function rootHandler() {
  return imageResponse(766, 388, "#cceeff", Jimp.MIME_PNG);
}

async function dimensionHandler(req: Request) {
  const dim = matchDimensions(req.url);
  if (typeof dim === "string") {
    return errResponse("unable to find and/or parse dimensions from URL", dim);
  }
  const [width, height] = dim;
  return imageResponse(width, height, "#cceeff", Jimp.MIME_PNG);
}

async function colorDimHandler(req: Request) {
  const dim = matchDimensions(req.url);
  if (typeof dim === "string") {
    return errResponse("unable to find and/or parse dimensions from URL", dim);
  }
  const [width, height] = dim;
  const match = req.url.match(colorRe);
  if (match === null || match.groups === undefined) {
    return errResponse("unable to parse background and foreground colors", "");
  }
  const groups = match.groups;
  const bg = `#${groups.bg}`;
  return imageResponse(width, height, bg, Jimp.MIME_PNG);
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
