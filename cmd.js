#!/usr/bin/env node

const mri = require('mri');

const { bold, magenta } = require('kleur');

const glob = require('tiny-glob');

const fs = require('fs');
const path = require('path');

const pkg = require('./package');

const ids = require('ids')([ 32, 36, 1 ]);

const uuid = ids.next();

const config = {
  directoryTemplate: 'camunda-modeler-plugin-${NAME}',
  runCommand: 'npm run all',
  templateFiles: [
    'client/bpmn-js-extension/index.js',
    'index.js',
    'package.json',
    'README.md'
  ],
  replaceAdditional: (str) => {
    return str.replace(/\$\{UUID\}/g, uuid);
  }
};

function createReplacer(fns) {
  return (str) => {
    return fns.reduce((str, fn) => {
      if (!fn) {
        return str;
      }

      return fn(str);
    }, str);
  };
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

async function run(config) {

  const {
    directoryTemplate,
    runCommand,
    templateFiles,
    replaceAdditional
  } = config;

  const replaceTemplates = createReplacer([
    replaceAdditional,
    (str) => {
      return str.replace(/\$\{NAME\}/g, targetName);
    }
  ]);

  const args = mri(process.argv.slice(2));

  if (args.help) {
    console.log('Usage: %s name [cwd]', pkg.name);

    process.exit(0);
  }

  if (args.version || args.v) {
    console.log(pkg.version);

    process.exit(0);
  }

  const cwd = args._[1] || '.';

  const targetName = args._[0];

  if (!targetName) {
    console.error('No name specified');
    process.exit(1);
  }

  const targetPath = path.join(cwd, replaceTemplates(directoryTemplate));

  console.log(`Setting up in ${ bold(targetPath) }`);
  console.log();

  if (fs.existsSync(targetPath)) {
    console.error(`Folder ${targetPath} already exists`);
    process.exit(1);
  }

  const boilerplatePath = path.join(__dirname, 'boilerplate');

  const files = await glob('**/*', {
    cwd: boilerplatePath,
    filesOnly: true,
    dot: true
  });

  for (const file of files) {

    const srcPath = path.join(boilerplatePath, file);

    const destFile = file.endsWith('.tpl') ? file.substring(0, file.length - '.tpl'.length) : file;

    const destPath = path.join(targetPath, destFile);

    console.log('  Creating %s', magenta(destFile));

    const destDirectory = path.dirname(destPath);

    // ensure destination directory exists
    fs.mkdirSync(destDirectory, { recursive: true });

    if (templateFiles && templateFiles.includes(normalizePath(file))) {

      const contents = fs.readFileSync(srcPath, 'utf8');

      fs.writeFileSync(destPath, replaceTemplates(contents), 'utf8');
    } else {
      fs.copyFileSync(srcPath, destPath);
    }

  }

  console.log();
  console.log(bold('Done.'));

  console.log(`
Go ahead and try it out:

%s
`, magenta(`  cd ${targetPath}
  npm install
  ${runCommand}`));

}


run(config).catch(err => {
  console.error(err);
  process.exit(1);
});