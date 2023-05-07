#! /usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logUpdate from 'log-update';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const templateDir = path.join(rootDir, 'template');

const startCreateVite = async (command, callback) => {
  const child = spawn(command, {
    stdio: [process.stdin, 'pipe', process.stderr],
    shell: true,
  });

  let scriptOutput = [];

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (data) {
    logUpdate.clear();
    logUpdate(data);
    data = data.toString();
    scriptOutput.push(data);
  });

  child.on('close', function (code) {
    logUpdate.clear();
    callback(scriptOutput, code);
  });
};

const recursiveFindFiles = async (dirPath) =>
  Promise.all(
    await fs.promises
      .readdir(dirPath, { withFileTypes: true })
      .then((entries) =>
        entries.map((entry) => {
          const childPath = path.join(dirPath, entry.name);
          return entry.isDirectory()
            ? recursiveFindFiles(childPath)
            : childPath;
        })
      )
  );

const deleteGitKeepFiles = async (projectPath) => {
  const dirOut = path.resolve(projectPath);
  let allFiles = await recursiveFindFiles(dirOut);
  allFiles = allFiles.flat(Number.POSITIVE_INFINITY);
  const GIT_KEEP_EXT = '.gitkeep';

  allFiles = allFiles.filter((file) =>
    file.match(new RegExp(`.*\.(${GIT_KEEP_EXT})`, 'ig'))
  );

  for (let file of allFiles) {
    await fs.promises.unlink(file);
  }
};

const copyFiles = async (projectPath) => {
  try {
    await fs.promises.cp(templateDir, path.resolve(projectPath), {
      recursive: true,
    });
  } catch {
    console.log("ERROR: We can't create FSD structure");
  }
};

const init = async () => {
  console.log('VITE + FSD structure initing process...');

  startCreateVite('npm create vite@latest', async (output) => {
    const projectPath = output
      .filter((outString) => outString.includes('Scaffolding project in'))[0]
      ?.split('in ')[1]
      ?.replace('...\n', '');

    if (projectPath) {
      await copyFiles(projectPath);
      await deleteGitKeepFiles(projectPath);
      const projectName = path.basename(projectPath);
      console.log(
        `SUCCESS!🥳 FSD structure was created\n\nRun cd ${projectName}\nnpm install\nnpm run dev`
      );
    } else {
      console.log("ERROR: We can't create FSD structure");
    }
  });
};

init();
