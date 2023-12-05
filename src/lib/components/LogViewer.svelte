<script lang="ts">
import Icon from "@iconify/svelte"
import {
    format
} from "date-fns"
import {
    fetchLogs
} from "../api-calls"
import {
    filterText,
    mixLogsStore
} from "../stores/mix-logs.store"
import {
    selectedProcess
} from "../stores/selected-process.store"
import Badge from "./Badge.svelte"
import ButtonLoading from "./ButtonLoading.svelte"
import {
    tr
} from "date-fns/locale"

export let logs: (string | {
    message: string;
    timestamp: Date;
    app_name: string;
    type: string;
    process_id: number
})[] | undefined

export let height
</script>

{#if $selectedProcess}
{#if $mixLogsStore}
<div class="divider  flex-auto hidden md:flex" >
    {#if $selectedProcess}
    <div class="flex flex-row gap-4 items-center">

        <div>
            {$selectedProcess?.name}

        </div>
        <Badge process={$selectedProcess}></Badge>
    </div>
    <div class="flex flex-row gap-4">

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
    </div>
    <input type="text" placeholder="Type here" class="input input-bordered input-primary w-full max-w-xs"  bind:value={$filterText}/>
    {/if}
</div>
<div class="flex flex-auto gap-3 flex-col md:hidden items-center justify-center" >
    <div class="flex flex-row gap-4 items-center">

        <div>
            {$selectedProcess?.name}

        </div>
        <Badge process={$selectedProcess}></Badge>
    </div>
    <div class="flex flex-row gap-4">

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
    </div>
    <input type="text" placeholder="Type here" class="input input-bordered input-primary w-full max-w-xs" bind:value={$filterText}/>
</div>
<div class="overflow-x-auto">
    {#if logs}
    <table  class="table table-zebra mt-2 table-xs w-full" style="max-height: calc(100vh - {$height}px)">
        {#each logs as line}
        {#if typeof line === 'object' && typeof line.message !== 'undefined'}
        <tr class="!max-h-[30px]">
            <td class="w-[10px] max-h-[30px]">
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
        <!-- <tr class="md:hidden">
          <td class="{line.type=='out' ? 'text-info' : 'text-error'} md:hidden">
                {line.message}

            </td>  
        </tr> -->
        {:else}
        <li class="">{line}</li>
        {/if}
        {/each}
    </table>
    {/if}
</div>
{/if}

{/if}
