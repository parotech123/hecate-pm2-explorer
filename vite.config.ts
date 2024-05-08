import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

import fs from 'node:fs';
export default defineConfig({
	plugins: [
		SvelteKitPWA({
			srcDir: './build',
			outDir: './.svelte-kit/output/client',
			mode: 'development',
			includeManifestIcons: false,
			scope: '/',
			base: '/',
			registerType: 'autoUpdate',
			
			workbox: {
				globPatterns: ['client/**/*.{js,css,html,ico,png,svg}']
			},
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
			manifest: {
				name: 'Hecate',
				short_name: 'Hecate',
				description: 'Hecate PM2 Monitor',
				theme_color: '#ffffff',
				start_url: '/',
				scope: '/',
				icons: [
					{
						src: '192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			}
		}),

		sveltekit(),
	],
	preview: {
		host: "0.0.0.0",
		port: 3001,
		https: {
			cert: fs.readFileSync("me.king-rudd.ts.net.crt"),
			key: fs.readFileSync("me.king-rudd.ts.net.key")
		}
	}
});
