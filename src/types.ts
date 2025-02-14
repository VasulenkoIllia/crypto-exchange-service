export type Currency = 'ETH' | 'BTC' | 'SOL' | 'USDT';
export type ExchangeName = 'Binance' | 'KuCoin' | 'Uniswap' | 'Raydium';

export interface ExchangeRate {
    exchange: ExchangeName;
    rate: number;
}

export interface BestOffer {
    exchangeName: ExchangeName;
    outputAmount: number;
}

export interface Token {

}
