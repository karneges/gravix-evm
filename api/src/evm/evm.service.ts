import { Injectable } from '@nestjs/common';
import {
  ethers,
  getBytes,
  JsonRpcProvider,
  solidityPackedKeccak256,
} from 'ethers';
import { ConfigService } from '@nestjs/config';
import { BinanceService } from '../binance/binance.service';
import { Gravix, Gravix__factory } from '../misc';
import { IGravix } from '../misc/Gravix';
import { catchError, concatMap, from, mergeMap, tap, timer } from 'rxjs';
import BigNumber from 'bignumber.js';

const RPC_URL = {
  linea: 'https://rpc.goerli.linea.build',
};
const CHAIN_ID_TO_NETWORK: Record<number, Networks> = {
  59140: 'linea',
};
type Networks = keyof typeof RPC_URL;
type ADDRESSES = Record<Networks, string>;

export const USDT_DECIMALS = 10 ** 6;
@Injectable()
export class EvmService {
  vaultAddresses: ADDRESSES = {} as any;
  providers: Record<Networks, JsonRpcProvider> = {} as any;
  gravixContracts: Record<Networks, Gravix> = {} as any;
  marketsCache: Record<Networks, IGravix.MarketInfoStructOutput[]> = {} as any;
  private readonly priceNodeWallet: ethers.Wallet;
  constructor(
    private configService: ConfigService,
    private readonly binanceService: BinanceService,
  ) {
    const privateKey = this.configService.get<string>('PRIVATE_KEY_PRICE_NODE');
    const lineaGravix = this.configService.get<string>('LINEA_GRAVIX');

    this.providers = {
      linea: new ethers.JsonRpcProvider('https://rpc.goerli.linea.build'),
    };
    this.vaultAddresses.linea = lineaGravix;

    this.priceNodeWallet = new ethers.Wallet(privateKey);
    this.gravixContracts.linea = Gravix__factory.connect(
      this.vaultAddresses.linea,
      this.providers.linea,
    );

    this.updateMarketsCrone();
  }
  updateMarketsCrone() {
    timer(0, 30_000)
      .pipe(
        concatMap(() =>
          from(Object.entries(this.gravixContracts)).pipe(
            mergeMap(([network, contract]) => {
              return from(contract.getAllMarkets()).pipe(
                tap((markets) => {
                  this.marketsCache[network as Networks] = markets;
                }),
                catchError((err) => {
                  console.log(`Update markets for ${network} error: ${err}`);
                  return timer(1000);
                }),
              );
            }),
          ),
        ),
      )
      .subscribe();
  }
  async getSignature({
    chainId,
    marketIdx,
  }: {
    marketIdx: number;
    chainId: number;
  }): Promise<{ price: number; timestamp: number; signature: string }> {
    const network = CHAIN_ID_TO_NETWORK[chainId];
    if (!network) throw new Error(`Chain id ${chainId} is not supported`);
    const markets = this.marketsCache[network];
    if (!markets)
      throw new Error(`Markets for ${network} network are not found`);
    const market = markets.find((el) => el.marketIdx === BigInt(marketIdx));
    if (!market)
      throw new Error(`Market ${marketIdx} in ${network} is not found`);
    const { ticker } = market;
    const price = await this.binanceService
      .getPriceForTicker(ticker)
      .then((price) => {
        return new BigNumber(price).multipliedBy(USDT_DECIMALS).toNumber();
      });
    const timestamp = Date.now();
    const signature = await this.priceNodeWallet.signMessage(
      getBytes(
        solidityPackedKeccak256(
          ['uint256', 'uint256', 'uint256'],
          [price, timestamp, marketIdx],
        ),
      ),
    );
    return { price, timestamp, signature };
  }
}
