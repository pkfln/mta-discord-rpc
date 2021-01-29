import * as path from 'path';
import * as fs from 'fs-extra';

import * as tasklist from 'tasklist';

import MTAInstallation from './MTAInstallation';
import MTAQuery from './MTAQuery';
import Discord from './Discord';

import log from './log';

const WATCH_INTERVAL = 5e3; // ms
const PLAYER_NOT_FOUND_TIMEOUT = 20e3; // ms
const LAST_OPENED_INTERVAL = 3e3; // ms
const MAX_FAILED_QUERIES = 5; // 25 seconds

export enum EGameState {
  CLOSED,
  IDLE,
  PLAYING,
}

export default abstract class Game {
  static gameState = EGameState.CLOSED;
  static lastConnection = 0;
  static lastOpened = 0;
  static failedQueries = 0;
  static fileWatcher: fs.FSWatcher | undefined;
  static ip: string | undefined;
  static port: number | undefined;

  static resetState(): void {
    log.debug('Resetting state');
    this.gameState = EGameState.CLOSED;
    this.lastConnection = 0;
    // lastOpened shouldn't get reset
    this.failedQueries = 0;
    if (this.fileWatcher) this.fileWatcher.close();
    this.ip = undefined;
    this.port = undefined;
    this.updateRichPresence();
  }

  static watchMTASA(): void {
    setInterval(async () => {
      const mtaProcess = (await tasklist()).find(x => x.imageName === 'proxy_sa.exe');
      if (!mtaProcess && this.gameState !== EGameState.CLOSED) {
        log.debug('MTA was closed, resetting state');
        return this.resetState();
      }
      if (mtaProcess && this.gameState === EGameState.CLOSED) {
        log.debug('MTA was opened, setting gamestate to idle');
        this.lastOpened = Date.now();
        this.gameState = EGameState.IDLE;
      }

      log.silly('Watching MTASA...');

      switch (this.gameState) {
        case EGameState.IDLE:
          return this.watchConnection(); // Check if MTA SA is in focus?

        case EGameState.PLAYING:
          return this.updateRichPresence();
      }
    }, WATCH_INTERVAL);
  }

  static async watchConnection(): Promise<void> {
    if (this.gameState === EGameState.PLAYING || this.fileWatcher) return;

    log.silly('Watching connection...');

    // Directly check if the user is on a server if it's not right after MTA was opened (might have reconnected, server lag, ...)
    if (Date.now() - this.lastOpened > LAST_OPENED_INTERVAL) {
      const coreConfigSettings = await MTAInstallation.getCoreConfigSettings();
      if (coreConfigSettings.host && coreConfigSettings.port) {
        log.debug('Found a host & port in the coreConfig settings (first check when watching connection)');

        try {
          const queryResponse = await new MTAQuery(coreConfigSettings.host, parseInt(coreConfigSettings.port, 10)).query();

          if (queryResponse.players.includes(await MTAInstallation.getPlayerName())) {
            log.debug('Player has been found on the server (first check when watching connection)');
            this.ip = coreConfigSettings.host;
            this.port = parseInt(coreConfigSettings.port, 10);
            this.gameState = EGameState.PLAYING;
            this.lastConnection = Date.now();
            return this.updateRichPresence();
          }
        } catch (e) {
          log.error('Failed to query server (first check when watching connection)');
          log.trace(e);
          // Fire and forget
        }
      }
    }
    
    this.fileWatcher = fs.watch(
      path.join(await MTAInstallation.getMTAPath(), 'MTA\\config\\'),
      { recursive: true },
      async (_, filename) => {
        if (filename && filename !== 'coreconfig.xml') return;
        if (this.gameState !== EGameState.IDLE) return;

        log.silly('Detected change in coreconfig.xml...');

        const coreConfigSettings = await MTAInstallation.getCoreConfigSettings();
        if (!coreConfigSettings.host || !coreConfigSettings.port) return;

        log.silly('Server settings found, continuing...');

        this.ip = coreConfigSettings.host;
        this.port = parseInt(coreConfigSettings.port, 10);
        this.gameState = EGameState.PLAYING;
        this.lastConnection = Date.now();
        if (this.fileWatcher) this.fileWatcher.close();

        this.updateRichPresence();
      }
    );
    this.fileWatcher.on('close', () => {
      log.debug('Filewatcher closed');
      this.fileWatcher = undefined;
    });

    this.gameState = EGameState.IDLE;
    this.updateRichPresence();
  }

  static async updateRichPresence(): Promise<void> {
    switch (this.gameState) {
      case EGameState.CLOSED:
        log.debug('Disconnecting from Discord');
        await Discord.disconnect();
        break;

      case EGameState.IDLE:
        log.debug('Setting activity to idle on Discord');
        await Discord.setActivityIdle();
        break;

      case EGameState.PLAYING:
        if (!this.ip || !this.port) break;

        try {
          const queryResponse = await new MTAQuery(this.ip, this.port).query();
          if (
            Date.now() - this.lastConnection > PLAYER_NOT_FOUND_TIMEOUT && // MTA Query is cached for 10 seconds, player might not be in the list yet
            !queryResponse.players.includes(await MTAInstallation.getPlayerName())
          ) {
            log.debug('Player was not found on the server anymore');
            this.gameState = EGameState.IDLE;
            return this.updateRichPresence();
          }

          log.debug('Setting activity to playing on Discord');
          await Discord.setActivityPlaying(this.ip, this.port, this.lastConnection, queryResponse);
        } catch (e) {
          if (this.failedQueries < MAX_FAILED_QUERIES) {
            this.failedQueries++;
            log.error('Failed to query server');
            log.trace(e);
          } else {
            log.debug('Max failed queries hit, setting gamestate to idle');
            this.failedQueries = 0;
            this.gameState = EGameState.IDLE;
            return this.updateRichPresence();
          }
        }
        break;
    }
  }
}
