import Jimp from "jimp";

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
