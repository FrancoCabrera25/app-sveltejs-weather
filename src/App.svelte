<script>
  import Card from "./components/Card.svelte";
  import AutoComplete from "./components/AutoComplete.svelte";
  import currentWeatherDataByGeographicCoordinates from "./service/currentWeatherDataByGeographicCoordinates";
  import { currentWeather } from "./store/currentWeatherStore";


  const currentPositionOptions = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 3000,
  };
  let weatherCurrent = {
    id: 0,
    temp: "-",
    humidity: "",
    windSpeed: "",
  };

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      successGeolocation,
      errorGeolocation,
      currentPositionOptions
    );
  } else {
  }

  async function successGeolocation(position) {

    let weatherData = await currentWeatherDataByGeographicCoordinates(
      position.coords.latitude,
      position.coords.longitude,
    );
    if (weatherData != null) {
      console.log(weatherData);
      currentWeather.setCurrentWeather(weatherData);
    }

  }

  async function errorGeolocation() {}
</script>

<main>
  <div class="container">
    <AutoComplete />
    {#if $currentWeather !== null}
      <Card />
    {/if}
  </div>
</main>

<style>
</style>
