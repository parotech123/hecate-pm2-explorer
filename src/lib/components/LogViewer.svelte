<script lang="ts">
	import Icon from '@iconify/svelte'
	import { format } from 'date-fns'
	import {  processes,logging } from '../api-calls.svelte'
	import Badge from './Badge.svelte'

	// export let height
</script>

{#if processes.selected}
	{#if logging.logs}
		<div class="divider flex-auto hidden md:flex">
			{#if processes.selected}
				<div class="flex flex-row gap-4 items-center">
					<div>
						{processes.selected?.name}
					</div>
					<Badge process={processes.selected}></Badge>
				</div>
				<!-- <div class="flex flex-row gap-4">
					<ButtonLoading
						color="info"
						on:click={async () => {
							await fetchLogs(processes.selected, 10)
						}}
					>
						10
					</ButtonLoading>
					<ButtonLoading
						color="info"
						on:click={async () => {
							await fetchLogs(processes.selected, 100)
						}}
					>
						100
					</ButtonLoading>
					<ButtonLoading
						color="info"
						on:click={async () => {
							await fetchLogs(processes.selected, 500)
						}}
					>
						500
					</ButtonLoading>
				</div> -->
				<input
					type="text"
					placeholder="Type here"
					class="input input-bordered input-primary w-full max-w-xs"
					bind:value={logging.filterText}
				/>
			{/if}
		</div>
		<div
			class="flex flex-auto gap-3 flex-col md:hidden items-center justify-center"
		>
			<div class="flex flex-row gap-4 items-center">
				<div>
					{processes.selected?.name}
				</div>
				<Badge process={processes.selected}></Badge>
			</div>
			<!-- <div class="flex flex-row gap-4">
				<ButtonLoading
					color="info"
					on:click={async () => {
						await fetchLogs(processes.selected, 10)
					}}
				>
					10
				</ButtonLoading>
				<ButtonLoading
					color="info"
					on:click={async () => {
						await fetchLogs(processes.selected, 100)
					}}
				>
					100
				</ButtonLoading>
				<ButtonLoading
					color="info"
					on:click={async () => {
						await fetchLogs(processes.selected, 500)
					}}
				>
					500
				</ButtonLoading>
			</div> -->
			<input
				type="text"
				placeholder="Type here"
				class="input input-bordered input-primary w-full max-w-xs"
				bind:value={logging.filterText}
			/>
		</div>
		<div class="overflow-x-auto">
			{#if logging.filteredLogs}
				{#each logging.filteredLogs as line}
					{#if typeof line === 'object' && typeof line.message !== 'undefined'}
						<table
							class="table table-zebra mt-2 table-xs w-full"
						
						>
							<tbody>
								<tr class="!max-h-[30px]">
									<td class="w-[10px] max-h-[30px]">
										<Icon
											icon="radix-icons:dot"
											class="text-2xl"
										></Icon>
									</td>
									<td class="w-[150px]">
										<div>
											{format(
												line.timestamp,
												'dd/MM HH:mm:ss.SSS',
											)}:
										</div>
									</td>
									<td
										class={line.type == 'out'
											? 'text-info'
											: 'text-error'}
									>
										{line.message}
									</td>
								</tr>
							</tbody>
						</table>
					{:else}
						<li class="">{line}</li>
					{/if}
				{/each}
			{/if}
		</div>
	{/if}
{/if}
