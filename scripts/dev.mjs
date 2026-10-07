import { spawn } from 'node:child_process';

function start(name, cwd) {
  const child = spawn('npm', ['run', 'dev'], { cwd, stdio: 'inherit', shell: true });
  child.on('exit', (code) => {
    if (code) console.error(`${name} stopped with code ${code}`);
  });
  return child;
}

const api = start('api', 'apps/api');
const web = start('web', 'apps/web');

function stop() {
  api.kill();
  web.kill();
  process.exit(0);
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
