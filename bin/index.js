#! /usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(process.cwd(), '.');
const templateDir = path.join(rootDir, 'template');

const EMPTY_FOLDERS_IN_SRC = ['public', 'entities', 'features', 'pages', 'widgets'];

const deleteGitKeepFiles = () => {
  for (let folder of EMPTY_FOLDERS_IN_SRC) {
    const deletingFileInEmptyDir = folder === 'public' 
    ? path.join(outDir, 'public', '.gitkeep') 
    : path.join(outDir, 'src', `${folder}`, '.gitkeep');
  
    fs.unlink(`${deletingFileInEmptyDir}`, err => {
      if(err) throw err; 
    });
  };
};

const copyFiles = async () => {
  await fs.promises.cp(templateDir, outDir, { recursive: true })
}


const init = async () => {
  await copyFiles();
  deleteGitKeepFiles();
}

init();
