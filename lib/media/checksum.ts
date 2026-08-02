/** SHA-256 hex digest of a File's content, computed client-side via Web Crypto — the file never round-trips through a server function just to be hashed. */
export async function computeFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
