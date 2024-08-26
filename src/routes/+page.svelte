<script lang="ts">
	import {
		processes,
		updateProcesses,
		processInfos,
		loadServ,
		servers
	} from "src/lib/api-calls.svelte"

	import {
		ToExludeMonitorKeys,
		fromByteToHuman,
		fromMillisecondsToDDHHmmss
	} from "$lib/utils"
	import { filter, timer } from "rxjs"

	import Badge from "$lib/components/Badge.svelte"

	import AppHeader from "src/lib/components/AppHeader.svelte"
	import ButtonLoadingList from "src/lib/components/ButtonLoadingList.svelte"
	import CardProcess from "src/lib/components/CardProcess.svelte"
	import LogViewer from "src/lib/components/LogViewer.svelte"
	import { chartDataStore } from "src/lib/stores/chart-data.svelte"
	import {
		pauseBS$,
		settingsStore
	} from "src/lib/stores/settings.state.svelte"
	import { LinkedChart } from "svelte-tiny-linked-charts"
	import { db } from "src/lib/db/db"
	import Icon from "@iconify/svelte"
	import HostTag from "src/lib/components/HostTag.svelte"
	import { Host } from "src/lib/host.svelte"

	$effect(() => {
		if (servers.data) {
			return
		}
		console.log("Loading servers")
		// createSettingsState()
		loadServ()
		// localStorage.setItem('hecate_settings', JSON.stringify(settings))
	})

	$effect(() => {
		if (!servers.data) {
			return
		}
		console.log("Loading processes")
		// createSettingsState()
		updateProcesses()
		// localStorage.setItem('hecate_settings', JSON.stringify(settings))
	})

	let processUI = $derived.by(() => {
		if (!processes.data || !processInfos.data) return []

		return processes.data
			.map((pro) => {
				return {
					...processInfos.data!.find((p) => p.name == pro.name),
					...pro
				}
			})
			.filter((p) => p.show)
	})

	$effect(() => {
		if (!processInfos.data) return

		processInfos.data!.forEach((p) => {
			db.processInfos.put({
				name: p.name,
				serial: p.serial,
				show: p.show
			})
		})
	})

	function hideProcess(process: (typeof processUI)[0]) {
		process.show = !process.show
		processInfos.replace({
			name: process.name,
			serial: process.serial!,
			show: process.show
		})
	}

	$inspect(console.log(processUI))

	let subnet = "192.168.1.0/24" // Default value

	let hostDialog: any
	let selectedHost = $state(new Host())

	function editHost(host?: Host) {
		let isNew = host ? false : true

		host ||= new Host()

		selectedHost = host
		hostDialog.showModal()
	}

	async function saveHost() {
		let hosts = await db.hosts.toArray()

		console.log(hosts)
		console.log(selectedHost)
		if (hosts.find((h) => h.ip == selectedHost.ip)) {
			console.log(selectedHost)
			// servers.add(selectedHost)
		} else {
			await db.hosts.add({
				host: selectedHost.host,
				ip: selectedHost.ip,
				name: selectedHost.name,
				pinged: selectedHost.pinged,
				port: selectedHost.port,
				visibile: selectedHost.visibile
			})
		}

		servers.replace(selectedHost)
	}
</script>

<svelte:head>
	<title>Hecate</title>
</svelte:head>

<AppHeader></AppHeader>
<div class="flex flex-row items-center gap-2">
	{#if servers.data}
		{#each servers.data ?? [] as host}
			<HostTag {host}></HostTag>
		{/each}
	{/if}
	<button
		class="btn"
		onclick={() => {
			editHost()
		}}>open modal</button
	>
</div>
<dialog id="host_modal" class="modal" bind:this={hostDialog}>
	{#if selectedHost}
		<div class="modal-box">
			<h3 class="text-lg font-bold">Add Host</h3>
			<label class="form-control w-full max-w-xs">
				<div class="label">
					<span class="label-text">Host name</span>
				</div>
				<input
					type="text"
					bind:value={selectedHost.name}
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				<div class="label">
					<span class="label-text">Host address</span>
				</div>
				<input
					type="text"
					bind:value={selectedHost.ip}
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
				/>
			</label>
			<div class="flex flex-row items-center justify-end gap-2">
				<button
					class="btn"
					onclick={() => {
						hostDialog.close()
					}}>Cancel</button
				>
				<button
					class="btn btn-success"
					onclick={() => {
						saveHost()
						hostDialog.close()
					}}>Save</button
				>
			</div>
		</div>
	{/if}
</dialog>
<!-- <input bind:value={subnet} placeholder="Enter a subnet mask" />
<button on:click={async()=>{fetchProcesses}}>Fetch Processes</button> -->

{#if processUI && processUI.length > 0}
	<div class="flex flex-wrap md:hidden justify-center gap-5 mt-5">
		{#each processUI as process}
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
					{#each processUI as process}
						<tr>
							<td>{process.pm_id}</td>
							<td class="text-secondary font-semibold"
								>{process.name}

								<button
									class="btn btn-icon-sm btn-ghost"
									onclick={() => hideProcess(process)}
								>
									<Icon
										icon="iconamoon:eye-off"
										class="text-xl text-accent"
									></Icon>
								</button></td
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
									(c) => c.name == process.name
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
											(c) => c.name == process.name
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
