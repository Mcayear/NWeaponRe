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
    let middle = ''; // 中间件
    if (fs.existsSync(path.join(__dirname, '../dist/@NWeaponRe/src/'))) {
      console.log('find the directory: ../dist/@NWeaponRe/src/');
      middle = "src/";
    }
    await copyFile(path.join(__dirname, '../src/plugin.yml'), path.join(__dirname, '../dist/@NWeaponRe/'+middle+'plugin.yml'));
    console.log('plugin.yml copied successfully!');
    await copyFolder(path.join(__dirname, '../src/resource/'),  path.join(__dirname, '../dist/@NWeaponRe/'+middle+'src/resource/'));
    console.log('resource copied successfully!');
  } catch (err) {
    console.error(err);
  }
}

copyFiles();

