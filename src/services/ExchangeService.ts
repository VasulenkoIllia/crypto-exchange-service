import { Currency, ExchangeName, ExchangeRate, BestOffer } from '../types';
import { BaseExchange } from '../exchanges/BaseExchange';

export class ExchangeService {
    private exchanges: BaseExchange[];

    constructor(exchanges: BaseExchange[]) {
        this.exchanges = exchanges;
        this.initializeExchanges();
    }

    private async initializeExchanges() {
        await Promise.all(this.exchanges.map(ex => ex.initialize()));
    }

    async getRates(base: Currency, quote: Currency): Promise<ExchangeRate[]> {
        const rates = await Promise.all(
            this.exchanges.map(async (exchange) => ({
                exchange: exchange.name as ExchangeName,
                rate: await exchange.getRate(base, quote),
            }))
        );

        return rates.filter(rate => rate.rate > 0);
    }

    async estimateBestOffer(
        inputAmount: number,
        inputCurrency: Currency,
        outputCurrency: Currency
    ): Promise<BestOffer> {
        const rates = await this.getRates(inputCurrency, outputCurrency);

        const offers = rates.map(rate => ({
            exchangeName: rate.exchange,
            outputAmount: inputAmount * rate.rate,
        }));

        return offers.reduce((best, current) =>
            current.outputAmount > best.outputAmount ? current : best
        );
    }
}
