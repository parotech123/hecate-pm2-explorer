<script lang="ts">
	import Icon from '@iconify/svelte'

	import { processes } from 'src/lib/api-calls.svelte'

	let {
        icon,
		color,
		cmd,
		applyLoading=true,
		classes="",
		text="",
	}: {
        icon: string
		color: string
		cmd: () => void
		applyLoading?: boolean
		classes?: string,
		text?: string
	} = $props()
</script>

<button
	class=" {classes ?? ""} btn join-item btn-square btn-outline btn-{color} btn-sm"
	onclick={cmd}
>
	{#if processes.loading && applyLoading}
		<span class=" loading loading-spinner loading-xs text-{color}"></span>
	{:else}
		<Icon {icon} class="text-base"></Icon>
		{text}
	{/if}
</button>
