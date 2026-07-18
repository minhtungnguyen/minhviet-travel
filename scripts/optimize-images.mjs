import sharp from 'sharp'
import { readFileSync, writeFileSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'

const publicDir = path.resolve(import.meta.dirname, '..', 'public')

// [source filename, max width in px, webp quality]
const toWebp = [
  ['editorial-hero.png', 1600, 80],
  ['editorial-mice.png', 1600, 80],
  ['brand-flatlay.jpg', 1200, 82],
  ['brand-group.png', 1200, 82],
  ['enterprise-mice.png', 1200, 82],
  ['brand-signing.png', 1200, 82],
  ['brand-leadership.png', 1200, 82],
  ['tour-tokyo.png', 1000, 82],
  ['tour-korea.png', 1000, 82],
  ['tour-europe.png', 1000, 82],
  ['tour-bali.png', 1000, 82],
  ['dest-vietnam.png', 1000, 82],
  ['dest-singapore.png', 1000, 82],
  ['dest-thailand.png', 1000, 82],
  ['dest-japan.png', 1000, 82],
  ['dest-usa.png', 1000, 82],
  ['dest-australia.png', 1000, 82],
]

let totalBefore = 0
let totalAfter = 0

for (const [file, maxWidth, quality] of toWebp) {
  const srcPath = path.join(publicDir, file)
  const before = statSync(srcPath).size
  const outFile = file.replace(/\.(png|jpe?g)$/i, '.webp')
  const outPath = path.join(publicDir, outFile)

  await sharp(readFileSync(srcPath))
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath)

  const after = statSync(outPath).size
  totalBefore += before
  totalAfter += after
  unlinkSync(srcPath)
  console.log(`${file} -> ${outFile}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
}

// Logo: keep as PNG (needs transparency), just shrink + recompress in place.
{
  const file = 'logo-minhviet.png'
  const srcPath = path.join(publicDir, file)
  const before = statSync(srcPath).size
  const buf = await sharp(readFileSync(srcPath))
    .resize({ width: 500, withoutEnlargement: true })
    .png({ quality: 85, compressionLevel: 9 })
    .toBuffer()
  writeFileSync(srcPath, buf)
  const after = buf.length
  totalBefore += before
  totalAfter += after
  console.log(`${file}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
}

console.log(
  `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`,
)
