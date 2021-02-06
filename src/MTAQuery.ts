import * as Gamedig from 'gamedig';

export interface IQueryResponse {
  serverName: string;
  playersCount: number;
  playersMax: number;
  players: string[];
}

export default class MTAQuery {
  constructor(private ip: string, private port = 22003) {}

  async query(): Promise<IQueryResponse> {
    const result = await Gamedig.query({ type: 'mtasa', host: this.ip, port: this.port });

    return {
      serverName: result.name,
      playersCount: result.players.length,
      playersMax: result.maxplayers,
      players: result.players.map(p => p.name),
    };
  }
}
