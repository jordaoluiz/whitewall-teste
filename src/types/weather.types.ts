// Tipos para a resposta da API OpenWeatherMap
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface Clouds {
  all: number;
}

export interface Rain {
  "1h"?: number;
  "3h"?: number;
}

export interface Snow {
  "1h"?: number;
  "3h"?: number;
}

export interface WeatherForecastItem {
  dt: number;
  main: MainWeatherData;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility?: number;
  pop: number;
  rain?: Rain;
  snow?: Snow;
  dt_txt: string;
}

// Resposta do endpoint /weather (clima atual)
export interface WeatherCurrentResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base: string;
  main: MainWeatherData & {
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface WeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// Tipos para a resposta da nossa API
export interface WeatherByDayResponse {
  date: string;
  dayOfWeek: string;
  city: string;
  country: string;
  temperature: {
    min: number;
    max: number;
    current: number;
    feelsLike: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  humidity: number;
  pressure: number;
  wind: {
    speed: number;
    direction: number;
  };
  clouds: number;
  visibility?: number;
  precipitationProbability: number;
}

export interface WeatherError {
  error: string;
  message: string;
  code?: number;
}

// Tipo para parâmetros de busca
export interface WeatherQueryParams {
  city: string;
  date?: string; // formato: YYYY-MM-DD ou 'today', 'tomorrow'
  units?: 'metric' | 'imperial' | 'kelvin';
  lang?: string;
}

