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
  mumbai: 'https://rpc-mumbai.maticvigil.com/',
  scroll: 'https://sepolia-rpc.scroll.io',
  mantle: 'https://rpc.testnet.mantle.xyz/',
};
const CHAIN_ID_TO_NETWORK: Record<number, Networks> = {
  59140: 'linea',
  80001: 'mumbai',
  534351: 'scroll',
  5001: 'mantle',
};
type Networks = keyof typeof RPC_URL;
type ADDRESSES = Record<Networks, string>;

export const PRICE_DECIMALS = 10 ** 8;
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
    const mumbaiGravix = this.configService.get<string>('MUMBAI_GRAVIX');
    const scrollGravix = this.configService.get<string>('SCROLL_GRAVIX');
    const mantleGravix = this.configService.get<string>('MANTLE_GRAVIX');

    this.providers = {
      linea: new ethers.JsonRpcProvider(RPC_URL['linea']),
      mumbai: new ethers.JsonRpcProvider(RPC_URL['mumbai']),
      scroll: new ethers.JsonRpcProvider(RPC_URL['scroll']),
      mantle: new ethers.JsonRpcProvider(RPC_URL['mantle']),
    };
    this.vaultAddresses = {
      linea: lineaGravix,
      mumbai: mumbaiGravix,
      scroll: scrollGravix,
      mantle: mantleGravix,
    };

    this.priceNodeWallet = new ethers.Wallet(privateKey);
    this.gravixContracts = {
      linea: Gravix__factory.connect(
        this.vaultAddresses.linea,
        this.providers.linea,
      ),
      mumbai: Gravix__factory.connect(
        this.vaultAddresses.mumbai,
        this.providers.mumbai,
      ),
      scroll: Gravix__factory.connect(
        this.vaultAddresses.scroll,
        this.providers.scroll,
      ),
      mantle: Gravix__factory.connect(
        this.vaultAddresses.mantle,
        this.providers.mantle,
      ),
    };

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
        return new BigNumber(price).multipliedBy(PRICE_DECIMALS).toNumber();
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
