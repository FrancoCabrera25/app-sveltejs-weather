<script>
  import AutoComplete from "./components/AutoComplete.svelte";
  import CurrentWeatherDay from "./components/CurrentWeatherDay.svelte";
  import currentWeather, {
    setCurrentWeather,
  } from "./store/currentWeatherStore";

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
    setCurrentWeather(position.coords.latitude, position.coords.longitude);
  }

  async function errorGeolocation() {}
</script>

<main>
  <div class="container">
    <AutoComplete />
    {#if $currentWeather !== null}
      <CurrentWeatherDay />
    {/if}
  </div>
</main>

<style>
</style>
