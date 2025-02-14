import axios from 'axios';
import { Currency } from '../types';
import { BaseExchange } from './BaseExchange';

export class KuCoinExchange extends BaseExchange {
    name = 'KuCoin';

    async initialize() {
        setInterval(async () => {
            try {
                const pairs = ['ETH-USDT', 'BTC-USDT', 'SOL-ETH'];
                for (const pair of pairs) {
                    const response = await axios.get(
                        `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${pair}`
                    );
                    const [base, quote] = pair.split('-') as [Currency, Currency];
                    this.updateRate(base, quote, parseFloat(response.data.data.price));
                }
            } catch (error) {
                console.error('KuCoin update error:', error);
            }
        }, 5000);
    }
}
