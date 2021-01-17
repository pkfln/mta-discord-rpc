// https://github.com/nexe/nexe/issues/702#issuecomment-570746426

const { compile } = require('nexe');
const { resolve } = require('path');
const rcedit = require('rcedit');
const fs = require('fs');

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

// (async () => {
//   try {
//     await compile({
//       input: './build/src/main.js',
//       build: true,
//       name: package.name,
//       ico: './mtasa.ico',
//       loglevel: 'verbose',
//       output: './target/mta-discord-rpc.exe',
//       // targets: [],
//       // resources: [],
//       patches: [
//         async (compiler, next) => {
//           const exePath = compiler.getNodeExecutableLocation();
//           if ((await fs.promises.stat(exePath)).size > 0) {
//             await rcedit(exePath, {
//               'version-string': rc,
//               'file-version': ver,
//               'product-version': ver,
//               icon: 'mtasa.ico',
//             });
//           }
//           return next();
//         },
//       ],
//     });
//   } catch (e) {
//     console.error(e);
//   }
// })();

(async () => {
  try {
    const output = resolve(__dirname, './target/mta-discord-rpc.exe');

    await compile({
      input: resolve(__dirname, './build/src/main.js'),
      output,
      target: 'windows-x86-12.18.2',
      name: package.name,
    });

    if ((await fs.promises.stat(output)).size > 0) {
      await rcedit(output, {
        'version-string': rc,
        'file-version': package.version,
        'product-version': package.version,
        icon: resolve(__dirname, './mtasa.ico'),
      });
    }
  } catch (e) {
    console.error(e);
  }
})();
