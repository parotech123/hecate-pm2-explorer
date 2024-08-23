import { context } from "esbuild";
// import metaUrlPlugin from '@chialab/esbuild-plugin-meta-url';


let files = [
	{
		location: "./hecate-server.js",
		name: "hecate-server"
	},

]

let ctxs = []


async function launch() {
	for await (let file of files) {

		ctxs.push(await context({
			entryPoints: [file.location],
			bundle: true,
			outfile: `./bundles/${file.name}.js`,
			platform: 'node',
			logLevel:"error",
			external:["term.js", "pty.js"],
			target: 'node22',
			resolveExtensions: ['.js', '.json'],
			format: 'cjs',
			// plugins: [
			// 	metaUrlPlugin(),
			// ],
		}))

	}

	Promise.all(ctxs.map(ctx => ctx.watch()))
}

launch()