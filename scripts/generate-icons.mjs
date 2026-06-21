import { mkdir, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";

const COLORS = {
  mist: [234, 243, 239, 255],
  paper: [251, 250, 246, 255],
  ink: [23, 32, 29, 255],
  teal: [25, 124, 116, 255],
  amber: [214, 139, 22, 255],
};

function crc32(buffer) {
  let crc = -1;

  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function inRoundedRect(x, y, size, inset, radius) {
  const min = inset;
  const max = size - inset - 1;
  const left = x < min + radius;
  const right = x > max - radius;
  const top = y < min + radius;
  const bottom = y > max - radius;

  if (!left && !right) return y >= min && y <= max;
  if (!top && !bottom) return x >= min && x <= max;

  const centerX = left ? min + radius : max - radius;
  const centerY = top ? min + radius : max - radius;
  return (x - centerX) ** 2 + (y - centerY) ** 2 <= radius ** 2;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
  const x = ax + t * dx;
  const y = ay + t * dy;

  return Math.hypot(px - x, py - y);
}

function drawIcon(size) {
  const bytesPerPixel = 4;
  const stride = size * bytesPerPixel + 1;
  const raw = Buffer.alloc(stride * size);
  const cardInset = size * 0.13;
  const cardRadius = size * 0.12;
  const lineX = size * 0.42;
  const lineTop = size * 0.22;
  const lineBottom = size * 0.78;
  const nodeRadius = size * 0.035;
  const glowRadius = size * 0.078;
  const markSize = size * 0.19;

  for (let y = 0; y < size; y += 1) {
    const row = y * stride;
    raw[row] = 0;

    for (let x = 0; x < size; x += 1) {
      const offset = row + 1 + x * bytesPerPixel;
      const color = [...COLORS.mist];
      const card = inRoundedRect(x, y, size, cardInset, cardRadius);

      if (card) color.splice(0, 4, ...COLORS.paper);

      const lineDistance = distanceToSegment(x, y, lineX, lineTop, lineX, lineBottom);
      if (lineDistance < size * 0.012) color.splice(0, 4, ...COLORS.teal);

      for (let index = 0; index < 5; index += 1) {
        const nodeY = lineTop + ((lineBottom - lineTop) / 4) * index;
        const distance = Math.hypot(x - lineX, y - nodeY);
        const nodeColor = index === 4 ? COLORS.amber : COLORS.teal;

        if (index === 4 && distance < glowRadius) {
          color[0] = Math.round(color[0] * 0.68 + COLORS.amber[0] * 0.32);
          color[1] = Math.round(color[1] * 0.68 + COLORS.amber[1] * 0.32);
          color[2] = Math.round(color[2] * 0.68 + COLORS.amber[2] * 0.32);
        }

        if (distance < nodeRadius) color.splice(0, 4, ...nodeColor);
      }

      const moonX = size * 0.66;
      const moonY = size * 0.38;
      const moonOuter = Math.hypot(x - moonX, y - moonY) < size * 0.115;
      const moonCut = Math.hypot(x - size * 0.705, y - size * 0.335) < size * 0.11;
      if (moonOuter && !moonCut) color.splice(0, 4, ...COLORS.ink);

      const checkA = [size * 0.58, size * 0.63];
      const checkB = [size * 0.66, size * 0.71];
      const checkC = [size * 0.81, size * 0.55];
      const checkDistance = Math.min(
        distanceToSegment(x, y, checkA[0], checkA[1], checkB[0], checkB[1]),
        distanceToSegment(x, y, checkB[0], checkB[1], checkC[0], checkC[1]),
      );
      if (checkDistance < markSize * 0.1) color.splice(0, 4, ...COLORS.amber);

      raw[offset] = color[0];
      raw[offset + 1] = color[1];
      raw[offset + 2] = color[2];
      raw[offset + 3] = color[3];
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

await mkdir("icons", { recursive: true });

for (const size of [192, 512]) {
  await writeFile(`icons/icon-${size}.png`, drawIcon(size));
}
