import { Request, Response } from 'express';
import { ExchangeService } from '../services/ExchangeService';
import {Currency} from "../types";

export class ApiController {
    constructor(private exchangeService: ExchangeService) {}

    async getRates(req: Request, res: Response) {
        try {
            const { baseCurrency, quoteCurrency } = req.query;
            const rates = await this.exchangeService.getRates(
                baseCurrency as Currency,
                quoteCurrency as Currency
            );
            res.json({ rates });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get rates' });
        }
    }

    async estimate(req: Request, res: Response) {
        try {
            const { inputAmount, inputCurrency, outputCurrency } = req.query;
            const result = await this.exchangeService.estimateBestOffer(
                parseFloat(inputAmount as string),
                inputCurrency as Currency,
                outputCurrency as Currency
            );
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to estimate offer' });
        }
    }
}
