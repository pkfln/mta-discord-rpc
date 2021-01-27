import * as path from 'path';
import * as fs from 'fs-extra';

import * as execa from 'execa';
import { parseStringPromise } from 'xml2js';

const regPath = 'HKLM:\\SOFTWARE\\Classes\\mtasa\\shell\\open\\command';
const regName = '(default)';
const exeName = 'Multi Theft Auto.exe';

export default abstract class MTAInstallation {
  static mtaPath = '';

  static async getMTAPath(): Promise<string> {
    await this.determineMTAPath();

    return this.mtaPath;
  }

  static async determineMTAPath(): Promise<void> {
    if (this.mtaPath) return;

    let response: execa.ExecaReturnValue<string>;

    try {
      response = await execa('powershell.exe', [`(Get-ItemProperty -Path ${regPath}).'${regName}'`]);

      if (!response.stdout) throw Error();
    } catch {
      throw Error('Could not find MTA installation path. (1)');
    }

    const trimmedPath = response.stdout.substr(1, response.stdout.length - 2);
    const win32Path = path.win32.dirname(trimmedPath);

    try {
      await fs.access(path.win32.join(win32Path, exeName));
    } catch {
      throw Error('Could not find MTA installation path. (2)');
    }

    this.mtaPath = win32Path;
  }

  // TODO: Type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getCoreConfigSettings(): Promise<any> {
    await this.determineMTAPath();

    const coreConfig = await fs.readFile(path.win32.join(this.mtaPath, '\\MTA\\config\\coreconfig.xml'), 'utf8');
    const parsed = await parseStringPromise(coreConfig);

    return Object.entries(parsed.mainconfig?.settings[0])
      .map(val => ({ [val[0]]: val[1][0] }))
      .reduce((prev, curr) => ({ ...prev, ...curr }));
  }

  static async getPlayerName(): Promise<string> {
    await this.determineMTAPath();

    const parsedCoreConfig = await this.getCoreConfigSettings();
    const playerName = parsedCoreConfig.nick.replace(/#[0-9a-f]{6}/gi, ''); // remove all hex colors

    return playerName;
  }
}
