<script>
  import Card from "../components/Card.svelte";
  import currentWeather from "../store/currentWeatherStore";
  import { getIconsCard } from "../functions/getIconsCard";
	import { MONTH } from './../constants/monthName.js';
  import { DAYS } from "../constants/dayName";

  let dayName = "";
  let dayNumber = '';
  let month = '';
  let hours = ''
  let minutes = '';
  let conditionTextIcon = "";
  let locationName = '';

  $: if ($currentWeather !== null) {
    conditionTextIcon = getIconsCard(
      $currentWeather.current.is_day,
      $currentWeather.current.condition.text
    );
   
    dayNumber = new Date($currentWeather.location.localtime).getDate();
    const selectMonth = new Date($currentWeather.location.localtime).getMonth();
    month = MONTH[selectMonth].name;
    const selectDay = new Date($currentWeather.location.localtime).getDay();
    dayName = DAYS[selectDay].name;
    hours = new Date($currentWeather.location.localtime).getHours();
    minutes = new Date($currentWeather.location.localtime).getMinutes();

    locationName = $currentWeather.location.name === "Liniers" ? "Rosario" :  $currentWeather.location.name;
  }
</script>

<main>
  {#if $currentWeather !== null}
    <Card
      temp={$currentWeather.current.temp_c}
      conditionText={$currentWeather.current.condition.text}
      {locationName}
      humidity={$currentWeather.current.humidity}
      wind={$currentWeather.current.wind_kph}
      uv={$currentWeather.current.uv}
      {conditionTextIcon}
      {dayName}
      {month}
      {hours}
      {minutes}
      {dayNumber}
    />
  {/if}
</main>
