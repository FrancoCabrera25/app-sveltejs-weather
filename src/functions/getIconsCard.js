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

const CONDITION_TEXT_FUERTES_LLUVIAS = "Fuertes lluvias";

export const getIconsCard = (is_day, conditionText) => {
  let conditionTextIcon = "";
  if (is_day === 1) {
    switch (conditionText) {
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
      case CONDITION_TEXT_FUERTES_LLUVIAS:
        conditionTextIcon = "rainy-6";
        break;
      default:
        conditionTextIcon = "cloudy";
        break;
    }
  } else {
    switch (conditionText) {
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
      case CONDITION_TEXT_FUERTES_LLUVIAS:
        conditionTextIcon = "rainy-6";
        break;
      default:
        conditionTextIcon = "cloudy";
        break;
    }
  }

  return conditionTextIcon;
};
