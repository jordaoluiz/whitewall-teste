// Carrega variáveis de ambiente ANTES de qualquer import que dependa delas
import { validateEnv } from './config/env.config';

// Valida variáveis de ambiente obrigatórias
validateEnv();

import express, { Express, Request, Response } from 'express';
import weatherRoutes from './routes/weather.routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (opcional - ajuste conforme necessário)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Rotas
app.use('/weather', weatherRoutes);

// Rota raiz
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API de Clima',
    version: '1.0.0',
    endpoints: {
      weather: '/weather',
      health: '/weather/health',
      documentation: {
        method: 'GET',
        path: '/weather',
        queryParams: {
          city: 'string (obrigatório) - Nome da cidade',
          date: 'string (opcional) - Data no formato YYYY-MM-DD, "today" ou "tomorrow"',
          units: 'string (opcional) - "metric", "imperial" ou "kelvin"',
          lang: 'string (opcional) - Código do idioma (ex: pt_br, en, es)',
        },
      },
    },
  });
});

// Tratamento de erros
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  // Servidor iniciado
});

