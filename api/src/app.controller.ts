import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { BinanceService } from './binance/binance.service';
import { EvmService } from './evm/evm.service';

@Controller()
export class AppController {
  constructor(private readonly evmService: EvmService) {}

  @Post('signature')
  getSignature(@Body() userData: { marketIdx: number; chainId: number }): any {
    return this.evmService.getSignature(userData).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }
}
