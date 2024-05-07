<script>
	import { Drawer } from 'vaul-svelte'
	import { dialogOpenState } from '$lib/stores/drawer.state.svelte'
</script>

<Drawer.Root shouldScaleBackground bind:open={dialogOpenState.dialogOpen}>
	<!-- <Drawer.Trigger>
		<slot name="trigger">
			<button class="btn btn-sm"> Open </button>
		</slot>
	</Drawer.Trigger> -->
	<Drawer.Portal>
		<Drawer.Overlay class="fixed inset-0 bg-black/40" />
		<Drawer.Content
			class="fixed bottom-0 left-0 right-0 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-neutral"
		>
			<slot name="content">
				{#if dialogOpenState.componentToRender}
					<svelte:component
						this={dialogOpenState.componentToRender}
					/>
				{/if}
			</slot>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
