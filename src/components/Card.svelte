<script>
  import { MONTH } from "./../constants/monthName.js";
  import currentWeather from "../store/currentWeatherStore";
  import { DAYS } from "../constants/dayName";

  export let temp;
  export let conditionText;
  export let locationName;
  export let humidity;
  export let wind;
  export let uv;
  export let conditionTextIcon;
  export let dayName;
  export let dayNumber;
  export let month;
  export let hours;
  export let minutes;
</script>

<main>
  {#if $currentWeather !== ""}
    <div
      class="card text-white shadow p-3 mb-5  rounded  mb-3 col-md-6  col-sm-8  offset-md-3 card-container background-card"
    >
      <h1 class="title">{locationName}</h1>
      <h4 class="title">{dayName} {dayNumber} de {month} {hours}:{minutes}</h4>
      <div class="container">
        <div class="item">
          <div>
            <h2 class="title-temp">{temp} °</h2>
            <h4 class="title-day">{conditionText}</h4>
          </div>
        </div>
        <div class="item">
          <!-- svelte-ignore a11y-missing-attribute -->
          <img
            class="icons"
            src="./icons/{conditionTextIcon}.svg"
            atl={conditionTextIcon}
          />
        </div>
      </div>
      <div class="info">
        <span>Humedad {humidity} %</span>
        <span>Viento {wind} km/h</span>
        <span>Indice UV {uv}</span>
      </div>
    </div>
  {/if}
</main>

<style>
  .card-title {
    text-align: center;
  }
  .background-card {
    background-image: url("../icons/imageback.png");
    border-radius: 10px;
    overflow: hidden;
    /* background: rgb(24, 166, 242); */
  }
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }
  .card-container {
    margin: 20px auto;
  }
  .title {
    text-align: center;
  }
  .icons {
    width: 100%;
  }
  .title-temp {
    text-align: center;
    font-size: 60px;
    font-weight: 400;
  }
  .info {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
  .item {
    width: 50%;
    margin: 10spx;
    padding: 5px;
    margin: -5px;
  }
  .title-day {
    text-align: center;
    font-weight: 400;
  }
</style>
