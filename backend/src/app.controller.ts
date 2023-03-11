import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CastVoteDto } from 'dtos/CastVoteDto';
import { RequestTokensDto } from 'dtos/RequestTokensDto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get("/token-contract-address")
  getTokenContractAddress(): {address: string}{
    return {address: this.appService.getTokenContractAddress()};
  }

  @Get("/ballot-contract-address")
  getBallotContractAddress(): {address: string}{
    return {address: this.appService.getBallotContractAddress()};
  }

  @Get("/total-supply")
  async getTotalSupply(): Promise<number>{
    return await this.appService.getTotalSupply();
  }

  @Get('allowance')
  async getAllowance(
    @Query('from') from: string,
    @Query('to') to: string
  ): Promise<number> {
    return await this.appService.getAllowance(from, to);
  }

  @Get("/transaction-status")
  async getTransactionStatus(
    @Query('hash') hash: string): Promise<string>{
    return this.appService.getTransactionStatus(hash);
  }

  @Post("/request-tokens")
  async requestTokens(@Body() body : RequestTokensDto) {
    return {result: this.appService.requestTokens(body.address, body.amount)};
  }

  @Post("/delegate-tokens")
  async delegateTokens() {
    return {result: this.appService.delegateTokens()};
  }
  
  @Post("/cast-vote")
  async castVote(@Body() body : CastVoteDto) {
    return {result: this.appService.castVote(body.proposal, body.amount)};
  }


}
