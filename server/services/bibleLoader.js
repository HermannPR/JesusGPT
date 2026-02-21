import fs from 'fs/promises';

export async function loadGospels(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}
