<script lang="ts">
	import type { ProcessData } from '../PM2Wrapper'
	import {
		deleteProcess,
		fetchLogs,
		flushLogs,
		restartProcess,
		stopProcess
	} from '../api-calls.svelte'

	import { processes } from '$lib/api-calls.svelte'

	import { dialogOpenState } from '../stores/drawer.state.svelte'
	import ButtonLoading from './ButtonLoading.svelte'
	import LogViewer from './LogViewer.svelte'

	let {
		process,
	}: {
		process: ProcessData
	} = $props()

	let buttonList = $derived.by(() => {
		let list:{
			color: string
			icon: string
			cmd: () => void
		}[] = [
			
		]

		if (process.status == 'online' || process.status == 'stopping') {
			list.push({
				color: 'warning',
				icon: 'ic:round-pause',
				cmd: async () => {
					await stopProcess(process)
					processes.selected = process
				},
			})
		}

		list.push(
			{
				color: process.status == 'online' ? 'primary' : 'success',
				icon:
					process.status == 'online'
						? 'solar:restart-bold'
						: 'solar:play-bold',
				cmd: async () => {
					await restartProcess(process)
					processes.selected = process
				},
			},

			{
				color: 'info',
				icon: 'octicon:log-16',
				cmd: async () => {
					await fetchLogs(process)
					processes.selected = process
					dialogOpenState.dialogOpen = true
					dialogOpenState.componentToRender = LogViewer
				},
			},
			{
				color: 'neutral-content',
				icon: 'fluent-emoji-high-contrast:toilet',
				cmd: async () => {
					await flushLogs(process)
					processes.selected = process
				},
			},
			{
				color: 'error',
				icon: 'solar:trash-bin-trash-broken',
				cmd: async () => {
					await deleteProcess(process)
					processes.selected = process
				},
			},
		)

		return list.filter(Boolean)
	})
</script>

<div class="flex flex-auto gap-5">
	{#each buttonList as button}
		<ButtonLoading {...button}></ButtonLoading>
	{/each}
</div>
