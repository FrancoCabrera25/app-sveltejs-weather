<script>
  import  currentWeather  from "../store/currentWeatherStore";


  let bgColor = null;

  $: if ($currentWeather.current.temp_c !== "") {
    console.log('current city', $currentWeather);
    $currentWeather.current.temp_c > 35 ? (bgColor = "flare") : null;
    $currentWeather.current.temp_c > 25 && $currentWeather.current.temp_c < 36
      ? (bgColor = "background-card-blue")
      : null;
      $currentWeather.current.temp_c > 10 && $currentWeather.current.temp_c < 26
      ? (bgColor = "background-card-blue")
      : null;
      $currentWeather.current.temp_c < 11 ? (bgColor = "cool-sky") : null;
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
          <h2 class="title-temp">{$currentWeather.current.temp_c} °</h2>
          <h4 class="title-day">{$currentWeather.current.condition.text}</h4> 
        </div>
     
      </div>
      <div class="item">
        <img class="icons" src="./icons/day.svg" />
      </div>
    </div>
      <div class="info">
         <span>Humedad { $currentWeather.current.humidity} %</span>
         <span>Viento  { $currentWeather.current.wind_kph} km/h</span>
         <span>Indice UV {$currentWeather.current.uv}</span>
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
     margin:-5px;
   }
   .title-day{
     text-align: center;
     font-weight: 400;
   }
</style>
