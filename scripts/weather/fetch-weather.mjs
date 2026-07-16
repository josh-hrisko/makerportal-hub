/**
 * Open-Meteo current weather — free, no API key, no auth.
 * https://open-meteo.com/en/docs
 */
import { CITIES } from './cities.mjs';

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather() {
  const results = [];
  for (const city of CITIES) {
    const url = `${ENDPOINT}?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=UTC`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[weather] ${city.name} failed: ${res.status}`);
        continue;
      }
      const data = await res.json();
      const c = data.current;
      if (!c) continue;
      results.push({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        tempC: c.temperature_2m,
        weatherCode: c.weather_code,
        windKph: c.wind_speed_10m,
        humidity: c.relative_humidity_2m,
        observedAt: c.time,
      });
    } catch (err) {
      console.warn(`[weather] ${city.name} errored:`, err.message);
    }
  }
  return results;
}
