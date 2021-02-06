import { writable } from "svelte/store";

function CurrentWeatherStore(){
    const {subscribe, update ,set } = writable(null);

    return{
        subscribe,
        setCurrentWeather:(arg) => set(arg),
    }

}

export const currentWeather = CurrentWeatherStore();