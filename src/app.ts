import express from 'express';
import { ApiController } from './controllers/apiController';
import { ExchangeService } from './services/ExchangeService';
import { BinanceExchange } from './exchanges/BinanceExchange';
import { KuCoinExchange } from './exchanges/KuCoinExchange';
import { UniswapExchange } from './exchanges/UniswapExchange';
import { RaydiumExchange } from './exchanges/RaydiumExchange';

const app = express();
const exchanges = [
    new BinanceExchange(),
    new KuCoinExchange(),
    new UniswapExchange(),
    new RaydiumExchange(),
];

const exchangeService = new ExchangeService(exchanges);
const apiController = new ApiController(exchangeService);



app.get('/rates', apiController.getRates.bind(apiController));
app.get('/estimate', apiController.estimate.bind(apiController));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

