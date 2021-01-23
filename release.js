// https://github.com/nexe/nexe/issues/702#issuecomment-570746426

const { compile } = require('nexe');
const { resolve } = require('path');
const rcedit = require('rcedit');
const fs = require('fs');
const bufferpack = require('bufferpack');

const package = require('./package.json');

const rc = {
  CompanyName: 'pkfln',
  ProductName: package.name,
  FileDescription: package.description,
  FileVersion: package.version,
  ProductVersion: package.version,
  OriginalFilename: `${package.name}.exe`,
  InternalName: package.name,
  LegalCopyright: 'Copyright pkfln 2021. MIT license.',
};

(async () => {
  try {
    const output = resolve(__dirname, './target/mta-discord-rpc.exe');

    await compile({
      input: resolve(__dirname, './build/src/main.js'),
      output,
      build: true,
      rc,
      ico: resolve(__dirname, './mtasa.ico'),
      verbose: true,
      target: 'windows-x86-12.18.2',
      name: package.name,
      patches: [
        async (compiler, next) => {
          const exePath = compiler.getNodeExecutableLocation();
          if ((await fs.promises.stat(exePath)).size > 0) {
            await rcedit(exePath, {
              'version-string': rc,
              'file-version': package.version,
              'product-version': package.version,
              icon: resolve(__dirname, './mtasa.ico'),
            });
          }
          return next();
        },
      ],
    });

    // Patch CLI from showing up
    const outputHandle = await fs.promises.open(output, 'r+');

    const read = async (position, size) => {
      const buffer = Buffer.alloc(size);
      await outputHandle.read(buffer, 0, size, position);

      return buffer;
    };

    const write = async (position, buffer) => await outputHandle.write(buffer, 0, buffer.length, position);

    const [PeHeaderOffset] = Array.from(bufferpack.unpack('<H', await read(0x3c, 2)));
    const [PeSignature] = Array.from(bufferpack.unpack('<I', await read(PeHeaderOffset, 4)));

    if (PeSignature !== 0x4550) throw new Error('File is missing PE header signature.');

    await write(PeHeaderOffset + 0x5c, bufferpack.pack('<H', [0x2]));
    await outputHandle.close();
  } catch (e) {
    console.error(e);
  }
})();
