<script lang="ts">
import ButtonLoading from './../lib/components/ButtonLoading.svelte';
import {
    deleteProcess,
    fetchLogs,
    fetchProcesses,
    flushLogs,
    loadProcessesFromStorage,
    updateProcesses
} from '$lib/api-calls'
import {
    errorsStore
} from '$lib/errors.store'
import {
    logsStore
} from '$lib/logs.store'
import {
    processesStore
} from '$lib/process.store'
import {
    fromByteToHuman,
    fromMillisecondsToDDHHmmss,
    pausable,
} from '$lib/utils'
import Icon from '@iconify/svelte';
import {
    BehaviorSubject,
    Subject,
    interval,
    timer
} from 'rxjs'
import {
    onMount
} from 'svelte'

import {
    mixLogsStore
} from '$lib/mix-logs.store'
import {
    format
} from 'date-fns'
import {
    writable
} from 'svelte/store'
import type {
    ProcessData
} from '$lib/PM2Wrapper'
import Badge from '$lib/components/Badge.svelte'
import {
    loadingStore
} from '$lib/loading.store'
	import he from 'date-fns/locale/he'

import {calculateDivHeight} from "$lib/utils"
	import { browser } from '$app/environment'


const pauser$ = new Subject < boolean > ();

const height = writable < number > (0);

// Timer that emits every 1 second (adjust interval as needed)
const timer$ = interval(1000);

// Apply the pausable operator to the timer
const pausableTimer$ = timer$.pipe(pausable(pauser$));
const status$ = new BehaviorSubject < boolean > (false);

// Subscribe to the pausable timer and update the status
// const subscription = pausableTimer$.subscribe(
//   (value) => {
//     // console.log(value); // This will log the timer value each second
//   },

// );
onMount(async () => {
        // loadProcessesFromStorage()
        await updateProcesses()

 height.set(calculateDivHeight("tableproc") ?? 0)
        //     const subscription = pausableTimer$.subscribe((value) => {

    },

);

$:{
    if(browser){

        height.set(calculateDivHeight("tableproc") ?? 0)
    }
}


// });

const buttonList = [{
    color: "info",
    icon: "solar:trash-bin-trash-broken"
}]

let subnet = '192.168.1.0/24'; // Default value

const selectedProcess = writable < ProcessData | null > (null);
</script>

<div class="navbar bg-base-100 gap-4">
    <div class="">
        <span class="text-2xl font-bold">Hecate {$height}</span>
    </div>
    <ButtonLoading color='primary' icon='mdi:refresh' on:click={async()=>{
        await updateProcesses()
         height.set(calculateDivHeight("tableproc") ?? 0)
        }}>

    </ButtonLoading>
    <ButtonLoading color='info' icon='mdi:refresh' on:click={async()=>{
        await updateProcesses()
         height.set(calculateDivHeight("tableproc") ?? 0)
        }}>

    </ButtonLoading>

    <!-- <div class="flex-none">
        <button class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
        </button>
    </div> -->
</div>

<!-- <input bind:value={subnet} placeholder="Enter a subnet mask" />
<button on:click={async()=>{fetchProcesses}}>Fetch Processes</button> -->

{#if $processesStore && $processesStore.length > 0}
<table class="table table-zebra m-5" style=""  id="tableproc">
    <thead>
        <tr>
            <th class="text-accent">ID</th>
            <th class="text-accent">Process Name</th>
            <th  class="text-accent">PID</th>
            <th class="text-accent">Status</th>
            <th class="text-accent">Uptime</th>
            <th class="text-accent">Memory</th>
            <th class="text-accent">CPU</th>
            <th class="text-accent">Istances</th>
            <th class="text-accent">IP</th>
            <th class="text-accent">Actions</th>
        </tr>
    </thead>
    <tbody>
        {#each $processesStore as process}
        <tr>
            <td>{process.pm_id}</td>
            <td class="text-secondary font-semibold">{process.name}</td>
            <td>{process.pid}</td>
            <td>
                <Badge {process}></Badge>

            </td>
            <td>{fromMillisecondsToDDHHmmss(process.uptime)}</td>
            <td>{fromByteToHuman(Number(process.memory))}</td>
            <td>{process.cpu}%</td>
            <td>{process.istances}</td>
            <td>{process.ip}</td>
            <td>
                <ButtonLoading color='error' icon='solar:trash-bin-trash-broken' on:click={async()=>{
                    await deleteProcess(process)
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

            </td>
        </tr>
        {/each}
    </tbody>
</table>
{:else}
<p>No processes found</p>
{/if}
{#if $mixLogsStore}
<div class="divider flex flex-auto" >
    {#if $selectedProcess}
    <div>
        {$selectedProcess?.name}

    </div>
    <Badge process={$selectedProcess}></Badge>
    <ButtonLoading color='info'  on:click={async()=>{
        await fetchLogs($selectedProcess, 10)
        }}>
        10
    </ButtonLoading>
    <ButtonLoading color='info'  on:click={async()=>{
        await fetchLogs($selectedProcess, 100)
        }}>
        100
    </ButtonLoading>
    <ButtonLoading color='info'  on:click={async()=>{
        await fetchLogs($selectedProcess, 500)
        }}>
        500
    </ButtonLoading>
    {/if}
</div>
<div class="overflow-x-auto">
    <table  class="table table-zebra table-xs" style="height: calc(100vh - {$height}px)">
        {#each $mixLogsStore as line}

        {#if typeof line === 'object' && line.message}
        <tr >
            <td class="w-[10px]">
                <Icon icon="radix-icons:dot" class="text-2xl" ></Icon>

            </td>
            <td class="w-[150px]">
                <div>

                    {format(line.timestamp, "dd/MM HH:mm:ss.SSS")}:
                </div>

            </td>
            <td class="{line.type=='out' ? 'text-info' : 'text-error'}">
                {line.message}

            </td>
        </tr>
        {:else}
        <li class="">{line}</li>
        {/if}
        {/each}
    </table>
</div>
{/if}



<!-- {#if $errorsStore}
<ul>
    {#each $errorsStore as line}
    <li class="log-line">{line}</li>
    {/each}
</ul>
{/if} -->
