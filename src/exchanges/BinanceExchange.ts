import axios from 'axios';
import { Currency } from '../types';
import { BaseExchange } from './BaseExchange';

export class BinanceExchange extends BaseExchange {
    name = 'Binance';

    async initialize() {
        setInterval(async () => {
            try {
                const pairs = ['ETHUSDT', 'BTCUSDT', 'SOLETH'];
                for (const pair of pairs) {
                    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
                    const [base, quote] = this.parsePair(pair);
                    this.updateRate(base as Currency, quote as Currency, parseFloat(response.data.price));
                }
            } catch (error) {
                console.error('Binance update error:', error);
            }
        }, 5000);
    }

    private parsePair(pair: string): [string, string] {
        return [pair.slice(0, 3), pair.slice(3)] as [string, string];
    }
}
