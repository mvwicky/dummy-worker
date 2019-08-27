import {} from "@cloudflare/workers-types";
import Jimp from "jimp";
import { html, renderToString } from "@popeindustries/lit-html-server";

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

  r.get(/(\/worker)?\//, rootHandler);
  r.get(dimensionRe, dimensionHandler);
  r.get(colorRe, colorDimHandler);

  const res = await r.route(request);
  return res;
}

async function rootHandler(req: Request) {
  const body = html`
    <!DOCTYPE html>
    <html>
      <body>
        <h1>${req.url}</h1>
        <br />
        ${String(req.cf.latitude)}
      </body>
    </html>
  `;
  const bodyString = await renderToString(body);
  return new Response(bodyString, { headers: { "content-type": "text/html" } });
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
  maxAge: number = 86400,
) {
  try {
    const buf = await createImageBuffer(width, height, bg_color, fmt);
    const response = new Response(buf, {
      status: 200,
    });
    response.headers.set("Content-Type", fmt);
    response.headers.set("Cache-Control", `public, max-age=${maxAge}`);
    return response;
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
