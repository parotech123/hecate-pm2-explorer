<script>
	import DrawerWrapper from 'src/lib/components/DrawerWrapper.svelte'
	import '../app.css'
	//@ts-ignore
	import { pwaInfo } from 'virtual:pwa-info'
	import { onMount } from 'svelte'

	import { pwaAssetsHead } from 'virtual:pwa-assets/head';

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register')
			registerSW({
				immediate: true,
				onRegistered(r) {
					// uncomment following code if you want check for updates
					// r && setInterval(() => {
					//    console.log('Checking for sw update')
					//    r.update()
					// }, 20000 /* 20s for testing purposes */)
					console.log(`SW Registered: ${r}`)
				},
				onRegisterError(error) {
					console.log('SW registration error', error)
				},
			})
		}
	})

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
	{@html webManifestLink}


{#if pwaAssetsHead.themeColor}
	<meta name="theme-color" content={pwaAssetsHead.themeColor.content} />
	{/if}
	{#each pwaAssetsHead.links as link}
	<link {...link} />
	{/each}

</svelte:head>

<slot />
<DrawerWrapper></DrawerWrapper>
