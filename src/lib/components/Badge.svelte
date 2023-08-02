<script lang="ts">
import type {
    ProcessData
} from "$lib/PM2Wrapper"

export let process: ProcessData;
</script>

{#if process.status === 'online'}
<span class="badge badge-success badge-outline">{process.status}</span>
{:else }
<span class="badge badge-error badge-outline">{process.status}</span>
{/if}
