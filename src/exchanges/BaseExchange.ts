import WebSocket from 'ws';
import { Currency } from '../types';

export abstract class BaseExchange {
    abstract name: string;
    protected rates = new Map<string, number>();
    protected ws?: WebSocket; // Змінено на protected

    abstract initialize(): Promise<void>;

    protected connectWebSocket(url: string, onMessage: (data: any) => void) {
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
            console.log(`Connected to ${this.name} WebSocket`);
        });

        this.ws.on('message', (data: string) => {
            onMessage(JSON.parse(data));
        });

        this.ws.on('error', (err) => {
            console.error(`${this.name} WebSocket error:`, err);
        });

        this.ws.on('close', () => {
            console.log(`${this.name} WebSocket connection closed`);
        });
    }

    async getRate(base: Currency, quote: Currency): Promise<number> {
        const pair = `${base}/${quote}`;
        return this.rates.get(pair) || 0;
    }

    protected updateRate(base: Currency, quote: Currency, rate: number) {
        const pair = `${base}/${quote}`;
        this.rates.set(pair, rate);
        this.rates.set(`${quote}/${base}`, 1 / rate);
    }
}
