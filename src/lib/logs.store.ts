import { writable } from "svelte/store";

export const logsStore = writable<string[] | {
	message: string;
	timestamp: string;
	app_name:string;
	type: string;
	process_id:number
}[]>([]);