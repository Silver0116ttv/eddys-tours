import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const imagesDirectory = path.join(process.cwd(), 'public', 'images')
const entries = await readdir(imagesDirectory)
const pngFiles = entries.filter((entry) => entry.toLowerCase().endsWith('.png'))

if (pngFiles.length === 0) {
  console.log('No PNG images found in public/images.')
  process.exit(0)
}

let inputBytes = 0
let outputBytes = 0

for (const filename of pngFiles) {
  const inputPath = path.join(imagesDirectory, filename)
  const outputPath = path.join(imagesDirectory, `${path.parse(filename).name}.webp`)

  await sharp(inputPath)
    .webp({ quality: 84, effort: 6, smartSubsample: true })
    .toFile(outputPath)

  inputBytes += (await stat(inputPath)).size
  outputBytes += (await stat(outputPath)).size
}

const megabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
const reduction = ((1 - outputBytes / inputBytes) * 100).toFixed(1)

console.log(`Optimized ${pngFiles.length} images.`)
console.log(`${megabytes(inputBytes)} -> ${megabytes(outputBytes)} (${reduction}% smaller)`)
