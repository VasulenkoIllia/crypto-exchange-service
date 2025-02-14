import { ChainId, CurrencyAmount, Token,TradeType } from '@uniswap/sdk-core';
import { Pair, Route, Trade,  } from '@uniswap/v2-sdk';
import { ethers } from 'ethers';
import { Currency } from '../types';
import { BaseExchange } from './BaseExchange';
import 'dotenv/config'

// Токени
const ETH = new Token(ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether');
const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
const BTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC');
const SOL = new Token(ChainId.MAINNET, '0xD31a59c85aE9D8edEFeC411D448f90841571b89c', 9, 'SOL', 'Wrapped Solana');

const uniswapV2PoolABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
];

export class UniswapExchange extends BaseExchange {
    name = 'Uniswap';
    private provider: ethers.providers.WebSocketProvider;

    constructor() {
        super();
        const infuraApiUrl = 'wss://mainnet.infura.io/ws/v3/' + process.env.INFURA
        this.provider = new ethers.providers.WebSocketProvider(
            infuraApiUrl
        );
    }

    async initialize() {
        setInterval(async () => {
            try {
                const pairs = [
                    { base: 'ETH', quote: 'USDT' },
                    { base: 'BTC', quote: 'USDT' },
                    { base: 'SOL', quote: 'ETH' },
                ];

                for (const { base, quote } of pairs) {
                    const rate = await this.fetchRate(base as Currency, quote as Currency);
                    if (rate) {
                        this.updateRate(base as Currency, quote as Currency, rate);
                    }
                }
            } catch (error) {
                console.error('Uniswap update error:', error);
            }
        }, 10000);
    }

    private async fetchRate(base: Currency, quote: Currency): Promise<number | null> {
        try {
            const baseToken = this.getToken(base);
            const quoteToken = this.getToken(quote);

            if (!baseToken || !quoteToken) {
                throw new Error('Invalid token pair');
            }

            const pair = await this.createPair(baseToken, quoteToken);

            const [token0, token1] = baseToken.sortsBefore(quoteToken) ? [baseToken, quoteToken] : [quoteToken, baseToken];

            const route = new Route([pair], token0, token1);

            const trade = new Trade(
                route,
                CurrencyAmount.fromRawAmount(token0, '1000000000000000000'), // 1 токен у базовій валюті
                TradeType.EXACT_INPUT
            );

            return parseFloat(trade.executionPrice.toSignificant(6));
        } catch (error) {
            console.error('Failed to fetch Uniswap rate:', error);
            return null;
        }
    }

    private async createPair(tokenA: Token, tokenB: Token): Promise<Pair> {
        const pairAddress = Pair.getAddress(tokenA, tokenB);

        const pairContract = new ethers.Contract(pairAddress, uniswapV2PoolABI, this.provider);

        const reserves = await pairContract.getReserves();
        const [reserve0, reserve1] = [reserves.reserve0.toString(), reserves.reserve1.toString()];

        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];

        return new Pair(
            CurrencyAmount.fromRawAmount(token0, reserve0),
            CurrencyAmount.fromRawAmount(token1, reserve1)
        );
    }

    private getToken(symbol: Currency): Token | null {
        const tokens = {
            ETH,
            USDT,
            BTC,
            SOL,
        };

        return tokens[symbol] || null;
    }
}
