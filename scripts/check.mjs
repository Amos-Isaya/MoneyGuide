import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
for (const directory of ['js', 'api', 'scripts']) {
  for (const name of readdirSync(directory).filter(name => /\.m?js$/.test(name))) {
    const result = spawnSync(process.execPath, ['--check', `${directory}/${name}`], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
console.log('All application, API and server scripts passed syntax checks.');
