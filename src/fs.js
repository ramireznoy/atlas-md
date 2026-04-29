import { readdir } from 'fs/promises';
import { join, relative, extname, resolve } from 'path';
import { ROOT, EXCLUDE_NAMES, EXCLUDE_DIRS } from './config.js';

export async function buildTree(dir = ROOT, root = ROOT) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const items = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (EXCLUDE_NAMES.has(entry.name.toLowerCase())) continue;
    const fullPath = join(dir, entry.name);
    const relPath  = relative(root, fullPath);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name.toLowerCase())) continue;
      const children = await buildTree(fullPath, root);
      if (children.length)
        items.push({ type: 'dir', name: entry.name, path: relPath, children });
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') {
      items.push({ type: 'file', name: entry.name, path: relPath });
    }
  }

  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function guardPath(rel, root = ROOT) {
  const full = resolve(join(root, rel));
  if (!full.startsWith(root + '/') && full !== root)
    throw Object.assign(new Error('Path outside root'), { status: 403 });
  return full;
}
