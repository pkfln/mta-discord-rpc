import * as path from 'path';

import { Tail } from 'tail';
import * as tasklist from 'tasklist';

import MTAInstallation from './MTAInstallation';
import MTAQuery from './MTAQuery';
import Discord from './Discord';

const WATCH_INTERVAL = 5e3; // ms

export enum EGameState {
  CLOSED,
  IDLE,
  PLAYING,
}

export default abstract class Game {
  static gameState = EGameState.CLOSED;
  static lastConnection = 0;
  static consoleTail: Tail | undefined;
  static logfileTail: Tail | undefined;
  static ip: string | undefined;
  static port: number | undefined;

  static resetState() {
    this.gameState = EGameState.CLOSED;
    this.lastConnection = 0;
    this.logfileTail = undefined;
    this.consoleTail = undefined;
    this.ip = undefined;
    this.port = undefined;
    this.updateRichPresence();
  }

  static watchMTASA(): void {
    setInterval(async () => {
      const mtaProcess = (await tasklist()).find(x => x.imageName === 'proxy_sa.exe');
      if (!mtaProcess) return this.resetState();

      switch (this.gameState) {
        case EGameState.CLOSED: // On first run, gamestate is still closed
        case EGameState.IDLE:
          return this.watchConnection(); // Check if MTA SA is in focus?

        case EGameState.PLAYING:
          return this.updateRichPresence();
      }
    }, WATCH_INTERVAL);
  }

  static async watchConnection() {
    if (this.gameState === EGameState.PLAYING || this.consoleTail || this.logfileTail) return;

    this.gameState = EGameState.IDLE;
    this.logfileTail = new Tail(path.win32.join(await MTAInstallation.getMTAPath(), '\\MTA\\logs\\logfile.txt'));
    this.consoleTail = new Tail(path.win32.join(await MTAInstallation.getMTAPath(), '\\MTA\\logs\\console.log'), {
      useWatchFile: true,
    }); // TODO: Check why it doesn't work with fs.watch, switch to deno solution?
    this.updateRichPresence();

    this.logfileTail.on('line', line => {
      const connectionRegex = /\d+:\d+:\d+\s-\s\[DEBUG\]\sConnecting\sto\s(.*)\:(\d+)\s\.\.\./;
      const connectionMatches = connectionRegex.exec(line);

      if (this.gameState === EGameState.IDLE && connectionMatches?.length === 3) {
        this.ip = connectionMatches[1];
        this.port = parseInt(connectionMatches[2]);
      }
    });

    this.consoleTail.on('line', line => {
      const connectedRegex = /\*\sConnected!\s\[MTA:SA\sServer.*\]/;

      if (!connectedRegex.test(line)) return;
      if (!this.ip || !this.port) return;

      this.gameState = EGameState.PLAYING;
      this.lastConnection = Date.now();
      this.logfileTail.unwatch();
      this.consoleTail.unwatch();
      this.logfileTail = undefined;
      this.consoleTail = undefined;

      this.updateRichPresence();
    });
  }

  static async updateRichPresence(): Promise<void> {
    switch (this.gameState) {
      case EGameState.CLOSED:
        await Discord.disconnect();
        break;

      case EGameState.IDLE:
        await Discord.setActivityIdle();
        break;

      case EGameState.PLAYING:
        if (!this.ip || !this.port) break;

        try {
          const queryResponse = await new MTAQuery(this.ip, this.port).query(); // TODO: If it fails multiple times, the server might have crashed
          if (
            Date.now() - this.lastConnection > 10e3 && // MTA Query is cached for 10 seconds, player might not be in the list yet
            !queryResponse.players.includes(await MTAInstallation.getPlayerName())
          )
            this.gameState = EGameState.IDLE;
          
          await Discord.setActivityPlaying(this.ip, this.port, this.lastConnection, queryResponse);
        } catch {}
        break;
    }
  }
}
