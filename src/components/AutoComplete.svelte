<script>
  import currentWeatherSearchAutocomplete from "../service/currentWeatherSearchAutocomplete";
  import citys, { setCitys } from "../store/citysStore";
  import currentWeather, {
    setCurrentWeather,
  } from "../store/currentWeatherStore";

  let ciudad = "";
  let selectedItem;

  const search = async () => {
    if (ciudad.length >= 3) {
      const result = await currentWeatherSearchAutocomplete(ciudad);
      if (result !== undefined && result.length !== 0) {
        setCitys(result);
      }
    }
  };
  
  const handleInput = async (event) => {
    selectedItem = $citys.find((item) => event.target.value === item.name);
    if (selectedItem !== undefined) {
      setCurrentWeather(selectedItem.lat, selectedItem.lon);
    }
  };
</script>

<main class="mt-2">
  <input
    class="form-control"
    list="datalistOptions"
    id="exampleDataList"
    placeholder="Ingrese una ciudad"
    bind:value={ciudad}
    on:keypress={search}
    on:input={handleInput}
  />
  <datalist id="datalistOptions">
    {#each $citys as item}
      <option value={item.name}>{item.name}</option>
    {/each}
  </datalist>
</main>
