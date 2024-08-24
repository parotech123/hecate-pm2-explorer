<script lang="ts">
	import type { Host } from "../host.svelte"


let {
    host
}:{
    host:Host
} =$props()

</script>

<button class="curstor-pointer w-[150px] rounded-full m-auto border-3 {host.selected ? 'border-success' : 'border-neutral'}"
    
onclick={()=>{host.selected = !host.selected}}
>
    <div class="w-3 h-3 {!host.pinged ? 'bg-success animated-pulse':'bg-neutral'}"></div>
    <div>{host.ip}</div>
</button>
