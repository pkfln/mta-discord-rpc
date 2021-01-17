// https://github.com/multitheftauto/mtasa-blue/blob/master/Server/mods/deathmatch/logic/ASE.cpp

import Dgram, { IncomingPacket } from 'dgram-as-promised';

export interface IQueryResponse {
  serverName: string;
  playersCount: number;
  playersMax: number;
  players: string[];
}

export default class MTAQuery {
  constructor(private ip: string, private port = 22003, private isUDPPort = false) {}

  private async timeoutPromise(timeoutMs: number, promise: Promise<unknown>, failureMessage?: string): Promise<unknown> {
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error(failureMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).then(result => {
      clearTimeout(timeoutHandle);
      return result;
    });
  }

  async query(): Promise<IQueryResponse> {
    const socket = Dgram.createSocket('udp4');
    let packet: Promise<IncomingPacket>;

    await this.timeoutPromise(1000, socket.send('s', this.port + (this.isUDPPort ? 0 : 123), this.ip), 'MTAQuery: Could not send buffer to server.');
    await this.timeoutPromise(1000, packet = socket.recv(), 'MTAQuery: Did not get any response.');
    await socket.close();

    let response = new TextDecoder().decode((await packet).msg);

    if (response.substr(0, 4) !== 'EYE1') throw Error('MTAQuery: Buffer contained invalid header.');

    response = response.substr(4);

    const parsedData: string[] = [];
    while (response.length) {
      if (response.substr(0, 2) === `${String.fromCharCode(1)}?`) response = response.substr(2);

      const length = response.charCodeAt(0);
      parsedData.push(response.substr(1, length - 1));

      response = response.substr(length);
    }

    const serverName = parsedData[2];
    const playersCount = parseInt(parsedData[7]);
    const playersMax = parseInt(parsedData[8]);
    const players = [];

    for (let i = 9; i < 9 + (playersCount * 0x5); i += 0x5)
      players.push(parsedData[i]);

    return { serverName, playersCount, playersMax, players };
  }
}
