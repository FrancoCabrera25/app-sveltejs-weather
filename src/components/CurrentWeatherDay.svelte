<script>
  import Card from "../components/Card.svelte";
  import currentWeather from "../store/currentWeatherStore";

  const CONDITION_TEXT_SOLEADO = "Soleado";
  const CONDITION_TEXT_DESPEJADO = "Despejado";
  const CONDITION_TEXT_PARCIALMENTE_NUBLADO = "Parcialmente nublado";
  const CONDITION_TEXT_NUBLADO = "Nublado";
  const CONDITION_TEXT_CIELO_CUBIERTO = "Cielo cubierto";
  const CONDITION_TEXT_CIELO_TORMENTOSO_EN_LAS_APROXIMACIONES =
    "Cielos tormentosos en las aproximaciones";
  const CONDITION_TEXT_NEBLINA = "Neblina";
  const CONDITION_TEXT_LLUVIA_MODERADA = "Lluvia  moderada a intervalos";
  const CONDITION_TEXT_NIEVE_MODERADA =
    "Nieve moderada a intervalos en las aproximaciones";
  const CONDITION_TEXT_AGUA_NIEVE =
    "Aguanieve moderada a intervalos en las aproximaciones";

  const CONDITION_TEXT_CIELOS_TORMENTOSOS_APROXIMACIONES =
    "Cielos tormentosos en las aproximaciones";

  const CONDITION_TEXT_CHUBASCO_NIEVE = "Chubascos de nieve";

  const CONDITION_TEXT_LLOVISNA_INTERVALOS = "Llovizna a intervalos";
  const CONDITION_TEXT_LLOVISNA = "Llovizna";
  const CONDITION_TEXT_LLOVISNA_HELADA = "Llovizna helada";
  const CONDITION_TEXT_LIGERAS_LLUVIAS = "Ligeras lluvias";
  const CONDITION_TEXT_NIEVE_TORMENTA =
    "Nieve moderada o fuertes nevadas con tormenta en la región";
  const CONDITION_TEXT_NIEVE_LIGERA = "Ligeras precipitaciones de aguanieve";
  let conditionTextIcon = "";

  $: if ($currentWeather.current.is_day === 1) {
    switch ($currentWeather.current.condition.text) {
      case CONDITION_TEXT_SOLEADO:
        conditionTextIcon = "day";
        break;
      case CONDITION_TEXT_PARCIALMENTE_NUBLADO:
        conditionTextIcon = "cloudy-day-1";
        break;
      case CONDITION_TEXT_NUBLADO:
        conditionTextIcon = "snowy-4";
        break;
      case CONDITION_TEXT_CIELO_CUBIERTO:
        conditionTextIcon = "cloudy";
        break;
      case CONDITION_TEXT_CIELO_TORMENTOSO_EN_LAS_APROXIMACIONES:
        conditionTextIcon = "cloudy";
        break;
      case CONDITION_TEXT_NEBLINA:
        conditionTextIcon = "cloudy";
        break;
      case CONDITION_TEXT_LLUVIA_MODERADA:
        conditionTextIcon = "rainy-4";
        break;
      case CONDITION_TEXT_NIEVE_MODERADA:
        conditionTextIcon = "snowy-6";
        break;
      case CONDITION_TEXT_AGUA_NIEVE:
        conditionTextIcon = "snowy-6";
        break;
      case CONDITION_TEXT_CIELOS_TORMENTOSOS_APROXIMACIONES:
        conditionTextIcon = "thunder";
        break;
      case CONDITION_TEXT_CHUBASCO_NIEVE:
        conditionTextIcon = "snowy-6";
        break;
      case CONDITION_TEXT_LLOVISNA_INTERVALOS:
        conditionTextIcon = "rainy-4";
        break;
      case CONDITION_TEXT_LLOVISNA:
        conditionTextIcon = "rainy-4";
        break;
      case CONDITION_TEXT_LLOVISNA_HELADA:
        conditionTextIcon = "rainy-4";
        break;
      case CONDITION_TEXT_LIGERAS_LLUVIAS:
        conditionTextIcon = "rainy-6";
      case CONDITION_TEXT_NIEVE_TORMENTA:
        conditionTextIcon = "thunder";
      case CONDITION_TEXT_NIEVE_LIGERA:
        conditionTextIcon = "snowy-6";
        break;
      default:
        conditionTextIcon = "cloudy";
        break;
    }
  } else {
    switch ($currentWeather.current.condition.text) {
      case CONDITION_TEXT_DESPEJADO:
        conditionTextIcon = "night";
        break;
      case CONDITION_TEXT_PARCIALMENTE_NUBLADO:
        conditionTextIcon = "cloudy-night-1";
        break;
      case CONDITION_TEXT_NUBLADO:
        conditionTextIcon = "snowy-4";
        break;
      case CONDITION_TEXT_CIELO_CUBIERTO:
        conditionTextIcon = "cloudy";
        break;
      case CONDITION_TEXT_CIELO_TORMENTOSO_EN_LAS_APROXIMACIONES:
        conditionTextIcon = "cloudy";
        break;
      case CONDITION_TEXT_NEBLINA:
        conditionTextIcon = "cloudy";
        break;
      case CONDITION_TEXT_LLUVIA_MODERADA:
        conditionTextIcon = "rainy-4";
        break;
      case CONDITION_TEXT_NIEVE_MODERADA:
        conditionTextIcon = "snowy-6";
      case CONDITION_TEXT_AGUA_NIEVE:
        conditionTextIcon = "snowy-6";
        break;
      case CONDITION_TEXT_CIELOS_TORMENTOSOS_APROXIMACIONES:
        conditionTextIcon = "thunder";
        break;
      case CONDITION_TEXT_CHUBASCO_NIEVE:
        conditionTextIcon = "snowy-6";
        break;
      case CONDITION_TEXT_LLOVISNA_INTERVALOS:
        conditionTextIcon = "rainy-4";
        break;
      case CONDITION_TEXT_LLOVISNA:
        conditionTextIcon = "rainy-4";
        break;
      case CONDITION_TEXT_LLOVISNA_HELADA:
        conditionTextIcon = "rainy-4";
        break;
      case CONDITION_TEXT_LIGERAS_LLUVIAS:
        conditionTextIcon = "rainy-6";
      case CONDITION_TEXT_NIEVE_TORMENTA:
        conditionTextIcon = "thunder";
      case CONDITION_TEXT_NIEVE_LIGERA:
        conditionTextIcon = "snowy-6";
        break;
      default:
        conditionTextIcon = "cloudy";
        break;
    }
  }
</script>

<main>
  {#if $currentWeather !== null}
    <Card
      temp={$currentWeather.current.temp_c}
      conditionText={$currentWeather.current.condition.text}
      locationName={$currentWeather.location.name}
      humidity={$currentWeather.current.humidity}
      wind={$currentWeather.current.wind_kph}
      uv={$currentWeather.current.uv}
      {conditionTextIcon}
    />
  {/if}
</main>
