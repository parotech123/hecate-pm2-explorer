/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b5f7729d'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "_app/immutable/assets/_layout.BF2gY0Z8.css",
    "revision": null
  }, {
    "url": "_app/immutable/assets/0.9hsXh3N3.css",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/disclose-version.I6GFEVAi.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/drawer.state.svelte.BzkAP9zv.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/entry.D8k8hsY6.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/index-client.B7V-3nGG.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/index.BhO3S-8N.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/preload-helper.B8Wtyy2z.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/runtime.D8OBqRL4.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/store.DvUvb1GQ.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/virtual_pwa-register.MobMTQu1.js",
    "revision": null
  }, {
    "url": "_app/immutable/chunks/workbox-window.prod.es5.D5gOYdM7.js",
    "revision": null
  }, {
    "url": "_app/immutable/entry/app.BwLqda0E.js",
    "revision": null
  }, {
    "url": "_app/immutable/entry/start.CLFp5kay.js",
    "revision": null
  }, {
    "url": "_app/immutable/nodes/0.Dw-VXyFf.js",
    "revision": null
  }, {
    "url": "_app/immutable/nodes/1.BigX1gvX.js",
    "revision": null
  }, {
    "url": "_app/immutable/nodes/2.D-ruEsrc.js",
    "revision": null
  }, {
    "url": "192x192.png",
    "revision": "ff60c04f0bf6f57a72cc241326100679"
  }, {
    "url": "512x512.png",
    "revision": "e4cab6feecca0ee846c194aac74c2e55"
  }, {
    "url": "favicon.png",
    "revision": "9eb4b48caf122fee5f5a3f1d2ffc3acc"
  }, {
    "url": "manifest.webmanifest",
    "revision": "de0e1b92f6586a6b2f5fff9d2003dbbb"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/")));

}));
