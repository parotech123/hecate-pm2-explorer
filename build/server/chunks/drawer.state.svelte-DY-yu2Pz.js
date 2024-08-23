import { z as current_component, A as noop } from './index2-DBlbVEXJ.js';

function onDestroy(fn) {
  var context = (
    /** @type {import('#server').Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
function createEventDispatcher() {
  return noop;
}
async function tick() {
}
class DialogOpenState {
  dialogOpen = false;
  componentToRender;
}
let dialogOpenState = new DialogOpenState();

export { createEventDispatcher as c, dialogOpenState as d, onDestroy as o, tick as t };
//# sourceMappingURL=drawer.state.svelte-DY-yu2Pz.js.map
