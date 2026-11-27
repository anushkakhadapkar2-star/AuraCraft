/**
 * Aura Craft Production Multi-Port Runner
 * Serves both:
 *  1. Storefront Website on Port 3000 (http://localhost:3000)
 *  2. Dedicated Admin Console on Port 3001 (http://localhost:3001)
 */

const { spawn } = require('child_process');
const path = require('path');

const WEBSITE_PORT = process.env.PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 3001;

console.log('\n=============================================================');
console.log('🚀 LAUNCHING AURA CRAFT PRODUCTION CLUSTER');
console.log('=============================================================');
console.log(`🛍️  Production Storefront:  http://localhost:${WEBSITE_PORT}`);
console.log(`🔐  Production Admin Panel: http://localhost:${ADMIN_PORT}`);
console.log('=============================================================\n');

// 1. Start Next.js Production Server on Port 3000
const nextProcess = spawn(`npx next start -p ${WEBSITE_PORT}`, {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: String(WEBSITE_PORT), NODE_ENV: 'production' },
});

// 2. Start Dedicated Admin Gateway on Port 3001
const adminProcess = spawn(`node "admin-server.js"`, {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, WEBSITE_PORT: String(WEBSITE_PORT), ADMIN_PORT: String(ADMIN_PORT) },
});

// Graceful cleanup on SIGINT / SIGTERM
const cleanup = () => {
  try {
    nextProcess.kill();
  } catch (e) {}
  try {
    adminProcess.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
