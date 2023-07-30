import { CrudStore } from "./crud.store";
import type { ProcessData } from "./PM2Wrapper";

export const processesStore = CrudStore<ProcessData>();