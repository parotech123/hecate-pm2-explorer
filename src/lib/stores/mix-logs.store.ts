import { writable } from "svelte/store";

export const mixLogsStore = writable<string[] | {
	message: string;
	timestamp: Date;
	app_name: string;
	type: string;
	process_id: number
}[]>([]);


export const filterText = writable < string > ('');
