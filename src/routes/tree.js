import { router } from '../router.js';
import { buildTree } from '../fs.js';
import { ROOT } from '../config.js';

router.get('/api/tree', async (req, res) => {
  const tree = await buildTree();
  res.json({ tree, root: ROOT });
});
