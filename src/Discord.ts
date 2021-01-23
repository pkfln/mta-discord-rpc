import * as DiscordRPC from 'discord-rpc';
import got from 'got';

import { IQueryResponse } from './MTAQuery';

const DEFAULT_IMAGE_KEY = 'mtasa';
const clientId = '794312139908317235';

class Discord {
  private rpcClient: DiscordRPC.Client;
  private connected = false;
  private serverImages: string[] = [];

  constructor() {
    DiscordRPC.register(clientId);
    this.rpcClient = new DiscordRPC.Client({ transport: 'ipc' });

    this.setupEvents();
    this.loadServerImages();
  }

  private setupEvents(): void {
    this.rpcClient.on('connected', () => (this.connected = true));
  }

  public isConnected(): boolean {
    return this.connected;
  }

  async login(): Promise<void> {
    if (this.isConnected()) return;

    try {
      await this.rpcClient.login({ clientId });
    } catch {
      throw new Error('Could not connect to Discord.');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected()) return;

    try {
      await this.rpcClient.destroy();
      this.connected = false;
    } catch {
      throw new Error('Could not disconnect from Discord.');
    }
  }

  async setActivityIdle(): Promise<void> {
    await this.login();
    await this.rpcClient.setActivity({
      state: 'Idle',
      largeImageKey: DEFAULT_IMAGE_KEY,
      instance: false,
    });
  }

  async setActivityPlaying(ip: string, port: number, lastConnection: number, queryResponse: IQueryResponse): Promise<void> {
    await this.login();

    const largeImageKey = this.getServerImageKey(ip, port);
    await this.rpcClient.setActivity({
      state: 'Playing',
      details: queryResponse.serverName,
      startTimestamp: lastConnection,
      partySize: queryResponse.playersCount,
      partyMax: queryResponse.playersMax,
      largeImageKey,
      smallImageKey: largeImageKey === DEFAULT_IMAGE_KEY ? undefined : DEFAULT_IMAGE_KEY,
      instance: true,
    });
  }

  private async loadServerImages(): Promise<void> {
    try {
      // TODO: Add Types or use API package
      const commits = await got('https://api.github.com/repos/pkfln/mta-discord-rpc/commits').json<Record<string, any>[]>();
      const repoTree = await got(commits[0].commit.tree.url).json<Record<string, any>>();
      const assetTree = await got(repoTree.tree.find(x => x.path === 'assets').url).json<Record<string, any>>();

      this.serverImages = assetTree.tree.map(x => x.path);
    } catch {
      this.serverImages = [];
    }
  }

  private getServerImageKey(ip: string, port: number): string {
    if (!this.serverImages.includes(`${ip}_${port}.png`)) return DEFAULT_IMAGE_KEY;
    return `${ip.replace(/\./g, '_')}_${port}`;
  }
}

export default new Discord();
