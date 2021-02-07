import { writable } from "svelte/store";

const citys = writable([]);

export const setCitys = (arg)  =>{
        citys.set(arg);
 return citys;
}

export default citys;
