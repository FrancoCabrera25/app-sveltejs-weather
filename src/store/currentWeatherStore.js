import { writable } from "svelte/store";

function CurrentWeatherStore(){
    const {subscribe, update ,set } = writable({
        location:{
            country: '',
            name: '',
            region:'',
        },
        temp: '',
        text:'',
        humidity: '',
        windSpeed: ''
    });

    return{
        subscribe,
        setCurrentWeather:(arg) => set(arg),
    }

}

export const currentWeather = CurrentWeatherStore();