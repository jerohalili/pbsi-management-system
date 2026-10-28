import { randomBytes } from 'node:crypto';

let lastTimestamp = 0;
let sequence = 0;

/**
 * Time-ordered UUID (version 7). Postgres sorts uuid values byte by byte, so rows created with
 * these ids come back in creation order when sorted by id. Used for quiz questions, which have no
 * position column. Ids created in the same millisecond stay ordered through a counter.
 */
export function newTimeOrderedUuid(now: number = Date.now()): string {
  let timestamp = now;
  if (timestamp <= lastTimestamp) {
    // Same millisecond (or the clock stepped back): keep counting from the last timestamp.
    timestamp = lastTimestamp;
    sequence += 1;
    if (sequence > 0xfff) {
      // Counter exhausted for this millisecond: move on to the next one.
      timestamp += 1;
      sequence = 0;
    }
  } else {
    sequence = 0;
  }
  lastTimestamp = timestamp;

  const bytes = randomBytes(16);
  // 48-bit big-endian millisecond timestamp
  bytes[0] = Math.floor(timestamp / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(timestamp / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(timestamp / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(timestamp / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(timestamp / 2 ** 8) & 0xff;
  bytes[5] = timestamp & 0xff;
  // version 7 + 12-bit counter
  bytes[6] = 0x70 | ((sequence >> 8) & 0x0f);
  bytes[7] = sequence & 0xff;
  // RFC 4122 variant
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
