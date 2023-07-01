const fs = require('fs');
const archiver = require('archiver');

async function zipFolder() {
  try {
    const output = fs.createWriteStream('./dist/@NWeaponRe.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    archive.on('error', (err) => {
      throw err;
    });
    archive.pipe(output);
    archive.directory('./dist/@NWeaponRe/src', false);
    await archive.finalize();
  } catch (err) {
    console.error(err);
  }
}

zipFolder();
