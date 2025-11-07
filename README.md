# API de Clima

API REST em TypeScript com inferência de tipos que consome a API OpenWeatherMap para retornar informações climáticas baseadas em cidade e data.

## 🚀 Funcionalidades

- ✅ Busca de clima por cidade e data
- ✅ Suporte para datas: `today`, `tomorrow` ou formato `YYYY-MM-DD`
- ✅ TypeScript com inferência de tipos completa
- ✅ Tratamento de erros robusto
- ✅ Resposta formatada e padronizada

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Chave da API OpenWeatherMap (gratuita): [https://openweathermap.org/api](https://openweathermap.org/api)

## 🔧 Instalação

1. Clone o repositório (ou navegue até a pasta do projeto)

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` e adicione sua chave da API:
```
OPENWEATHER_API_KEY=sua_chave_aqui
```

## 🏃 Executando

### Modo desenvolvimento (com hot reload):
```bash
npm run dev
```

### Modo produção:
```bash
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📖 Uso da API

### Endpoint Principal

**GET** `/weather`

#### Parâmetros de Query:

- `city` (obrigatório): Nome da cidade
- `date` (opcional): Data no formato `YYYY-MM-DD`, `today` ou `tomorrow` (padrão: `today`)
- `units` (opcional): Unidade de temperatura - `metric`, `imperial` ou `kelvin` (padrão: `metric`)
- `lang` (opcional): Código do idioma - `pt_br`, `en`, `es`, etc. (padrão: `pt_br`)

#### Exemplos de Requisições:

```bash
# Clima de hoje em São Paulo
curl "http://localhost:3000/weather?city=São Paulo"

# Clima de amanhã no Rio de Janeiro
curl "http://localhost:3000/weather?city=Rio de Janeiro&date=tomorrow"

# Clima para uma data específica
curl "http://localhost:3000/weather?city=New York&date=2024-01-15"

# Clima com unidades em Fahrenheit
curl "http://localhost:3000/weather?city=London&units=imperial"
```

#### Resposta de Sucesso:

```json
{
  "date": "2024-01-15",
  "dayOfWeek": "segunda-feira",
  "city": "São Paulo",
  "country": "BR",
  "temperature": {
    "min": 20,
    "max": 28,
    "current": 24,
    "feelsLike": 25
  },
  "weather": {
    "main": "Clear",
    "description": "céu limpo",
    "icon": "01d"
  },
  "humidity": 65,
  "pressure": 1013,
  "wind": {
    "speed": 3.5,
    "direction": 180
  },
  "clouds": 10,
  "visibility": 10,
  "precipitationProbability": 0
}
```

#### Resposta de Erro:

```json
{
  "error": "Erro ao buscar dados de clima",
  "message": "Cidade não encontrada",
  "code": 404
}
```

### Health Check

**GET** `/weather/health`

Retorna o status da API:

```json
{
  "status": "ok",
  "service": "weather-api",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🏗️ Estrutura do Projeto

```
api-clima/
├── src/
│   ├── index.ts              # Arquivo principal do servidor
│   ├── types/
│   │   └── weather.types.ts  # Definições de tipos TypeScript
│   ├── services/
│   │   └── weather.service.ts # Serviço de integração com OpenWeatherMap
│   └── routes/
│       └── weather.routes.ts  # Rotas da API
├── dist/                      # Arquivos compilados (gerado)
├── .env                       # Variáveis de ambiente (criar)
├── .env.example              # Exemplo de variáveis de ambiente
├── tsconfig.json             # Configuração do TypeScript
├── package.json              # Dependências do projeto
└── README.md                 # Este arquivo
```

## 🔍 Inferência de Tipos

A API utiliza TypeScript com tipos bem definidos para garantir inferência completa:

- `WeatherByDayResponse`: Tipo de retorno da API
- `WeatherQueryParams`: Tipo para parâmetros de query
- `WeatherError`: Tipo para respostas de erro
- Todos os tipos da OpenWeatherMap API também estão tipados

## 🛠️ Tecnologias Utilizadas

- **TypeScript**: Linguagem principal
- **Express**: Framework web
- **Axios**: Cliente HTTP
- **dotenv**: Gerenciamento de variáveis de ambiente
- **OpenWeatherMap API**: Fonte de dados climáticos

## 📝 Notas

- A API OpenWeatherMap oferece previsão para 5 dias (40 períodos de 3 horas)
- Para datas além de 5 dias, a API retornará um erro
- A chave gratuita da OpenWeatherMap tem limite de requisições por dia

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues ou pull requests!

## 📄 Licença

ISC

