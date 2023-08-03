<script lang="ts">
import {
    loadingStore
} from "$lib/loading.store"
import Icon from "@iconify/svelte"
import {
    createEventDispatcher
} from "svelte"

export let classes = '';
export let icon: string = '';
export let color = 'primary';

//create dispatcher for click
const clickDispatcher = createEventDispatcher();

//handle click
function handleClick() {
    clickDispatcher('click');
}
</script>

<button class=' {classes} btn join-item  btn-square btn-outline btn-{color} btn-sm' on:click={()=>{
    handleClick()
    }}>
    {#if $loadingStore}
    <span class=" loading loading-spinner loading-xs text-{color}"></span>
    {:else}
    <slot></slot>
    <Icon {icon} class="text-base"></Icon>
    {/if}
</button>
