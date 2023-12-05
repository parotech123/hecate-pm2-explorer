<script lang="ts">
import type {
    ProcessData
} from "../PM2Wrapper"
import {
    deleteProcess,
    describeProcess,
    fetchLogs,
    flushLogs,

    restartProcess,

	stopProcess


} from "../api-calls"
import {
    selectedProcess
} from "../stores/selected-process.store"
import ButtonLoading from "./ButtonLoading.svelte"

export let process: ProcessData
</script>

<div class="flex flex-auto gap-5">
 <!-- <ButtonLoading color='warning' icon='ic:round-pause' on:click={async()=>{
        await describeProcess(process)
        selectedProcess.set(process)
        }}></ButtonLoading> -->
    {#if process.status=="online"}
    <ButtonLoading color='warning' icon='ic:round-pause' on:click={async()=>{
        await stopProcess(process)
        selectedProcess.set(process)
        }}></ButtonLoading>

        {/if}

        <ButtonLoading color={process.status=="online"?'primary' :'success' } icon={process.status=="online"?'solar:restart-bold' :'solar:play-bold' } on:click={async()=>{
            await restartProcess(process)
            selectedProcess.set(process)
            }}>

        </ButtonLoading>
        <ButtonLoading color='info' icon='octicon:log-16' on:click={async()=>{
            await fetchLogs(process)
            selectedProcess.set(process)
            }}>

        </ButtonLoading>
        <ButtonLoading color='neutral-content' icon='fluent-emoji-high-contrast:toilet' on:click={async()=>{
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
