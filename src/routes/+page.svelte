<script lang="ts">
	import {
		processes,
		updateProcesses
	} from 'src/lib/api-calls.svelte'

	import {
		ToExludeMonitorKeys,
		fromByteToHuman,
		fromMillisecondsToDDHHmmss,
	} from '$lib/utils'
	import { filter, timer } from 'rxjs'

	import Badge from '$lib/components/Badge.svelte'

	
	import AppHeader from 'src/lib/components/AppHeader.svelte'
	import ButtonLoadingList from 'src/lib/components/ButtonLoadingList.svelte'
	import CardProcess from 'src/lib/components/CardProcess.svelte'
	import LogViewer from 'src/lib/components/LogViewer.svelte'
	import { chartDataStore } from 'src/lib/stores/chart-data.svelte'
	import { pauseBS$, settingsStore } from 'src/lib/stores/settings.state.svelte'
	import { LinkedChart } from 'svelte-tiny-linked-charts'
	


	$effect(() => {

		// createSettingsState()
		updateProcesses()
		// localStorage.setItem('hecate_settings', JSON.stringify(settings))

	
	})

	let subnet = '192.168.1.0/24' // Default value
</script>

<AppHeader></AppHeader>

<!-- <input bind:value={subnet} placeholder="Enter a subnet mask" />
<button on:click={async()=>{fetchProcesses}}>Fetch Processes</button> -->

{#if processes.data && processes.data.length > 0}
	<div class="flex flex-wrap md:hidden justify-center gap-5 mt-5">
		{#each processes.data as process}
			<CardProcess {process}></CardProcess>
		{/each}
	</div>
	<div class="text-center m-auto">
		<div class="hidden md:flex">
			<table class="table table-zebra" style="" id="tableproc">
				<thead>
					<tr>
						<th class="text-accent">ID</th>
						<th class="text-accent">Process Name</th>
						<th class="text-accent">PID</th>
						<th class="text-accent">Status</th>
						<th class="text-accent">Uptime</th>
						<th class="text-accent">Memory</th>
						<th class="text-accent">CPU</th>
						{#if $settingsStore.showCPUChart}
							<th class="text-accent"></th>
						{/if}
						<th class="text-accent">Istances</th>
						<th class="text-accent">IP</th>
						<th class="text-accent">Actions</th>
						{#if $settingsStore.showCPUChart}
							<th class="text-accent">Metrics</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each processes.data as process}
						<tr>
							<td>{process.pm_id}</td>
							<td class="text-secondary font-semibold"
								>{process.name}</td
							>
							<td>{process.pid}</td>
							<td>
								<Badge {process}></Badge>
							</td>
							<td>{fromMillisecondsToDDHHmmss(process.uptime)}</td
							>
							<td>{fromByteToHuman(Number(process.memory))}</td>
							<td>{process.cpu}%</td>
							<td>{process.istances}</td>
							<td
								>{process.ip}
								{chartDataStore.find(
									(c) => c.name == process.name,
								)?.cpus.length ?? 0}</td
							>
							{#if $settingsStore.showCPUChart}
								<td>
									<LinkedChart
										linked="link-1"
										labels={chartDataStore
											.find((c) => c.name == process.name)
											?.cpus.map((c, i) => i)}
										values={chartDataStore.find(
											(c) => c.name == process.name,
										)?.cpus}
									/>
								</td>
							{/if}
							<td>
								<ButtonLoadingList {process}
								></ButtonLoadingList>
							</td>
							{#if $settingsStore.showMetrics}
								<td class="grid grid-cols-2 gap-1 items-center">
									{#if process.monitor}
										{#each Object.entries(process?.monitor)
											.filter(([key, value]) => !ToExludeMonitorKeys.includes(key) && value.value !== undefined)
											.map(([key, value]) => {
												return { key, value: value.value }
											}) as metric}
											<div
												class="text-xs italic text-left"
											>
												{metric.key}:
											</div>
											<div class="text-left">
												{metric.value}
											</div>
										{/each}
									{/if}
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{:else}
	<p>No processes found</p>
{/if}
<div class="h-[100px]"></div>

