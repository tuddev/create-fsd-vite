#! /usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logUpdate from 'log-update';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const outDir = path.join(process.cwd(), '.');
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

const deleteGitKeepFiles = async (projectName) => {
  const dirOut = path.join(outDir, projectName);
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

const copyFiles = async (projectName) => {
  try {
    await fs.promises.cp(templateDir, path.join(outDir, projectName), {
      recursive: true,
    });
  } catch {
    console.log("ERROR: can't create FSD structure");
  }
};

const init = async () => {
  console.log('VITE + FSD structure initing process...');

  startCreateVite('npm create vite@latest', async (output) => {
    const projectName = output[output.length - 1]
      .split('\n')[0]
      .trim()
      .split(' ')[1];

    if (projectName) {
      await copyFiles(projectName);
      await deleteGitKeepFiles(projectName);
    } else {
      console.log("ERROR: can't create FSD structure");
    }

    console.log('SUCCESS!🥳 FSD structure was created');
  });
};

init();
