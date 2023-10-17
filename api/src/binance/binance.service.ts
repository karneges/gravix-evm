import { Injectable } from '@nestjs/common';
import Binance, { Ticker } from 'binance-api-node';
import { catchError, concatMap, defer, EMPTY, timer } from 'rxjs';
type TickersCache = { [p: string]: Ticker };
@Injectable()
export class BinanceService {
  cache: TickersCache = {};
  private binanceClient: ReturnType<typeof Binance>;

  constructor() {
    this.binanceClient = Binance();

    timer(0, 15_000)
      .pipe(
        concatMap(() =>
          defer(() => this.getTickers()).pipe(
            catchError((err) => {
              console.log(err);
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();
  }

  private async getTickers() {
    this.binanceClient.allBookTickers().then((res) => {
      Object.entries(res).forEach(([key, value]) => {
        if (key.endsWith('USDT')) {
          this.cache[key] = value;
        }
      });
    });
  }

  async getPriceForTicker(ticker: string) {
    if (!this.cache[ticker]) {
      throw new Error(`Ticker ${ticker} not found`);
    }
    return (this.cache[ticker] as unknown as { askPrice: number }).askPrice;
  }
}
