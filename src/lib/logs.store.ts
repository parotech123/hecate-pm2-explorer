import { writable } from "svelte/store";

export const logsStore = writable<string[]>([]);