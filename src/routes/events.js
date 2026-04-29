import { router } from '../router.js';

router.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
  });
  res.write(':ok\n\n');

  const timer = setInterval(() => res.write(':ping\n\n'), 20_000);

  return new Promise(resolve => {
    req.on('close', () => { clearInterval(timer); resolve(); });
  });
});
