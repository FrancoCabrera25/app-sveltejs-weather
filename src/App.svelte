<script>
  import Card from "./components/Card.svelte";
  import Header from "./components/Header.svelte";
  import currentWeatherDataByGeographicCoordinates from "./service/currentWeatherDataByGeographicCoordinates";
  import { currentWeather } from "./store/currentWeatherStore";

  const currentPositionOptions = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 3000,
  };
  let weatherCurrent = {
        id: 0,
        temp: '-',
        humidity: '',
        windSpeed: ''
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
    console.log("localizacon", position);
    let weatherData = await currentWeatherDataByGeographicCoordinates(
      position.coords.latitude,
      position.coords.longitude
    );
	if(weatherData != null){
    console.log(weatherData);

		weatherCurrent.temp = weatherData.current.temp_c;
    weatherCurrent.humidity = weatherData.current.humidity;
    weatherCurrent.text = weatherData.current.condition.text;
    weatherCurrent.location = {};
    weatherCurrent.location.name = weatherData.location.name
	}
    currentWeather.setCurrentWeather(weatherCurrent);
  }

  async function errorGeolocation() {}
</script>

<main>
  <div class="container">
  
    <Header />
    {#if $currentWeather !== null}
    <Card />
    {/if}
  </div>
</main>

<style>
</style>
