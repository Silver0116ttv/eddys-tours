import path from 'node:path'
import { stat, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

// Renders the social preview served as `app/opengraph-image.jpg` (1200×630).
// Re-run after replacing the source photo: `node scripts/og-image.mjs`.
const source = path.join(process.cwd(), 'public', 'images', 'story-sunset-v2.webp')
const output = path.join(process.cwd(), 'app', 'opengraph-image.jpg')
const width = 1200
const height = 630

const overlay = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1a2a" stop-opacity="0.05" />
      <stop offset="55%" stop-color="#0b1a2a" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#0b1a2a" stop-opacity="0.85" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#shade)" />
  <g font-family="DM Sans, Segoe UI, Helvetica, Arial, sans-serif" fill="#ffffff">
    <text x="72" y="452" font-size="84" font-weight="700" letter-spacing="-2">Eddy's Tours</text>
    <text x="72" y="512" font-size="34" font-weight="500" fill="#f4e6d2">
      Tours &amp; experiences in Puerto Vallarta, Mexico
    </text>
    <text x="72" y="572" font-size="26" font-weight="500" letter-spacing="3" fill="#8fd3d8">
      WWW.EDDYSTOURSPV.COM
    </text>
  </g>
</svg>`

await sharp(source)
  .resize(width, height, { fit: 'cover', position: 'attention' })
  .composite([{ input: Buffer.from(overlay) }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(output)

await writeFile(
  path.join(process.cwd(), 'app', 'opengraph-image.alt.txt'),
  "Eddy's Tours — tours and experiences in Puerto Vallarta, Mexico",
)

const { size } = await stat(output)
console.log(`Wrote ${path.relative(process.cwd(), output)} (${(size / 1024).toFixed(0)} KB)`)
