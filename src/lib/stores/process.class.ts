import type { ProcessData } from "../PM2Wrapper";
import { CrudState } from "./crud.state.svelte";

export class ProcessState {

	processes = new CrudState<ProcessData>('name');
	loading = $state<boolean>(false);
	selectedProcess = $state<ProcessData | null>(null);

}


