class DialogOpenState  {
	dialogOpen = $state(false)
	componentToRender = $state<ConstructorOfATypedSvelteComponent>()
}


export let dialogOpenState = new DialogOpenState()