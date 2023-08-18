import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

import { Command } from 'commander';

import { checkGitStatus } from './utils/master';
import { defaultConfig } from './config';
import { warn } from './utils/logger';

const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');

const program = new Command();

program
  .name('replace-package')
  .description('replace your legacy package')
  .version('0.0.1');

program
  .command('init')
  .action((() => {
    try {
      fs.accessSync(path.resolve('codemod.json'));
      warn('codemod.json file already exists, override config');

      const content = fs.readFileSync(path.resolve('codemod.json'), 'utf-8');

      fs.writeFileSync(
        path.resolve('codemod.json'),
        JSON.stringify({
          ...JSON.parse(content),
          'replace-package': defaultConfig['replace-package'],
        }, null, 2)
      );

    } catch {
      fs.writeFileSync(
        path.resolve('codemod.json'),
        JSON.stringify(defaultConfig, null, 2)
      );
    }
  }))

program
  .argument('<dirs...>')
  .option('-f, --force', 'skip check git status')
  .action((dirs, options) => {
    const args: string[] = [];

    checkGitStatus(options.force);

    args.push(path.join(__dirname, `./transform.js`));
    args.push(...dirs);
    const command = `${jscodeshiftExecutable} -t ${args.join(' ')}`;
    execSync(command, { stdio: 'inherit' });
  });

program.parse();