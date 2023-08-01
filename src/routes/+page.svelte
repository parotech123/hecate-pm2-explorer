<script lang="ts">
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
	import { fromByteToHuman, fromMillisecondsToDDHHmmss, pausable,  } from '$lib/utils'
import Icon from '@iconify/svelte';
	import { BehaviorSubject, Subject, interval, timer } from 'rxjs'
import {
    onMount
} from 'svelte'


const pauser$ = new Subject<boolean>();

// Timer that emits every 1 second (adjust interval as needed)
const timer$ = interval(1000);

// Apply the pausable operator to the timer
const pausableTimer$ = timer$.pipe(pausable(pauser$));
const status$ = new BehaviorSubject<boolean>(false);

// Subscribe to the pausable timer and update the status
const subscription = pausableTimer$.subscribe(
  (value) => {
    console.log(value); // This will log the timer value each second
  },
 
);
onMount(async () => {
    // loadProcessesFromStorage()
    
    const subscription = pausableTimer$.subscribe((value) => {
        updateProcesses()
  
},


);

});

let subnet = '192.168.1.0/24'; // Default value
</script>

<style>
.log-line {
    color: green;
}
</style>

<div class="navbar bg-base-100">
    <div class="flex-none">
        <button class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
    </div>
    <div class="flex-1">
        <span class="text-lg font-bold">Hecate</span>
    </div>
    <div>
        <button>
            <Icon icon="mdi:refresh" class="text-base"></Icon>
        </button>
    </div>
    <div>
        <button>
           {#if pauser$.isStopped}
              <Icon icon="mdi:pause" class="text-base"></Icon>
              {:else}
                <Icon icon="mdi:play" class="text-base"></Icon>
            {/if}
        </button>
    </div>
    <div class="flex-none">
        <button class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
        </button>
    </div>
</div>

<!-- <input bind:value={subnet} placeholder="Enter a subnet mask" />
<button on:click={async()=>{fetchProcesses}}>Fetch Processes</button> -->

{#if $processesStore && $processesStore.length > 0}
<table class="table table-zebra m-5">
    <thead>
        <tr>
            <th>Process Name</th>
            <th>PID</th>
            <th>Status</th>
            <th>Uptime</th>
            <th>Memory</th>
            <th>CPU</th>
            <th>Istances</th>
            <th>IP</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {#each $processesStore as process}
        <tr>
            <td>{process.name}</td>
            <td>{process.pid}</td>
            <td>
                {#if process.status === 'online'}
                <span class="badge badge-success badge-outline">{process.status}</span>
                {:else }
                <span class="badge badge-error badge-outline">{process.status}</span>
                {/if}

            </td>
            <td>{fromMillisecondsToDDHHmmss(process.uptime)}</td>
            <td>{fromByteToHuman(Number(process.memory))}</td>
            <td>{process.cpu}%</td>
            <td>{process.istances}</td>
            <td>{process.ip}</td>
            <td>

                <button class="btn join-item  btn-square btn-outline btn-error btn-sm" on:click={() => deleteProcess(process)}>
                    <Icon icon="solar:trash-bin-trash-broken" class="text-base"></Icon>
                </button>
                <button class="btn join-item  btn-square btn-outline btn-info btn-sm" on:click={() => fetchLogs(process)}>
                    <Icon icon="octicon:log-16" class="text-base"></Icon>
                </button>
                <button class="btn join-item  btn-square btn-outline btn-warning btn-sm" on:click={() => flushLogs(process)}>
                    <Icon icon="fluent-emoji-high-contrast:toilet" class="text-base"></Icon>
                </button>
            </td>
        </tr>
        {/each}
    </tbody>
</table>
{:else}
<p>No processes found</p>
{/if}

{#if $logsStore}
<ul>
    {#each $logsStore as line}
    <li class="">{line}</li>
    {/each}
</ul>
{/if}

{#if $errorsStore}
<ul>
    {#each $errorsStore as line}
    <li class="log-line">{line}</li>
    {/each}
</ul>
{/if}
