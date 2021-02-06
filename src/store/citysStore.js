import { writable } from "svelte/store";

const citys = writable([]);

export const setCitys = (arg)  =>{
        citys.set(arg);
 return citys;
}

// export const setCitys = ()  =>{
//     citys.set();
// }
export default citys;


// function citysStore(){
//     const {subscribe, update ,set } = writable([]);

//     return{
//         subscribe,
//         updateCitysStore:(arg) => update(),
//         setCitysStore:()=> set([]),
//     }

// }

// export const citys = citysStore();