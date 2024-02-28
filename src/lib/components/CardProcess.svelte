<script lang="ts">
	import {
		fromMillisecondsToDDHHmmss,
		fromByteToHuman,
		ToExludeMonitorKeys
	} from "../utils.js"
	import type { ProcessData } from "./../PM2Wrapper.ts"
	import Badge from "./Badge.svelte"
	import ButtonLoadingList from "./ButtonLoadingList.svelte"

	export let process: ProcessData
</script>

<div class="card w-96 bg-base-100 shadow-xl">
	<div class="card-body !p-2">
		<h2 class="card-title mb-1 flex flex-row items-center justify-center">
			<div>
				{process.name}
			</div>
			<Badge {process}></Badge>
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
		<div class="grid grid-cols-2 gap-2 items-center m-auto">
			{#if process.monitor}
				{#each Object.entries(process?.monitor)
					.filter(([key, value]) => !ToExludeMonitorKeys.includes(key) && value.value !== undefined)
					.map(([key, value]) => {
						return { key, value: value.value }
					}) as metric}
					<div class="text-xs italic text-left">{metric.key}:</div>
					<div class="text-left">{metric.value}</div>
				{/each}
			{/if}
		</div>
		<div class="card-actions justify-end m-auto !mt-1 !mb-1">
			<ButtonLoadingList {process}></ButtonLoadingList>
		</div>
	</div>
</div>
