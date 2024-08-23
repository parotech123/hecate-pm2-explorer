import type { Server } from "../server.class";
import { CrudState } from "./crud.state.svelte";

export class ServerState {

    servers=new CrudState<Server>("ip")
}