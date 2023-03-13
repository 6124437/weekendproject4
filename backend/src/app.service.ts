import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as tokenJson from './/assets/MyToken.json';
import * as ballotJson from './/assets/Ballot.json';

const TOKEN_CONTRACT_ADDRESS = '0x0C1d158A2252Dd0ecaF24732F6785fFBD519cF76';
const BALLOT_CONTRACT_ADDRESS = '0x8E109007AeF88fACD7Ac2ddF80C35D0C06B06fd2';

@Injectable()
export class AppService {
  provider;
  tokenContract;
  ballotContract;

  constructor(private configService: ConfigService) {
    this.provider = new ethers.providers.AlchemyProvider(
      'goerli',
      this.configService.get<string>('ALCHEMY_API_KEY'),
    );
    this.tokenContract = new ethers.Contract(
      TOKEN_CONTRACT_ADDRESS,
      tokenJson.abi,
      this.provider,
    );
    this.ballotContract = new ethers.Contract(
      BALLOT_CONTRACT_ADDRESS,
      ballotJson.abi,
      this.provider,
    );
  }
  getTokenContractAddress(): string {
    return this.tokenContract.address;
  }
  getBallotContractAddress(): string {
    return this.ballotContract.address;
  }

  async getTotalSupply(): Promise<number> {
    const totalSupplyBN = await this.tokenContract.totalSupply();
    const totalSupplyString = ethers.utils.formatEther(totalSupplyBN);
    const totalSupplyNumber = parseFloat(totalSupplyString);
    return totalSupplyNumber;
  }

  async getAllowance(from: string, to: string): Promise<number> {
    const allowanceBN = await this.tokenContract.allowance(from, to);
    const allowanceString = ethers.utils.formatEther(allowanceBN);
    const allowanceNumber = parseFloat(allowanceString);
    return allowanceNumber;
  }

  async getTransactionStatus(hash: string): Promise<string> {
    const tx = await this.provider.getTransaction(hash);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1 ? 'Completed' : 'Reverted';
  }

  async requestTokens(address: string, amount: number) {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    console.log('privateKey', privateKey);
    const wallet = new ethers.Wallet(privateKey).connect(this.provider);
    const tx = await this.tokenContract
      .connect(wallet)
      .mint(wallet.address, amount);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1 ? 'Completed' : 'Reverted';
  }

  async delegateTokens() {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey).connect(this.provider);
    const tx = await this.tokenContract
      .connect(wallet)
      .delegate(wallet.address);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1 ? 'Completed' : 'Reverted';
  }

  async castVote(proposal: number, amount: number) {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey).connect(this.provider);
    const tx = await this.ballotContract.connect(wallet).vote(proposal, amount);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1 ? 'Completed' : 'Reverted';
  }
}
