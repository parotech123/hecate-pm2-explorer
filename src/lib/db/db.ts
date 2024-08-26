import Dexie, { type Table } from 'dexie';
import type { Host } from '../host.svelte';

export interface ProcessInfo {

	name: string;
	serial: number;
	show: boolean;

}

export interface MetricInfo {
	name: string;
	type: "string" | "number" | "boolean" | "date";
}

export class MySubClassedDexie extends Dexie {
	processInfos!: Table<ProcessInfo>;
	metricInfos!: Table<MetricInfo>;
	hosts!: Table<Host>;
	constructor() {
		super('myDatabase');
		this.version(2).stores({
			processInfos: '&name, serial, show', // Primary key and indexed props,
			metricInfos: 'name, type',
			hosts: 'ip',
		});
	}
}

export const db = new MySubClassedDexie();