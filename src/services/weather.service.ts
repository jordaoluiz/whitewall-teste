// Garante que as variáveis de ambiente estão carregadas
import '../config/env.config';

import axios, { AxiosInstance } from 'axios';
import {
  WeatherCurrentResponse,
  WeatherForecastResponse,
  WeatherByDayResponse,
  WeatherQueryParams,
  WeatherError,
} from '../types/weather.types';

export class WeatherService {
  private apiClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEY não configurada nas variáveis de ambiente');
    }

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      params: {
        appid: this.apiKey,
        units: 'metric',
        lang: 'pt_br',
      },
    });
  }

  /**
   * Busca o clima para uma cidade e data específica
   */
  async getWeatherByDay(params: WeatherQueryParams): Promise<WeatherByDayResponse> {
    const { city, date, units = 'metric', lang = 'pt_br' } = params;

    try {
      // Se não especificar data ou for 'today', usa o endpoint /weather (clima atual)
      if (!date || date === 'today') {
        return await this.getCurrentWeather(city, units, lang);
      }

      // Para qualquer data específica (incluindo hoje se especificada), usa o endpoint /forecast
      // Isso garante que estamos buscando pela data exata solicitada
      const targetDate = this.parseDate(date);
      return await this.getForecastWeather(city, targetDate, units, lang);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const weatherError: WeatherError = {
          error: 'Erro ao buscar dados de clima',
          message: error.response?.data?.message || error.message,
          code: error.response?.status,
        };
        throw weatherError;
      }
      throw error;
    }
  }

  /**
   * Busca o clima atual usando o endpoint /weather
   */
  private async getCurrentWeather(
    city: string,
    units: string,
    lang: string
  ): Promise<WeatherByDayResponse> {
    const response = await this.apiClient.get<WeatherCurrentResponse>('/weather', {
      params: {
        q: city,
        units,
        lang,
      },
    });

    return this.formatCurrentWeatherResponse(response.data);
  }

  /**
   * Busca previsão do tempo para uma data específica usando o endpoint /forecast
   */
  private async getForecastWeather(
    city: string,
    targetDate: Date,
    units: string,
    lang: string
  ): Promise<WeatherByDayResponse> {
    // Primeiro, busca as coordenadas da cidade
    const geoResponse = await this.apiClient.get('/geo/1.0/direct', {
      params: { q: city, limit: 1 },
    });

    if (!geoResponse.data || geoResponse.data.length === 0) {
      throw new Error(`Cidade "${city}" não encontrada`);
    }

    const { lat, lon, name, country } = geoResponse.data[0];

    // Valida se a data está dentro do range disponível (próximos 5 dias)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDateCopy = new Date(targetDate);
    targetDateCopy.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.round((targetDateCopy.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      throw new Error(
        `Não é possível buscar dados de clima para datas passadas. Data solicitada: ${this.formatDateLocal(targetDate)}`
      );
    }

    if (daysDiff > 5) {
      throw new Error(
        `A previsão do tempo está disponível apenas para os próximos 5 dias. Data solicitada: ${this.formatDateLocal(targetDate)}`
      );
    }

    // Busca a previsão do tempo (forecast de 5 dias)
    const forecastResponse = await this.apiClient.get<WeatherForecastResponse>(
      '/forecast',
      {
        params: {
          lat,
          lon,
          units,
          lang,
        },
      }
    );

    // Verifica se a resposta tem dados
    if (!forecastResponse.data || !forecastResponse.data.list || forecastResponse.data.list.length === 0) {
      throw new Error('Nenhum dado de previsão disponível na resposta da API');
    }

    const weatherData = this.findWeatherByDate(forecastResponse.data, targetDate);

    if (!weatherData) {
      const availableDates = forecastResponse.data.list
        .map(item => this.formatDateLocal(new Date(item.dt * 1000)))
        .filter((date, index, self) => self.indexOf(date) === index)
        .slice(0, 5);
      
      throw new Error(
        `Dados de clima não disponíveis para a data: ${this.formatDateLocal(targetDate)}. ` +
        `A previsão está disponível apenas para os próximos 5 dias. ` +
        `Datas disponíveis: ${availableDates.join(', ')}`
      );
    }

    return this.formatForecastWeatherResponse(weatherData, name, country);
  }

  /**
   * Parse da data fornecida (today, tomorrow ou YYYY-MM-DD)
   */
  private parseDate(date?: string): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (!date || date === 'today') {
      return now;
    }

    if (date === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // Parse de YYYY-MM-DD
    // Usa o formato local para evitar problemas de timezone
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
      throw new Error(`Formato de data inválido: ${date}. Use 'today', 'tomorrow' ou 'YYYY-MM-DD'`);
    }

    const [, year, month, day] = dateMatch;
    const parsedDate = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1, // Mês é 0-indexed
      parseInt(day, 10)
    );

    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Data inválida: ${date}. Use 'today', 'tomorrow' ou 'YYYY-MM-DD'`);
    }

    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
  }

  /**
   * Formata data para YYYY-MM-DD usando timezone local
   */
  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Encontra os dados de clima para uma data específica
   * Retorna o período mais representativo do dia (preferencialmente meio-dia)
   */
  private findWeatherByDate(
    forecast: WeatherForecastResponse,
    targetDate: Date
  ): WeatherForecastResponse['list'][0] | null {
    const targetDateStr = this.formatDateLocal(targetDate);

    // Filtra os dados do dia específico
    // Usa UTC para comparar com os timestamps da API (que são em UTC)
    const dayData = forecast.list.filter((item) => {
      const itemDate = new Date(item.dt * 1000);
      const itemDateStr = this.formatDateLocal(itemDate);
      return itemDateStr === targetDateStr;
    });

    if (dayData.length === 0) {
      return null;
    }

    // Prioriza o período do meio-dia (12:00-15:00) como mais representativo
    const middayData = dayData.find((item) => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 12 && hour <= 15;
    });

    if (middayData) {
      return middayData;
    }

    // Se não encontrar meio-dia, busca período da tarde (15:00-18:00)
    const afternoonData = dayData.find((item) => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 15 && hour <= 18;
    });

    if (afternoonData) {
      return afternoonData;
    }

    // Se não encontrar, pega o período mais próximo do meio-dia
    const sortedByHour = [...dayData].sort((a, b) => {
      const hourA = new Date(a.dt * 1000).getHours();
      const hourB = new Date(b.dt * 1000).getHours();
      // Prioriza horários próximos ao meio-dia (12:00)
      return Math.abs(hourA - 12) - Math.abs(hourB - 12);
    });

    return sortedByHour[0];
  }

  /**
   * Formata a resposta do endpoint /weather (clima atual)
   */
  private formatCurrentWeatherResponse(data: WeatherCurrentResponse): WeatherByDayResponse {
    const date = new Date(data.dt * 1000);
    const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });

    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
      city: data.name,
      country: data.sys.country,
      temperature: {
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max),
        current: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
      },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind: {
        speed: data.wind.speed,
        direction: data.wind.deg,
      },
      clouds: data.clouds.all,
      visibility: data.visibility ? data.visibility / 1000 : undefined,
      precipitationProbability: 0, // O endpoint /weather não retorna probabilidade de precipitação
    };
  }

  /**
   * Formata a resposta do endpoint /forecast (previsão)
   */
  private formatForecastWeatherResponse(
    data: WeatherForecastResponse['list'][0],
    city: string,
    country: string
  ): WeatherByDayResponse {
    const date = new Date(data.dt * 1000);
    const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });

    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
      city,
      country,
      temperature: {
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max),
        current: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
      },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind: {
        speed: data.wind.speed,
        direction: data.wind.deg,
      },
      clouds: data.clouds.all,
      visibility: data.visibility ? data.visibility / 1000 : undefined,
      precipitationProbability: Math.round(data.pop * 100),
    };
  }
}

