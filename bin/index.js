#! /usr/bin/env node

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(process.cwd(), '.');
const templateDir = path.join(rootDir, 'template');

fs.readdir(templateDir, (err, files) => {
  if(err) throw err; 
  for (let file of files) {
    const currentFile = path.join(templateDir, '..', 'template', `${file}`);
    const toMoveDir = path.join(outDir, `${file}`);

    fse.copy(currentFile, toMoveDir, err => {
      if(err) throw err; // не удалось скопировать файл. Он уже существует?
      console.log(`Файл ${file} успешно скопирован`);
     })
  }
})