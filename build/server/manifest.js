const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.60e304a4.js","app":"_app/immutable/entry/app.d08fffe0.js","imports":["_app/immutable/entry/start.60e304a4.js","_app/immutable/chunks/scheduler.74fe2faf.js","_app/immutable/chunks/singletons.6452e712.js","_app/immutable/chunks/index.4c365075.js","_app/immutable/entry/app.d08fffe0.js","_app/immutable/chunks/scheduler.74fe2faf.js","_app/immutable/chunks/index.3fdc5290.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-53c63906.js')),
			__memo(() => import('./chunks/1-1a66c635.js')),
			__memo(() => import('./chunks/2-de3f9e57.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/processes",
				pattern: /^\/api\/processes\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-40e2a86c.js'))
			},
			{
				id: "/api/processes/delete",
				pattern: /^\/api\/processes\/delete\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-cc55155a.js'))
			},
			{
				id: "/api/processes/logs/[id]",
				pattern: /^\/api\/processes\/logs\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-9b5dca50.js'))
			},
			{
				id: "/api/processes/logs/[id]/flush",
				pattern: /^\/api\/processes\/logs\/([^/]+?)\/flush\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-7cb82d4f.js'))
			},
			{
				id: "/api/processes/restart/[id]",
				pattern: /^\/api\/processes\/restart\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-db38acfc.js'))
			},
			{
				id: "/api/processes/start/[id]",
				pattern: /^\/api\/processes\/start\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-e2ffcb82.js'))
			},
			{
				id: "/api/remoteProcesses",
				pattern: /^\/api\/remoteProcesses\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-82eea018.js'))
			},
			{
				id: "/api/[ip]",
				pattern: /^\/api\/([^/]+?)\/?$/,
				params: [{"name":"ip","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-dfa5bc39.js'))
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();

const prerendered = new Set([]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
