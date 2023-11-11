import { writable } from "svelte/store";

export const errorsStore = writable<string[] | {
	message: string;
	timestamp: string;
	app_name: string;
	type: string;
	process_id: number
}[]>([]);