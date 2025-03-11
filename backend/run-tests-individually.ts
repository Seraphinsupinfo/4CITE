import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join, normalize } from 'path';

const testDir = './test';
const testFiles: string[] = [];

function findTestFiles(dir: string) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      findTestFiles(fullPath);
    } else if (fullPath.endsWith('.spec.ts')) {
      testFiles.push(normalize(fullPath).replace(/\\/g, '/'));
    }
  });
}

findTestFiles(testDir);

testFiles.forEach(file => {
  console.log(`Running tests in ${file}`);
  execSync(`jest ${file} --detectOpenHandles`, { stdio: 'inherit' });
});