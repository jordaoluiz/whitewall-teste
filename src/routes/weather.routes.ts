import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weather.service';
import { WeatherQueryParams, WeatherError } from '../types/weather.types';

const router = Router();

// Inicialização lazy do serviço para garantir que as variáveis de ambiente já foram carregadas
let weatherService: WeatherService | null = null;

const getWeatherService = (): WeatherService => {
  if (!weatherService) {
    weatherService = new WeatherService();
  }
  return weatherService;
};

/**
 * GET /weather
 * Retorna o clima de uma cidade para uma data específica
 * 
 * Query params:
 * - city: string (obrigatório) - Nome da cidade
 * - date: string (opcional) - Data no formato YYYY-MM-DD, 'today' ou 'tomorrow' (padrão: 'today')
 * - units: string (opcional) - 'metric', 'imperial' ou 'kelvin' (padrão: 'metric')
 * - lang: string (opcional) - Código do idioma (padrão: 'pt_br')
 * 
 * Exemplo: /weather?city=São Paulo&date=tomorrow
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { city, date, units, lang } = req.query;

    if (!city || typeof city !== 'string') {
      return res.status(400).json({
        error: 'Parâmetro obrigatório ausente',
        message: 'O parâmetro "city" é obrigatório',
      } as WeatherError);
    }

    const params: WeatherQueryParams = {
      city,
      date: date as string | undefined,
      units: units as 'metric' | 'imperial' | 'kelvin' | undefined,
      lang: lang as string | undefined,
    };

    const weatherData = await getWeatherService().getWeatherByDay(params);
    return res.json(weatherData);
  } catch (error) {
    const weatherError = error as WeatherError;
    
    if (weatherError.code) {
      return res.status(weatherError.code).json(weatherError);
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: weatherError.message || 'Erro desconhecido ao processar a requisição',
    } as WeatherError);
  }
});

/**
 * GET /weather/health
 * Endpoint de health check
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'weather-api',
    timestamp: new Date().toISOString(),
  });
});

export default router;

