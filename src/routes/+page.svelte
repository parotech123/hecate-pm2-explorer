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
import Icon from '@iconify/svelte';
import {
    onMount
} from 'svelte'

onMount(async () => {
    updateProcesses()
    loadProcessesFromStorage()
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
            <th>Memory</th>
            <th>CPU</th>
            <th>IP</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {#each $processesStore as process}
        <tr>
            <td>{process.name}</td>
            <td>{process.pid}</td>
            <td>{process.memory}</td>
            <td>{process.cpu}</td>
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
