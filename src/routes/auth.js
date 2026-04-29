import { router } from '../router.js';

router.get('/api/auth', (req, res) => res.json({ ok: true }));
