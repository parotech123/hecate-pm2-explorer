<script lang="ts">
	import { processInfos } from "../api-calls.svelte"
	import type { ProcessInfo } from "../db/db"


</script>

<label class="cursor-pointer label w-[200px]">
	<span class="label-text">Show Process</span>
	<input
		type="checkbox"
		bind:checked={processInfos.selected!.show}
		class="checkbox checkbox-success"
	/>
</label>
