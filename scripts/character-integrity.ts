import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
export async function fileHash(file: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
export async function verifyArchive(file: string, expected: string): Promise<void> {
  if ((await fileHash(file)) !== expected) throw new Error(`Source checksum mismatch: ${file}`);
}
