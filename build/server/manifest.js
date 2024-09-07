const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["192x192.png","512x512.png","favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.CLFp5kay.js","app":"_app/immutable/entry/app.BwLqda0E.js","imports":["_app/immutable/entry/start.CLFp5kay.js","_app/immutable/chunks/entry.D8k8hsY6.js","_app/immutable/chunks/runtime.D8OBqRL4.js","_app/immutable/chunks/index.BhO3S-8N.js","_app/immutable/entry/app.BwLqda0E.js","_app/immutable/chunks/preload-helper.B8Wtyy2z.js","_app/immutable/chunks/runtime.D8OBqRL4.js","_app/immutable/chunks/index-client.B7V-3nGG.js","_app/immutable/chunks/disclose-version.I6GFEVAi.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./chunks/0-D2_iMEbN.js')),
			__memo(() => import('./chunks/1-Cxoe81uA.js')),
			__memo(() => import('./chunks/2-C-SKotla.js'))
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
				id: "/api/ping",
				pattern: /^\/api\/ping\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CnBd8sb1.js'))
			},
			{
				id: "/api/processes",
				pattern: /^\/api\/processes\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-lvNj_XjV.js'))
			},
			{
				id: "/api/processes/action/[id]",
				pattern: /^\/api\/processes\/action\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-7mRtOwud.js'))
			},
			{
				id: "/api/processes/delete",
				pattern: /^\/api\/processes\/delete\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DwIJ3dCo.js'))
			},
			{
				id: "/api/processes/describe/[id]",
				pattern: /^\/api\/processes\/describe\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DFKLcj8P.js'))
			},
			{
				id: "/api/processes/logs/[id]",
				pattern: /^\/api\/processes\/logs\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CWUSVn2n.js'))
			},
			{
				id: "/api/processes/logs/[id]/flush",
				pattern: /^\/api\/processes\/logs\/([^/]+?)\/flush\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CS6Mi6xj.js'))
			},
			{
				id: "/api/processes/restart/[id]",
				pattern: /^\/api\/processes\/restart\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CKj3kLiy.js'))
			},
			{
				id: "/api/processes/start/[id]",
				pattern: /^\/api\/processes\/start\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CcXdItwx.js'))
			},
			{
				id: "/api/processes/stop/[id]",
				pattern: /^\/api\/processes\/stop\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CnpecJUR.js'))
			},
			{
				id: "/api/remoteProcesses",
				pattern: /^\/api\/remoteProcesses\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-R2CVu40O.js'))
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
