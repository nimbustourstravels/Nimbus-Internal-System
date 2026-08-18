import jpeg from "jpeg-js";

// Rotates a JPEG buffer by decoding to raw pixels, transposing, and
// re-encoding — needed because phone photos often lose their orientation
// metadata in HEIC conversion, leaving Tesseract to read the image sideways.
export function rotateJpegBuffer(buffer: Buffer, degrees: 90 | 180 | 270): Buffer {
  const { width, height, data } = jpeg.decode(buffer, { useTArray: true });

  const newWidth = degrees === 180 ? width : height;
  const newHeight = degrees === 180 ? height : width;
  const out = Buffer.alloc(newWidth * newHeight * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;

      let dx: number;
      let dy: number;
      if (degrees === 90) {
        dx = height - 1 - y;
        dy = x;
      } else if (degrees === 180) {
        dx = width - 1 - x;
        dy = height - 1 - y;
      } else {
        dx = y;
        dy = width - 1 - x;
      }

      const dstIdx = (dy * newWidth + dx) * 4;
      out[dstIdx] = data[srcIdx];
      out[dstIdx + 1] = data[srcIdx + 1];
      out[dstIdx + 2] = data[srcIdx + 2];
      out[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return jpeg.encode({ data: out, width: newWidth, height: newHeight }, 90).data;
}
