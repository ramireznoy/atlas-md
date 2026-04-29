#!/usr/bin/env node
import http from 'http';
import './src/routes/auth.js';
import './src/routes/tree.js';
import './src/routes/files.js';

import { router } from './src/router.js';
import { PORT, ROOT } from './src/config.js';
import { SESSION_TOKEN } from './src/auth.js';

const server = http.createServer((req, res) => router.handle(req, res));

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use.\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`\n  atlas-md running at http://localhost:${PORT}/?token=${SESSION_TOKEN}`);
  console.log(`  root: ${ROOT}\n`);
});
