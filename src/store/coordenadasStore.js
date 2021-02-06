import { writable } from "svelte/store";

const coordenadas = writable({
    lat:'',
    long:'',
});

export const setCoordenadas = (lat,long)  =>{
    coordenadas.set({
            lat,
            long
        });
 return coordenadas;
}

export default coordenadas;
