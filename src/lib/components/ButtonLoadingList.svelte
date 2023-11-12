<script lang="ts">
import type {
    ProcessData
} from "../PM2Wrapper"
import {
    deleteProcess,
    fetchLogs,
    flushLogs,

	restartProcess

} from "../api-calls"
import {
    selectedProcess
} from "../stores/selected-process.store"
import ButtonLoading from "./ButtonLoading.svelte"

export let process: ProcessData
</script>

<div class="flex flex-auto gap-5">
    <ButtonLoading color='primary' icon='solar:restart-bold' on:click={async()=>{
        await restartProcess(process)
        selectedProcess.set(process)
    }}>

</ButtonLoading>
    <ButtonLoading color='info' icon='octicon:log-16' on:click={async()=>{
        await fetchLogs(process)
        selectedProcess.set(process)
    }}>

</ButtonLoading>
<ButtonLoading color='warning' icon='fluent-emoji-high-contrast:toilet' on:click={async()=>{
    await flushLogs(process)
    selectedProcess.set(process)
}}>

</ButtonLoading>
<ButtonLoading color='error' icon='solar:trash-bin-trash-broken' on:click={async()=>{
    await deleteProcess(process)
    selectedProcess.set(process)
    }}>

</ButtonLoading>

</div>
