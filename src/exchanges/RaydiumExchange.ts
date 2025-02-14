import axios from 'axios';
import { Currency } from '../types';
import { BaseExchange } from './BaseExchange';
import Decimal from 'decimal.js';


export class RaydiumExchange extends BaseExchange {
    name = 'Raydium';

    async initialize() {
        setInterval(async () => {
            try {
                const pairs = [
                    { base: 'ETH', quote: 'USDT' },
                    { base: 'BTC', quote: 'USDT' },
                    { base: 'SOL', quote: 'USDT' },
                ];

                for (const { base, quote } of pairs) {
                    const rate = await this.fetchRate(base as Currency, quote as Currency);
                    if (rate) {
                        this.updateRate(base as Currency, quote as Currency, rate);
                    }
                }
            } catch (error) {
                console.error('Raydium update error:', error);
            }
        }, 10000);
    }

    async fetchRate(base: Currency, quote: Currency): Promise<number | null> {
        try {
            const baseMint = this.getMintAddress(base);
            const quoteMint = this.getMintAddress(quote);

            if (!baseMint || !quoteMint) {
                throw new Error(`Mint addresses not found for pair ${base}/${quote}`);
            }

            const pools = await this.getPoolsForPair(baseMint, quoteMint);

            if (pools.length === 0) {
                console.warn(`No pools found for pair ${base}/${quote}. Check token addresses or pool availability.`);
                return null;
            }

            let totalRate = new Decimal(0);
            let count = 0;

            for (const pool of pools) {
                if (pool.price) {
                    totalRate = totalRate.add(new Decimal(pool.price));
                    count++;
                }
            }

            if (count === 0) {
                throw new Error('No valid pool prices found');
            }

            return totalRate.div(count).toNumber();
        } catch (error) {
            console.error('Failed to fetch Raydium rate:', error);
            return null;
        }
    }

    private getMintAddress(currency: Currency): string | null {
        const mintAddresses = {
            ETH: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
            BTC: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
            SOL: 'So11111111111111111111111111111111111111112',
            USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        };
        return mintAddresses[currency] || null;
    }

    private async getPoolsForPair(baseMint: string, quoteMint: string): Promise<any[]> {
        try {
            const response = await axios.get(`${process.env.RAYDIUM}/pools/info/list`, {
                params: {
                    poolType: 'all',
                    poolSortField: 'default',
                    sortType: 'desc',
                    pageSize: 100,
                    page: 1,
                },
                headers: {
                    accept: 'application/json',
                },
            });

            if (!response.data || !response.data.success || !Array.isArray(response.data.data.data)) {
                throw new Error('Invalid response structure: data is not an array');
            }

            const filteredPools = response.data.data.data.filter(
                (pool: any) =>
                    (pool.mintA?.address === baseMint && pool.mintB?.address === quoteMint) ||
                    (pool.mintA?.address === quoteMint && pool.mintB?.address === baseMint)
            );

            console.log('Filtered Pools:', JSON.stringify(filteredPools, null, 2));
            return filteredPools;
        } catch (error) {
            console.error('Failed to fetch pools:', error);
            return [];
        }
    }
}
