import type { Host } from "../host.svelte";
import { CrudState } from "./crud.state.svelte";

export class ServerState {

    servers=new CrudState<Host>("ip")
}