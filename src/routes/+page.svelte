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
	filterText,
    mixLogsStore
} from 'src/lib/stores/mix-logs.store'
import {
    format
} from 'date-fns'
import {
    derived,
    writable
} from 'svelte/store'
import type {
    ProcessData
} from '$lib/PM2Wrapper'
import Badge from '$lib/components/Badge.svelte'

import he from 'date-fns/locale/he'

import {
    calculateDivHeight
} from "$lib/utils"
import {
    browser
} from '$app/environment'
import {
    selectedProcess
} from 'src/lib/stores/selected-process.store'
import ButtonLoadingList from 'src/lib/components/ButtonLoadingList.svelte'
import {
    processesStore
} from 'src/lib/stores/process.store'
import LogViewer from 'src/lib/components/LogViewer.svelte'
	import CardProcess from 'src/lib/components/CardProcess.svelte'

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

$: {
    if (browser) {

        height.set(calculateDivHeight("tableproc") ?? 0)
    }
}

export const filtered_mixLogsStore = derived(
    [mixLogsStore, filterText],
    ([$mixLogsStore, $filterText]) => {
        if (!$mixLogsStore) return

        if ($filterText == '') return $mixLogsStore

        let toReturn =$mixLogsStore.filter((line) => {
            if (typeof line === 'object' && line.message) {
                return line.message.toLowerCase().includes($filterText.toLowerCase())
            } else if(typeof line === 'string') {
                
                return line.toLowerCase().includes($filterText.toLowerCase())
            }
        })

        console.log(toReturn)
        return toReturn


    }
)

// });

const buttonList = [{
    color: "info",
    icon: "solar:trash-bin-trash-broken"
}]

let subnet = '192.168.1.0/24'; // Default value
</script>

<div class="navbar bg-base-100 gap-4">
    <div class="flex flex-row gap-3 items-center m-auto">

        <div class="m-auto md:text-right">
            <span class="text-2xl font-bold">Hecate {$height}</span>
        </div>
        <ButtonLoading color='primary' icon='mdi:refresh' on:click={async()=>{
            await updateProcesses()
            height.set(calculateDivHeight("tableproc") ?? 0)
        }}>

</ButtonLoading>
</div>
    <!-- <ButtonLoading color='info' icon='mdi:refresh' on:click={async()=>{
        await updateProcesses()
         height.set(calculateDivHeight("tableproc") ?? 0)
        }}>

    </ButtonLoading> -->

    <!-- <div class="flex-none">
        <button class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
        </button>
    </div> -->
</div>

<!-- <input bind:value={subnet} placeholder="Enter a subnet mask" />
<button on:click={async()=>{fetchProcesses}}>Fetch Processes</button> -->

{#if $processesStore && $processesStore.length > 0}

<div class="flex flex-wrap md:hidden justify-center">

    {#each $processesStore as process}
    <CardProcess {process}></CardProcess>
    {/each}
</div>

<table class="table table-zebra m-5 hidden md:block" style=""  id="tableproc" >
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
                <ButtonLoadingList {process}></ButtonLoadingList>

            </td>
        </tr>
        {/each}
    </tbody>
</table>
{:else}
<p>No processes found</p>
{/if}
<div class="h-[100px]"></div>
<LogViewer logs={$filtered_mixLogsStore} height={height}></LogViewer>

<!-- {#if $errorsStore}
<ul>
    {#each $errorsStore as line}
    <li class="log-line">{line}</li>
    {/each}
</ul>
{/if} -->


