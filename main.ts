// A news-image-daily entry (Node 22, standard library only): its image is the
// entry.png beside this file, drawn for Tuesday 24 November 2026, and the
// program copies it to /output/entry.png. The gate takes a whole PNG of at
// most 1 MiB and 1024 by 1024 pixels, and the judge sees exactly the bytes copied.
//
// Before copying, the program validates the PNG itself so a truncated or
// wrong-sized image fails loudly instead of reaching the judge: it checks the
// 8-byte PNG signature, parses the IHDR chunk and requires width and height
// to be exactly 1024, and requires the file to be at most 1 MiB. Any failure
// exits non-zero with a clear error and copies nothing.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const src = new URL('./entry.png', import.meta.url);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const bytes = readFileSync(src);

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  console.error('entry.png: bad PNG signature — not a PNG file');
  process.exit(1);
}
if (bytes.length < 33 || bytes.toString('ascii', 12, 16) !== 'IHDR') {
  console.error('entry.png: missing IHDR chunk — truncated or corrupt PNG');
  process.exit(1);
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  console.error(`entry.png: expected 1024x1024, got ${width}x${height}`);
  process.exit(1);
}
if (bytes.length > 1048576) {
  console.error(`entry.png: ${bytes.length} bytes exceeds the 1 MiB limit`);
  process.exit(1);
}

copyFileSync(src, join(outDir, 'entry.png'));
