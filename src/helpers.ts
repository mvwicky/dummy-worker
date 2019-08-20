import Jimp from "jimp";
import { Dimensions } from "./types";

export const dimensionRe = /\/(?<w>\d+)x(?<h>\d+)\/?/;
export const colorRe = /\/(?<w>\d+)x(?<h>\d+)\/(?<bg>[0-9a-f]{3,6})\/(?<fg>[0-9a-f]{3,6})\/?/i;

export function errResponse(
  body: string,
  statusText: string,
  status: number = 400,
) {
  return new Response(body, {
    status,
    statusText,
    headers: { "content-type": "text/plain" },
  });
}

async function createImage(width: number, height: number, bg_color: string) {
  return new Promise((resolve, reject) => {
    new Jimp(width, height, bg_color, (err, image) => {
      if (err) {
        reject(err);
      } else {
        resolve(image);
      }
    });
  });
}

export async function createImageBuffer(
  width: number,
  height: number,
  bg_color: string,
  fmt: string,
) {
  const img = (await createImage(width, height, bg_color)) as Jimp;
  const buffer = (await img.getBufferAsync(fmt)) as Uint8Array;
  return buffer;
}

export function matchDimensions(url: string): string | Dimensions {
  const match = url.match(dimensionRe);
  if (match === null || match.groups === undefined) {
    return "unable to find dimensions in URL";
  }
  const groups = match.groups;
  const rawDims = [groups.w, groups.h];
  const dims = rawDims.map((e) => Number(e));
  if (dims.some((n) => Number.isNaN(n))) {
    return "non-numeric dimensions";
  }
  const [width, height] = dims;
  return [width, height];
}
