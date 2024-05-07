import { BehaviorSubject } from "rxjs";
import type { LocalStorageState } from "./localstorage.state.svelte";
import { storable } from "./localstorage.store";

export const pauseBS$ = new BehaviorSubject<boolean>(true)
class SettingsState {

	showMetrics = true;
	showCPUChart = true
	refreshProcesses: boolean = true
	refreshTimerSeconds: number = 5

	private loaded = false

	constructor() {



	}


}


export const settingsStore = storable({
	showMetrics: true,
	showCPUChart: true,
	refreshProcesses: true,
	refreshTimerSeconds: 5,
	pause: true,
})

