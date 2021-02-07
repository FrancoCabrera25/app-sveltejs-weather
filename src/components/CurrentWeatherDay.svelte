<script>
  import Card from "../components/Card.svelte";
  import  currentWeather  from "../store/currentWeatherStore";

</script>

<main>
  {#if $currentWeather !== null}
    <Card />
  {/if}
</main>
