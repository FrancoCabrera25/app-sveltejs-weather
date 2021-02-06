import axios from 'axios';

const API_KEY = "6319d22daefc4569b67122547210502";


// Make a request for a user with a given ID
export default async function currentWeatherDataByGeographicCoordinates(
  lat,
  long
) {
  return await axios
    .get(
      `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${long}&lang=es`
    )
    .then(function (response) { 
      return response.data;
    })
    .catch(function (error) {
     return error
    })  
}

