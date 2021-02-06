<script>
  import { compute_slots, space } from "svelte/internal";

  import { currentWeather } from "../store/currentWeatherStore";
  import { onMount, afterUpdate } from "svelte";

  let bgColor = null;
  $: console.log("store", $currentWeather);

  $: if ($currentWeather.temp !== "") {
    $currentWeather.temp > 35 ? (bgColor = "flare") : null;
    $currentWeather.temp > 25 && $currentWeather.temp < 36
      ? (bgColor = "background-card-blue")
      : null;
    $currentWeather.temp > 10 && $currentWeather.temp < 26
      ? (bgColor = "background-card-blue")
      : null;
    $currentWeather.temp < 11 ? (bgColor = "cool-sky") : null;
  }
</script>

<main>
  {#if $currentWeather !== ""}
    <div class="card text-white shadow p-3 mb-5  rounded {bgColor} mb-3 col-md-6  col-sm-8  offset-md-3 card-container"
    >
    <h1 class="title"> {$currentWeather.location.name}</h1>
    <div class="container">
      <div class="item">
        <div>
          <h2 class="title-temp">{$currentWeather.temp} °</h2>
          <h4 class="title-day">{$currentWeather.text}</h4> 
        </div>
     
      </div>
      <div class="item">
        <img class="icons" src="./icons/day.svg" />
      </div>
    </div>
      <div class="info">
         <span>Humedad</span>
         <span>Viento</span>
         <span>Indice UV</span>
      </div>
    </div>
  {/if}
</main>

<style>
  .card-title{
    text-align: center;
  }
  .background-card-blue {
    background: rgb(24, 166, 242);
  }
   .container{
     display: flex;
     flex-direction: row;
     justify-content: space-around;
     align-items: center;
   }
   .card-container{
     margin:20px  auto;
   }
   .title{
     text-align: center;
   }
   .icons{
     width: 100%;
   }
   .title-temp{
     text-align: center;
     font-size: 60px;
     font-weight: 400;
   }
   .info{
     display: flex;
     flex-direction: row;
     justify-content: space-around;
   }
   .item{
     width: 50%;
     margin: 10spx;
     padding: 5px;
   }
   .title-day{
     text-align: center;
     font-weight: 400;
   }
</style>
