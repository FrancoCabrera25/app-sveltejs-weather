<script>
  import currentWeatherSearchAutocomplete from "../service/currentWeatherSearchAutocomplete";
  import citys, { setCitys } from "../store/citysStore";
  import currentWeatherDataByGeographicCoordinates from "../service/currentWeatherDataByGeographicCoordinates";
  import { currentWeather } from "../store/currentWeatherStore";

  let ciudad = "";
  let selectedItem;

  const search = async () => {
    const result = await currentWeatherSearchAutocomplete(ciudad);
    //  citys.setCitys();
    if (result !== undefined && result.length !== 0) {
      setCitys(result);
      // console.log("result", $citys);
    }
  };
  const handleInput = async (event) => {
		selectedItem = $citys.find((item) => event.target.value === item.name);
      console.log(selectedItem);
      if(selectedItem !== undefined)  {
       const weatherData   = await currentWeatherDataByGeographicCoordinates(selectedItem.lat,selectedItem.lon);
       currentWeather.setCurrentWeather(weatherData);
       console.log('selected', weatherData);
      } 
	}
</script>

<main class="mt-2">
  <input
    class="form-control"
    list="datalistOptions"
    id="exampleDataList"
    placeholder="Ingrese una ciudad"
    bind:value={ciudad}
    on:keypress={search}
    on:input="{handleInput}"
  />
  <datalist id="datalistOptions">
    {#each $citys as item}
      <option value={item.name}>{item.name}</option>
    {/each}
  </datalist>
</main>
