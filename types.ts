
export interface Pollutants {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number;
}

export interface ProviderData {
  providerName: string;
  aqiValue: number;
  status: string;
  pollutants: Pollutants;
  confidence: string;
  description: string;
}

export interface AQIData {
  locationName: string;
  providers: ProviderData[];
  recommendations: string[];
  sources: Array<{ title: string; uri: string }>;
  timestamp: string;
  avgAqi: number;
}

export interface LocationSearchResult {
  title: string;
  address: string;
  lat: number;
  lng: number;
  aqi?: number;
  status?: string;
}

export const getAQIColor = (value: number) => {
  if (value <= 50) return 'text-green-500 bg-green-50 border-green-200';
  if (value <= 100) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (value <= 150) return 'text-orange-500 bg-orange-50 border-orange-200';
  if (value <= 200) return 'text-red-500 bg-red-50 border-red-200';
  if (value <= 300) return 'text-purple-500 bg-purple-50 border-purple-200';
  return 'text-rose-900 bg-rose-50 border-rose-200';
};

export const getAQIBG = (value: number) => {
  if (value <= 50) return 'bg-green-500';
  if (value <= 100) return 'bg-yellow-500';
  if (value <= 150) return 'bg-orange-500';
  if (value <= 200) return 'bg-red-500';
  if (value <= 300) return 'bg-purple-500';
  return 'bg-rose-900';
};
