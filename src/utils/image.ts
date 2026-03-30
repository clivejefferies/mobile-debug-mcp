export function parsePngSize(buf: Buffer): { width: number; height: number } {
  try {
    if (!buf || buf.length < 24) return { width: 0, height: 0 };
    // PNG signature + IHDR checks
    if (buf.readUInt32BE(0) !== 0x89504e47 || buf.readUInt32BE(4) !== 0x0d0a1a0a) return { width: 0, height: 0 };
    const ihdr = buf.toString('ascii', 12, 16);
    if (ihdr !== 'IHDR') return { width: 0, height: 0 };
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height };
  } catch {
    return { width: 0, height: 0 };
  }
}
