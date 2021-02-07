import { writable } from "svelte/store";
import currentWeatherDataByGeographicCoordinates from "../service/currentWeatherDataByGeographicCoordinates";

const currentWeather = writable(null);

export async function setCurrentWeather(lat, long) {
  let result = await currentWeatherDataByGeographicCoordinates(lat, long);
  if (result) {
    currentWeather.set(result);
  }
  return currentWeather;
}

export default currentWeather;
