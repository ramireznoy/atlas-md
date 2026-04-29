import { readFile, writeFile } from 'fs/promises';
import { router } from '../router.js';
import { guardPath } from '../fs.js';

router.get('/api/file', async (req, res) => {
  const rel = new URL(req.url, 'http://x').searchParams.get('path');
  if (!rel) return res.json({ error: 'path required' }, 400);
  const content = await readFile(guardPath(rel), 'utf-8');
  res.json({ content });
});

router.put('/api/file', async (req, res) => {
  const rel = new URL(req.url, 'http://x').searchParams.get('path');
  if (!rel) return res.json({ error: 'path required' }, 400);
  const { content } = await req.json();
  await writeFile(guardPath(rel), content, 'utf-8');
  res.json({ ok: true });
});
