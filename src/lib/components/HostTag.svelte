<script lang="ts">
	import type { Host } from "../host.svelte"

	let {
		host
	}: {
		host: Host
	} = $props()
</script>

<button
	class="
flex flex-row gap-2
items-center
curstor-pointer w-[150px] rounded-full m-auto border-2 p-1 {host.visibile
		? 'border-success'
		: 'border-neutral'}"
	onclick={() => {
		host.visibile = !host.visibile
	}}
>
	<div
		class="w-3 h-3 {!host.pinged
			? 'bg-success animated-pulse'
			: 'bg-neutral'}"
	></div>
	<div>{host.ip}</div>
</button>
