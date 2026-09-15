export type PersonalPreferences={minutes:"15"|"30"|"45"|"60";budget:"0"|"30"|"100";place:"indoors"|"outside"|"either";likes:string;avoid:string};
export const defaultPreferences:PersonalPreferences={minutes:"30",budget:"30",place:"either",likes:"",avoid:""};
const key="afterwork-personal-preferences";
export function loadPreferences():PersonalPreferences{if(typeof window==="undefined")return defaultPreferences;try{const value=JSON.parse(localStorage.getItem(key)||"{}");return{minutes:["15","30","45","60"].includes(value.minutes)?value.minutes:"30",budget:["0","30","100"].includes(value.budget)?value.budget:"30",place:["indoors","outside","either"].includes(value.place)?value.place:"either",likes:typeof value.likes==="string"?value.likes.slice(0,300):"",avoid:typeof value.avoid==="string"?value.avoid.slice(0,300):""}}catch{return defaultPreferences}}
export function savePreferences(value:PersonalPreferences){localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event("afterwork-preferences-change"))}
export function clearPreferences(){localStorage.removeItem(key);window.dispatchEvent(new Event("afterwork-preferences-change"))}
