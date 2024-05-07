<script lang="ts">
	import { updateProcesses } from '../api-calls.svelte'
	import ButtonLoading from './ButtonLoading.svelte'
	import { pauseBS$, settingsStore } from '../stores/settings.state.svelte'
	import { filter, timer } from 'rxjs'

	let dialog: any

	let pause = $state<boolean>($settingsStore.pause)

	let list = $derived.by(() => {
		return [
			{
				color: 'primary',
				icon: 'mdi:refresh',
				cmd: async () => {
					await updateProcesses()
				},
			},
			{
				color: 'accent',
				icon: !pause
					? 'mdi:pause'
					: 'mdi:play',
				applyLoading: false,
				cmd: async () => {
					pauseBS$.next(!pauseBS$.value)
				},
			},
			{
				color: 'info',
				icon: 'mdi:cog',
				applyLoading: false,
				cmd: async () => {
					dialog.showModal()
				},
			},
		]
	})

	let currentIndex = $state(0)
	$effect(() => {
		const timer$ = timer(1000, 1000)
			.pipe(filter((_) => !pauseBS$.value))
			
			.subscribe((_) => {

				if (currentIndex == $settingsStore.refreshTimerSeconds) {
					currentIndex = 0
					updateProcesses()
				} else {
					currentIndex++
				}
			})

		return () => {
			timer$.unsubscribe()
		}
	})

$effect(() => {

	pauseBS$.subscribe((value) => {
		$settingsStore.pause = value
		pause = value
		if (value) {
			currentIndex = 0
		}
	})

	return () => {
		pauseBS$.unsubscribe()
	}
})

</script>

<div class="navbar bg-base-100 gap-4 sticky top-0 z-50">
	<div class="flex flex-row gap-3 items-center m-auto">
		<div class="m-auto md:text-right">
			<span class="text-2xl font-bold">Hecate</span>
		</div>
		{#each list as item}
			<ButtonLoading {...item}></ButtonLoading>
		{/each}
		{#if !pause}

			<span class="countdown">
				<span style="--value:{$settingsStore.refreshTimerSeconds-currentIndex};"></span>
			</span>
		{/if}
	</div>
</div>
<dialog id="my_modal_3" class="modal" bind:this={dialog}>
	<div class="modal-box">
		<form method="dialog">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				>✕</button
			>
		</form>
		<h3 class="font-bold text-lg">Settings</h3>
		<div class="form-control">
			<label class="cursor-pointer label w-[200px]">
				<span class="label-text">Show Cpu Charts</span>
				<input
					type="checkbox"
					bind:checked={$settingsStore.showCPUChart}
					class="checkbox checkbox-success"
				/>
			</label>
			<label class="cursor-pointer label w-[200px]">
				<span class="label-text">Show Metrics</span>
				<input
					type="checkbox"
					bind:checked={$settingsStore.showMetrics}
					class="checkbox checkbox-success"
				/>
			</label>
		</div>
	</div>
</dialog>
