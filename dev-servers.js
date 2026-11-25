/**
 * Aura Craft Multi-Port Server Runner
 * Runs:
 *  1. Storefront Website on Port 3000 (http://localhost:3000)
 *  2. Admin Panel on Port 3001 (http://localhost:3001)
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const WEBSITE_PORT = 3000;
const ADMIN_PORT = 3001;

console.log('\n=============================================================');
console.log('🚀 STARTING AURA CRAFT SERVERS ON 2 SEPARATE PORTS');
console.log('=============================================================');
console.log(`🛍️  Aura Craft Website (Storefront):  http://localhost:${WEBSITE_PORT}`);
console.log(`🔐  Aura Craft Admin Panel:           http://localhost:${ADMIN_PORT}`);
console.log('=============================================================\n');

// 1. Spawn Next.js Dev Server on Port 3000
const nextProcess = spawn(`npx next dev -p ${WEBSITE_PORT}`, {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: String(WEBSITE_PORT) },
});

// 2. Spawn the dedicated Admin Server on Port 3001
const adminProcess = spawn(`node "admin-server.js"`, {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// Clean exit on Ctrl+C or kill
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
