const fs = require('fs');
const path = require('path');
const { copyFile } = require('fs/promises');

async function copyFolder(src, dest) {
  try {
    await fs.promises.mkdir(dest, { recursive: true });
    const files = await fs.promises.readdir(src);
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stat = await fs.promises.stat(srcPath);
      if (stat.isDirectory()) {
        await copyFolder(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function copyFiles() {
  try {
    await copyFile('./src/plugin.yml', './dist/@NWeaponRe/src/plugin.yml');
    console.log('plugin.yml copied successfully!');
    await copyFolder('./src/resource/', './dist/@NWeaponRe/src/resource/');
    console.log('resource copied successfully!');
  } catch (err) {
    console.error(err);
  }
}

copyFiles();

