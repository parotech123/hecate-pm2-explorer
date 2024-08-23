<script lang="ts">
	import Icon from "@iconify/svelte"
	import { performActions, processInfos } from "../api-calls.svelte"
	import { settingsStore } from "../stores/settings.state.svelte"
	import {
		ToExludeMonitorKeys,
		fromByteToHuman,
		fromMillisecondsToDDHHmmss,
	} from "../utils.js"
	import Badge from "./Badge.svelte"
	import ButtonLoadingList from "./ButtonLoadingList.svelte"
	import type { ProcessData } from "../PM2Wrapper"
	let { process }: { process: ProcessData } = $props()
	function hideProcess(process: any) {
		process.show = !process.show
		processInfos.replace({
			name: process.name,
			serial: process.serial!,
			show: process.show,
		})
	}
</script>

<div class="card w-96 bg-neutral shadow-xl">
	<div class="card-body !p-2">
		<h2 class="card-title mb-1 flex flex-row items-center justify-center">
			<div>
				{process.name}
			</div>
			<Badge {process}></Badge>
			<button
				class="btn btn-icon-sm btn-ghost"
				on:click={() => hideProcess(process)}
			>
				<Icon icon="iconamoon:eye-off" class="text-xl text-accent"
				></Icon>
			</button>
		</h2>

		<div class="grid grid-cols-3 gap-2 m-auto mb-2">
			<div class="italic text-xs text-center">Up Time</div>
			<div class="italic text-xs text-center">Memory</div>
			<div class="italic text-xs text-center">CPU</div>

			<div class="text-center">
				{fromMillisecondsToDDHHmmss(process.uptime)}
			</div>
			<div class="text-center">
				{fromByteToHuman(Number(process.memory))}
			</div>
			<div class="text-center">{process.cpu}%</div>
		</div>

		{#if $settingsStore.showMetrics}
			<div class="grid grid-cols-2 gap-2 items-center m-auto">
				{#if process.monitor}
					{#each Object.entries(process?.monitor)
						.filter(([key, value]) => !ToExludeMonitorKeys.includes(key) && value.value !== undefined)
						.map(([key, value]) => {
							return { key, value: value.value }
						}) as metric}
						<div class="text-xs italic text-left">
							{metric.key}:
						</div>
						<div class="text-left">{metric.value}</div>
					{/each}
				{/if}
			</div>
		{/if}
		<div class="card-actions justify-end m-auto !mt-1 !mb-1">
			<ButtonLoadingList {process}></ButtonLoadingList>
		</div>
		<div class="grid grid-cols-3 gap-2 m-auto mb-2">
			{#each process.actions as action}
				<div class="text-center">
					<button
						class="btn btn-ghost"
						on:click={() => performActions(process.pm_id, action)}
					>
						{action}
					</button>
				</div>
			{/each}
		</div>
	</div>
</div>
