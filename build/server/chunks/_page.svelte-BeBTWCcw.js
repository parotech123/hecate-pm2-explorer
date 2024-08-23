import { h as head, f as ensure_array_like, k as store_get, t as escape_html, u as unsubscribe_stores, a as pop, l as bind_props, i as spread_attributes, n as spread_props, g as attr, w as stringify, j as rest_props, v as value_or_fallback, x as mutate_store, p as push, m as sanitize_props, y as once } from './index2-DBlbVEXJ.js';
import { parse, format } from 'date-fns';
import orderBy from 'lodash-es/orderBy.js';
import { g as get_store_value, w as writable } from './index-DVbaZPnI.js';
import Dexie from 'dexie';
import { maxBy } from 'lodash-es';
import { o as onDestroy, d as dialogOpenState, c as createEventDispatcher } from './drawer.state.svelte-DY-yu2Pz.js';
import { BehaviorSubject } from 'rxjs';

let chartDataStore = [];
class CrudState {
  data = null;
  _id;
  selected = null;
  loading = false;
  constructor(_id) {
    this._id = _id;
  }
  replace(dataToReplace) {
    if (Array.isArray(dataToReplace)) {
      this.data = [
        ...dataToReplace,
        ...this.data ? this.data.filter((d) => dataToReplace.map((dr) => dr[this._id]).includes(d[this._id])) : []
      ];
    } else {
      this.data = [
        ...this.data ? this.data.filter((d) => d[this._id] !== dataToReplace[this._id]) : [],
        dataToReplace
      ];
    }
  }
  remove(dataToRemove) {
    if (!this.data)
      return;
    if (Array.isArray(dataToRemove)) {
      this.data = this.data.filter((d) => !dataToRemove.map((dr) => dr[this._id]).includes(d[this._id]));
    } else {
      this.data = this.data.filter((d) => d[this._id] !== dataToRemove[this._id]);
    }
  }
  reset() {
    this.data = null;
  }
  add(dataToAdd) {
    if (Array.isArray(dataToAdd)) {
      this.data = [...this.data ?? [], ...dataToAdd];
    } else {
      this.data = [...this.data ?? [], dataToAdd];
    }
  }
}
const errorsStore = writable([]);
const logsStore = writable([]);
const splitterStore = writable(" | ");
class Logging {
  logs = [];
  filterText = "";
  #filteredLogs = once(() => {
    if (!this.logs)
      return;
    if (this.filterText == "")
      return this.logs;
    let toReturn = this.logs.filter((line) => {
      if (typeof line === "object" && line.message) {
        return line.message.toLowerCase().includes(this.filterText.toLowerCase());
      } else if (typeof line === "string") {
        return line.toLowerCase().includes(this.filterText.toLowerCase());
      }
    });
    return toReturn;
  });
  get filteredLogs() {
    return this.#filteredLogs();
  }
}
class MySubClassedDexie extends Dexie {
  processInfos;
  metricInfos;
  constructor() {
    super("myDatabase");
    this.version(2).stores({
      processInfos: "&name, serial, show",
      // Primary key and indexed props,
      metricInfos: "name, type"
    });
  }
}
const db = new MySubClassedDexie();
let logging = new Logging();
let processes = new CrudState("name");
let processInfos = new CrudState("name");
async function updateProcesses() {
  processes.loading = true;
  const res = await fetch("/api/processes");
  const data = await res.json();
  processes.reset();
  processes.data = data;
  data.forEach((element) => {
    let history = chartDataStore.find((c) => c.name === element.name);
    if (!history) {
      history = { name: element.name, cpus: [] };
      chartDataStore.push(history);
    }
    history.cpus.push(element.cpu == 0 ? 0.01 : element.cpu);
  });
  let dataDB = await db.processInfos.toArray();
  if (!dataDB || dataDB.length !== data.length) {
    dataDB = data.map((d, i) => {
      return { name: d.name, serial: i, show: true };
    });
    dataDB.forEach((d, i) => {
      try {
        let result = db.processInfos.put(d, "name").catch((error) => {
          console.log(error);
        });
      } catch (error) {
        console.log(error);
      }
    });
  } else {
    processes.data.forEach((d, i) => {
      let foundDB = dataDB.find((db2) => db2.name === d.name);
      if (!foundDB) {
        let maxSerial = maxBy(dataDB, "serial");
        let newProcess = {
          name: d.name,
          serial: (maxSerial?.serial ?? 0) + 1,
          show: true
        };
        dataDB.push(newProcess);
        db.processInfos.put(newProcess, "name");
      }
    });
  }
  processInfos.data = dataDB;
  processes.loading = false;
}
async function deleteProcess(p) {
  processes.loading = true;
  let result = await fetch(`/api/processes/delete`, {
    method: "POST",
    body: JSON.stringify({ id: p.pm_id }),
    headers: { "Content-Type": "application/json" }
  });
  console.log(result);
  await updateProcesses();
  processes.loading = false;
}
async function restartProcess(p) {
  processes.loading = true;
  let result = await fetch(`/api/processes/restart/${p.pm_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  console.log(result);
  await updateProcesses();
  processes.loading = false;
}
async function stopProcess(p) {
  processes.loading = true;
  let result = await fetch(`/api/processes/stop/${p.pm_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  console.log(result);
  await updateProcesses();
  processes.loading = false;
}
async function flushLogs(p) {
  processes.loading = true;
  const res = await fetch(`/api/processes/logs/${p.name}/flush`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  if (res.ok) {
    alert("Logs flushed");
  }
  processes.loading = false;
}
async function fetchLogs(p, lines) {
  if (!p)
    return;
  processes.loading = true;
  const res = await fetch(`/api/processes/logs/${p.name}?lines=${lines || 10}`);
  const data = await res.json();
  console.log(data);
  let logs = data.outLogs.split("\n").map((l) => {
    try {
      let log = JSON.parse(l.replace("\n", ""));
      log.timestamp = parse(log.timestamp.split(" ")[0] + " " + log.timestamp.split(" ")[1], "dd/MM HH:mm:ss.SSS", /* @__PURE__ */ new Date());
      let splitted = log.message.split(get_store_value(splitterStore));
      log.message = splitted.filter((l2, i) => {
        return splitted.length > 1 ? i > 0 : true;
      }).join(get_store_value(splitterStore));
      console.log(log);
      return log;
    } catch (error) {
      console.log(l);
      return l;
    }
  }).filter((l) => Boolean(l));
  logsStore.set(logs);
  let errors = data.errLogs.split("\n").map((l) => {
    try {
      let log = JSON.parse(l.replace("\n", ""));
      log.timestamp = parse(log.timestamp.split(" ")[0] + " " + log.timestamp.split(" ")[1], "dd/MM HH:mm:ss.SSS", /* @__PURE__ */ new Date());
      return log;
    } catch (error) {
      console.log(l);
      return;
    }
  }).filter((l) => Boolean(l));
  errorsStore.set(errors);
  logging.logs = orderBy([...logs, ...errors], "timestamp", "desc");
  console.log(logging.logs);
  processes.loading = false;
}
function fromByteToHuman(bytes) {
  if (!bytes)
    return "0B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const number = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, Math.floor(number))).toFixed(2) + " " + units[number];
}
function fromMillisecondsToDDHHmmss(ms) {
  if (!ms)
    return "0s";
  const days = Math.floor(ms / (24 * 60 * 60 * 1e3));
  const daysms = ms % (24 * 60 * 60 * 1e3);
  const hours = Math.floor(daysms / (60 * 60 * 1e3));
  const hoursms = ms % (60 * 60 * 1e3);
  const minutes = Math.floor(hoursms / (60 * 1e3));
  const minutesms = ms % (60 * 1e3);
  const sec = Math.floor(minutesms / 1e3);
  let array = [
    days ? days + "d" : "",
    hours ? hours + "h" : "",
    minutes ? minutes + "m" : "",
    sec ? sec + "s" : ""
  ];
  return array.join("");
}
const ToExludeMonitorKeys = [
  "Active handles",
  "Active requests",
  "Event Loop Latency p95",
  "Event Loop Latency",
  "Heap Size",
  "Heap Usage",
  "Used Heap Size"
];
function Badge($$payload, $$props) {
  push();
  let process = $$props["process"];
  $$payload.out += `<!--[-->`;
  if (process.status === "online") {
    $$payload.out += `<span class="badge badge-success badge-outline">${escape_html(process.status)}</span>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += `<span class="badge badge-error badge-outline">${escape_html(process.status)}</span>`;
    $$payload.out += "<!--]!-->";
  }
  bind_props($$props, { process });
  pop();
}
const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
  const colonSeparated = value.split(":");
  if (value.slice(0, 1) === "@") {
    if (colonSeparated.length < 2 || colonSeparated.length > 3) {
      return null;
    }
    provider = colonSeparated.shift().slice(1);
  }
  if (colonSeparated.length > 3 || !colonSeparated.length) {
    return null;
  }
  if (colonSeparated.length > 1) {
    const name22 = colonSeparated.pop();
    const prefix = colonSeparated.pop();
    const result = {
      // Allow provider without '@': "provider:prefix:name"
      provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
      prefix,
      name: name22
    };
    return validate && !validateIconName(result) ? null : result;
  }
  const name2 = colonSeparated[0];
  const dashSeparated = name2.split("-");
  if (dashSeparated.length > 1) {
    const result = {
      provider,
      prefix: dashSeparated.shift(),
      name: dashSeparated.join("-")
    };
    return validate && !validateIconName(result) ? null : result;
  }
  if (allowSimpleName && provider === "") {
    const result = {
      provider,
      prefix: "",
      name: name2
    };
    return validate && !validateIconName(result, allowSimpleName) ? null : result;
  }
  return null;
};
const validateIconName = (icon, allowSimpleName) => {
  if (!icon) {
    return false;
  }
  return !!((icon.provider === "" || icon.provider.match(matchIconName)) && (allowSimpleName && icon.prefix === "" || icon.prefix.match(matchIconName)) && icon.name.match(matchIconName));
};
const defaultIconDimensions = Object.freeze(
  {
    left: 0,
    top: 0,
    width: 16,
    height: 16
  }
);
const defaultIconTransformations = Object.freeze({
  rotate: 0,
  vFlip: false,
  hFlip: false
});
const defaultIconProps = Object.freeze({
  ...defaultIconDimensions,
  ...defaultIconTransformations
});
const defaultExtendedIconProps = Object.freeze({
  ...defaultIconProps,
  body: "",
  hidden: false
});
function mergeIconTransformations(obj1, obj2) {
  const result = {};
  if (!obj1.hFlip !== !obj2.hFlip) {
    result.hFlip = true;
  }
  if (!obj1.vFlip !== !obj2.vFlip) {
    result.vFlip = true;
  }
  const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
  if (rotate) {
    result.rotate = rotate;
  }
  return result;
}
function mergeIconData(parent, child) {
  const result = mergeIconTransformations(parent, child);
  for (const key in defaultExtendedIconProps) {
    if (key in defaultIconTransformations) {
      if (key in parent && !(key in result)) {
        result[key] = defaultIconTransformations[key];
      }
    } else if (key in child) {
      result[key] = child[key];
    } else if (key in parent) {
      result[key] = parent[key];
    }
  }
  return result;
}
function getIconsTree(data, names) {
  const icons = data.icons;
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  const resolved = /* @__PURE__ */ Object.create(null);
  function resolve(name2) {
    if (icons[name2]) {
      return resolved[name2] = [];
    }
    if (!(name2 in resolved)) {
      resolved[name2] = null;
      const parent = aliases[name2] && aliases[name2].parent;
      const value = parent && resolve(parent);
      if (value) {
        resolved[name2] = [parent].concat(value);
      }
    }
    return resolved[name2];
  }
  Object.keys(icons).concat(Object.keys(aliases)).forEach(resolve);
  return resolved;
}
function internalGetIconData(data, name2, tree) {
  const icons = data.icons;
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  let currentProps = {};
  function parse2(name22) {
    currentProps = mergeIconData(
      icons[name22] || aliases[name22],
      currentProps
    );
  }
  parse2(name2);
  tree.forEach(parse2);
  return mergeIconData(data, currentProps);
}
function parseIconSet(data, callback) {
  const names = [];
  if (typeof data !== "object" || typeof data.icons !== "object") {
    return names;
  }
  if (data.not_found instanceof Array) {
    data.not_found.forEach((name2) => {
      callback(name2, null);
      names.push(name2);
    });
  }
  const tree = getIconsTree(data);
  for (const name2 in tree) {
    const item = tree[name2];
    if (item) {
      callback(name2, internalGetIconData(data, name2, item));
      names.push(name2);
    }
  }
  return names;
}
const optionalPropertyDefaults = {
  provider: "",
  aliases: {},
  not_found: {},
  ...defaultIconDimensions
};
function checkOptionalProps(item, defaults) {
  for (const prop in defaults) {
    if (prop in item && typeof item[prop] !== typeof defaults[prop]) {
      return false;
    }
  }
  return true;
}
function quicklyValidateIconSet(obj) {
  if (typeof obj !== "object" || obj === null) {
    return null;
  }
  const data = obj;
  if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
    return null;
  }
  if (!checkOptionalProps(obj, optionalPropertyDefaults)) {
    return null;
  }
  const icons = data.icons;
  for (const name2 in icons) {
    const icon = icons[name2];
    if (!name2.match(matchIconName) || typeof icon.body !== "string" || !checkOptionalProps(
      icon,
      defaultExtendedIconProps
    )) {
      return null;
    }
  }
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  for (const name2 in aliases) {
    const icon = aliases[name2];
    const parent = icon.parent;
    if (!name2.match(matchIconName) || typeof parent !== "string" || !icons[parent] && !aliases[parent] || !checkOptionalProps(
      icon,
      defaultExtendedIconProps
    )) {
      return null;
    }
  }
  return data;
}
const dataStorage = /* @__PURE__ */ Object.create(null);
function newStorage(provider, prefix) {
  return {
    provider,
    prefix,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function getStorage(provider, prefix) {
  const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
  return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
}
function addIconSet(storage2, data) {
  if (!quicklyValidateIconSet(data)) {
    return [];
  }
  return parseIconSet(data, (name2, icon) => {
    if (icon) {
      storage2.icons[name2] = icon;
    } else {
      storage2.missing.add(name2);
    }
  });
}
function addIconToStorage(storage2, name2, icon) {
  try {
    if (typeof icon.body === "string") {
      storage2.icons[name2] = { ...icon };
      return true;
    }
  } catch (err) {
  }
  return false;
}
let simpleNames = false;
function allowSimpleNames(allow) {
  {
    simpleNames = allow;
  }
  return simpleNames;
}
function getIconData(name2) {
  const icon = typeof name2 === "string" ? stringToIcon(name2, true, simpleNames) : name2;
  if (icon) {
    const storage2 = getStorage(icon.provider, icon.prefix);
    const iconName = icon.name;
    return storage2.icons[iconName] || (storage2.missing.has(iconName) ? null : void 0);
  }
}
function addIcon(name2, data) {
  const icon = stringToIcon(name2, true, simpleNames);
  if (!icon) {
    return false;
  }
  const storage2 = getStorage(icon.provider, icon.prefix);
  return addIconToStorage(storage2, icon.name, data);
}
function addCollection(data, provider) {
  if (typeof data !== "object") {
    return false;
  }
  if (typeof provider !== "string") {
    provider = data.provider || "";
  }
  if (simpleNames && !provider && !data.prefix) {
    let added = false;
    if (quicklyValidateIconSet(data)) {
      data.prefix = "";
      parseIconSet(data, (name2, icon) => {
        if (icon && addIcon(name2, icon)) {
          added = true;
        }
      });
    }
    return added;
  }
  const prefix = data.prefix;
  if (!validateIconName({
    provider,
    prefix,
    name: "a"
  })) {
    return false;
  }
  const storage2 = getStorage(provider, prefix);
  return !!addIconSet(storage2, data);
}
const defaultIconSizeCustomisations = Object.freeze({
  width: null,
  height: null
});
const defaultIconCustomisations = Object.freeze({
  // Dimensions
  ...defaultIconSizeCustomisations,
  // Transformations
  ...defaultIconTransformations
});
const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function calculateSize(size, ratio, precision) {
  if (ratio === 1) {
    return size;
  }
  precision = precision || 100;
  if (typeof size === "number") {
    return Math.ceil(size * ratio * precision) / precision;
  }
  if (typeof size !== "string") {
    return size;
  }
  const oldParts = size.split(unitsSplit);
  if (oldParts === null || !oldParts.length) {
    return size;
  }
  const newParts = [];
  let code = oldParts.shift();
  let isNumber = unitsTest.test(code);
  while (true) {
    if (isNumber) {
      const num = parseFloat(code);
      if (isNaN(num)) {
        newParts.push(code);
      } else {
        newParts.push(Math.ceil(num * ratio * precision) / precision);
      }
    } else {
      newParts.push(code);
    }
    code = oldParts.shift();
    if (code === void 0) {
      return newParts.join("");
    }
    isNumber = !isNumber;
  }
}
function splitSVGDefs(content, tag = "defs") {
  let defs = "";
  const index = content.indexOf("<" + tag);
  while (index >= 0) {
    const start = content.indexOf(">", index);
    const end = content.indexOf("</" + tag);
    if (start === -1 || end === -1) {
      break;
    }
    const endEnd = content.indexOf(">", end);
    if (endEnd === -1) {
      break;
    }
    defs += content.slice(start + 1, end).trim();
    content = content.slice(0, index).trim() + content.slice(endEnd + 1);
  }
  return {
    defs,
    content
  };
}
function mergeDefsAndContent(defs, content) {
  return defs ? "<defs>" + defs + "</defs>" + content : content;
}
function wrapSVGContent(body, start, end) {
  const split = splitSVGDefs(body);
  return mergeDefsAndContent(split.defs, start + split.content + end);
}
const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
function iconToSVG(icon, customisations) {
  const fullIcon = {
    ...defaultIconProps,
    ...icon
  };
  const fullCustomisations = {
    ...defaultIconCustomisations,
    ...customisations
  };
  const box = {
    left: fullIcon.left,
    top: fullIcon.top,
    width: fullIcon.width,
    height: fullIcon.height
  };
  let body = fullIcon.body;
  [fullIcon, fullCustomisations].forEach((props) => {
    const transformations = [];
    const hFlip = props.hFlip;
    const vFlip = props.vFlip;
    let rotation = props.rotate;
    if (hFlip) {
      if (vFlip) {
        rotation += 2;
      } else {
        transformations.push(
          "translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")"
        );
        transformations.push("scale(-1 1)");
        box.top = box.left = 0;
      }
    } else if (vFlip) {
      transformations.push(
        "translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")"
      );
      transformations.push("scale(1 -1)");
      box.top = box.left = 0;
    }
    let tempValue;
    if (rotation < 0) {
      rotation -= Math.floor(rotation / 4) * 4;
    }
    rotation = rotation % 4;
    switch (rotation) {
      case 1:
        tempValue = box.height / 2 + box.top;
        transformations.unshift(
          "rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")"
        );
        break;
      case 2:
        transformations.unshift(
          "rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")"
        );
        break;
      case 3:
        tempValue = box.width / 2 + box.left;
        transformations.unshift(
          "rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")"
        );
        break;
    }
    if (rotation % 2 === 1) {
      if (box.left !== box.top) {
        tempValue = box.left;
        box.left = box.top;
        box.top = tempValue;
      }
      if (box.width !== box.height) {
        tempValue = box.width;
        box.width = box.height;
        box.height = tempValue;
      }
    }
    if (transformations.length) {
      body = wrapSVGContent(
        body,
        '<g transform="' + transformations.join(" ") + '">',
        "</g>"
      );
    }
  });
  const customisationsWidth = fullCustomisations.width;
  const customisationsHeight = fullCustomisations.height;
  const boxWidth = box.width;
  const boxHeight = box.height;
  let width;
  let height;
  if (customisationsWidth === null) {
    height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
    width = calculateSize(height, boxWidth / boxHeight);
  } else {
    width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
    height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
  }
  const attributes = {};
  const setAttr = (prop, value) => {
    if (!isUnsetKeyword(value)) {
      attributes[prop] = value.toString();
    }
  };
  setAttr("width", width);
  setAttr("height", height);
  const viewBox = [box.left, box.top, boxWidth, boxHeight];
  attributes.viewBox = viewBox.join(" ");
  return {
    attributes,
    viewBox,
    body
  };
}
const regex = /\sid="(\S+)"/g;
const randomPrefix = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
let counter = 0;
function replaceIDs(body, prefix = randomPrefix) {
  const ids = [];
  let match;
  while (match = regex.exec(body)) {
    ids.push(match[1]);
  }
  if (!ids.length) {
    return body;
  }
  const suffix = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  ids.forEach((id) => {
    const newID = typeof prefix === "function" ? prefix(id) : prefix + (counter++).toString();
    const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body.replace(
      // Allowed characters before id: [#;"]
      // Allowed characters after id: [)"], .[a-z]
      new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"),
      "$1" + newID + suffix + "$3"
    );
  });
  body = body.replace(new RegExp(suffix, "g"), "");
  return body;
}
const storage = /* @__PURE__ */ Object.create(null);
function setAPIModule(provider, item) {
  storage[provider] = item;
}
function createAPIConfig(source) {
  let resources;
  if (typeof source.resources === "string") {
    resources = [source.resources];
  } else {
    resources = source.resources;
    if (!(resources instanceof Array) || !resources.length) {
      return null;
    }
  }
  const result = {
    // API hosts
    resources,
    // Root path
    path: source.path || "/",
    // URL length limit
    maxURL: source.maxURL || 500,
    // Timeout before next host is used.
    rotate: source.rotate || 750,
    // Timeout before failing query.
    timeout: source.timeout || 5e3,
    // Randomise default API end point.
    random: source.random === true,
    // Start index
    index: source.index || 0,
    // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
    dataAfterTimeout: source.dataAfterTimeout !== false
  };
  return result;
}
const configStorage = /* @__PURE__ */ Object.create(null);
const fallBackAPISources = [
  "https://api.simplesvg.com",
  "https://api.unisvg.com"
];
const fallBackAPI = [];
while (fallBackAPISources.length > 0) {
  if (fallBackAPISources.length === 1) {
    fallBackAPI.push(fallBackAPISources.shift());
  } else {
    if (Math.random() > 0.5) {
      fallBackAPI.push(fallBackAPISources.shift());
    } else {
      fallBackAPI.push(fallBackAPISources.pop());
    }
  }
}
configStorage[""] = createAPIConfig({
  resources: ["https://api.iconify.design"].concat(fallBackAPI)
});
function addAPIProvider(provider, customConfig) {
  const config = createAPIConfig(customConfig);
  if (config === null) {
    return false;
  }
  configStorage[provider] = config;
  return true;
}
function getAPIConfig(provider) {
  return configStorage[provider];
}
const detectFetch = () => {
  let callback;
  try {
    callback = fetch;
    if (typeof callback === "function") {
      return callback;
    }
  } catch (err) {
  }
};
let fetchModule = detectFetch();
function calculateMaxLength(provider, prefix) {
  const config = getAPIConfig(provider);
  if (!config) {
    return 0;
  }
  let result;
  if (!config.maxURL) {
    result = 0;
  } else {
    let maxHostLength = 0;
    config.resources.forEach((item) => {
      const host = item;
      maxHostLength = Math.max(maxHostLength, host.length);
    });
    const url = prefix + ".json?icons=";
    result = config.maxURL - maxHostLength - config.path.length - url.length;
  }
  return result;
}
function shouldAbort(status) {
  return status === 404;
}
const prepare = (provider, prefix, icons) => {
  const results = [];
  const maxLength = calculateMaxLength(provider, prefix);
  const type = "icons";
  let item = {
    type,
    provider,
    prefix,
    icons: []
  };
  let length = 0;
  icons.forEach((name2, index) => {
    length += name2.length + 1;
    if (length >= maxLength && index > 0) {
      results.push(item);
      item = {
        type,
        provider,
        prefix,
        icons: []
      };
      length = name2.length;
    }
    item.icons.push(name2);
  });
  results.push(item);
  return results;
};
function getPath(provider) {
  if (typeof provider === "string") {
    const config = getAPIConfig(provider);
    if (config) {
      return config.path;
    }
  }
  return "/";
}
const send = (host, params, callback) => {
  if (!fetchModule) {
    callback("abort", 424);
    return;
  }
  let path = getPath(params.provider);
  switch (params.type) {
    case "icons": {
      const prefix = params.prefix;
      const icons = params.icons;
      const iconsList = icons.join(",");
      const urlParams = new URLSearchParams({
        icons: iconsList
      });
      path += prefix + ".json?" + urlParams.toString();
      break;
    }
    case "custom": {
      const uri = params.uri;
      path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
      break;
    }
    default:
      callback("abort", 400);
      return;
  }
  let defaultError = 503;
  fetchModule(host + path).then((response) => {
    const status = response.status;
    if (status !== 200) {
      setTimeout(() => {
        callback(shouldAbort(status) ? "abort" : "next", status);
      });
      return;
    }
    defaultError = 501;
    return response.json();
  }).then((data) => {
    if (typeof data !== "object" || data === null) {
      setTimeout(() => {
        if (data === 404) {
          callback("abort", data);
        } else {
          callback("next", defaultError);
        }
      });
      return;
    }
    setTimeout(() => {
      callback("success", data);
    });
  }).catch(() => {
    callback("next", defaultError);
  });
};
const fetchAPIModule = {
  prepare,
  send
};
const browserCacheVersion = "iconify2";
const browserCachePrefix = "iconify";
const browserCacheCountKey = browserCachePrefix + "-count";
const browserCacheVersionKey = browserCachePrefix + "-version";
const browserStorageHour = 36e5;
const browserStorageCacheExpiration = 168;
function getStoredItem(func, key) {
  try {
    return func.getItem(key);
  } catch (err) {
  }
}
function setStoredItem(func, key, value) {
  try {
    func.setItem(key, value);
    return true;
  } catch (err) {
  }
}
function removeStoredItem(func, key) {
  try {
    func.removeItem(key);
  } catch (err) {
  }
}
function setBrowserStorageItemsCount(storage2, value) {
  return setStoredItem(storage2, browserCacheCountKey, value.toString());
}
function getBrowserStorageItemsCount(storage2) {
  return parseInt(getStoredItem(storage2, browserCacheCountKey)) || 0;
}
const browserStorageConfig = {
  local: true,
  session: true
};
const browserStorageEmptyItems = {
  local: /* @__PURE__ */ new Set(),
  session: /* @__PURE__ */ new Set()
};
let browserStorageStatus = false;
function setBrowserStorageStatus(status) {
  browserStorageStatus = status;
}
let _window = typeof window === "undefined" ? {} : window;
function getBrowserStorage(key) {
  const attr2 = key + "Storage";
  try {
    if (_window && _window[attr2] && typeof _window[attr2].length === "number") {
      return _window[attr2];
    }
  } catch (err) {
  }
  browserStorageConfig[key] = false;
}
function iterateBrowserStorage(key, callback) {
  const func = getBrowserStorage(key);
  if (!func) {
    return;
  }
  const version = getStoredItem(func, browserCacheVersionKey);
  if (version !== browserCacheVersion) {
    if (version) {
      const total2 = getBrowserStorageItemsCount(func);
      for (let i = 0; i < total2; i++) {
        removeStoredItem(func, browserCachePrefix + i.toString());
      }
    }
    setStoredItem(func, browserCacheVersionKey, browserCacheVersion);
    setBrowserStorageItemsCount(func, 0);
    return;
  }
  const minTime = Math.floor(Date.now() / browserStorageHour) - browserStorageCacheExpiration;
  const parseItem = (index) => {
    const name2 = browserCachePrefix + index.toString();
    const item = getStoredItem(func, name2);
    if (typeof item !== "string") {
      return;
    }
    try {
      const data = JSON.parse(item);
      if (typeof data === "object" && typeof data.cached === "number" && data.cached > minTime && typeof data.provider === "string" && typeof data.data === "object" && typeof data.data.prefix === "string" && // Valid item: run callback
      callback(data, index)) {
        return true;
      }
    } catch (err) {
    }
    removeStoredItem(func, name2);
  };
  let total = getBrowserStorageItemsCount(func);
  for (let i = total - 1; i >= 0; i--) {
    if (!parseItem(i)) {
      if (i === total - 1) {
        total--;
        setBrowserStorageItemsCount(func, total);
      } else {
        browserStorageEmptyItems[key].add(i);
      }
    }
  }
}
function initBrowserStorage() {
  if (browserStorageStatus) {
    return;
  }
  setBrowserStorageStatus(true);
  for (const key in browserStorageConfig) {
    iterateBrowserStorage(key, (item) => {
      const iconSet = item.data;
      const provider = item.provider;
      const prefix = iconSet.prefix;
      const storage2 = getStorage(
        provider,
        prefix
      );
      if (!addIconSet(storage2, iconSet).length) {
        return false;
      }
      const lastModified = iconSet.lastModified || -1;
      storage2.lastModifiedCached = storage2.lastModifiedCached ? Math.min(storage2.lastModifiedCached, lastModified) : lastModified;
      return true;
    });
  }
}
function mergeCustomisations(defaults, item) {
  const result = {
    ...defaults
  };
  for (const key in item) {
    const value = item[key];
    const valueType = typeof value;
    if (key in defaultIconSizeCustomisations) {
      if (value === null || value && (valueType === "string" || valueType === "number")) {
        result[key] = value;
      }
    } else if (valueType === typeof result[key]) {
      result[key] = key === "rotate" ? value % 4 : value;
    }
  }
  return result;
}
const separator = /[\s,]+/;
function flipFromString(custom, flip) {
  flip.split(separator).forEach((str) => {
    const value = str.trim();
    switch (value) {
      case "horizontal":
        custom.hFlip = true;
        break;
      case "vertical":
        custom.vFlip = true;
        break;
    }
  });
}
function rotateFromString(value, defaultValue = 0) {
  const units = value.replace(/^-?[0-9.]*/, "");
  function cleanup(value2) {
    while (value2 < 0) {
      value2 += 4;
    }
    return value2 % 4;
  }
  if (units === "") {
    const num = parseInt(value);
    return isNaN(num) ? 0 : cleanup(num);
  } else if (units !== value) {
    let split = 0;
    switch (units) {
      case "%":
        split = 25;
        break;
      case "deg":
        split = 90;
    }
    if (split) {
      let num = parseFloat(value.slice(0, value.length - units.length));
      if (isNaN(num)) {
        return 0;
      }
      num = num / split;
      return num % 1 === 0 ? cleanup(num) : 0;
    }
  }
  return defaultValue;
}
function iconToHTML(body, attributes) {
  let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const attr2 in attributes) {
    renderAttribsHTML += " " + attr2 + '="' + attributes[attr2] + '"';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
}
function encodeSVGforURL(svg) {
  return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
}
function svgToData(svg) {
  return "data:image/svg+xml," + encodeSVGforURL(svg);
}
function svgToURL(svg) {
  return 'url("' + svgToData(svg) + '")';
}
const defaultExtendedIconCustomisations = {
  ...defaultIconCustomisations,
  inline: false
};
const svgDefaults = {
  "xmlns": "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": true,
  "role": "img"
};
const commonProps = {
  display: "inline-block"
};
const monotoneProps = {
  "background-color": "currentColor"
};
const coloredProps = {
  "background-color": "transparent"
};
const propsToAdd = {
  image: "var(--svg)",
  repeat: "no-repeat",
  size: "100% 100%"
};
const propsToAddTo = {
  "-webkit-mask": monotoneProps,
  "mask": monotoneProps,
  "background": coloredProps
};
for (const prefix in propsToAddTo) {
  const list = propsToAddTo[prefix];
  for (const prop in propsToAdd) {
    list[prefix + "-" + prop] = propsToAdd[prop];
  }
}
function fixSize(value) {
  return value + (value.match(/^[-0-9.]+$/) ? "px" : "");
}
function render(icon, props) {
  const customisations = mergeCustomisations(defaultExtendedIconCustomisations, props);
  const mode = props.mode || "svg";
  const componentProps = mode === "svg" ? { ...svgDefaults } : {};
  if (icon.body.indexOf("xlink:") === -1) {
    delete componentProps["xmlns:xlink"];
  }
  let style = typeof props.style === "string" ? props.style : "";
  for (let key in props) {
    const value = props[key];
    if (value === void 0) {
      continue;
    }
    switch (key) {
      case "icon":
      case "style":
      case "onLoad":
      case "mode":
        break;
      case "inline":
      case "hFlip":
      case "vFlip":
        customisations[key] = value === true || value === "true" || value === 1;
        break;
      case "flip":
        if (typeof value === "string") {
          flipFromString(customisations, value);
        }
        break;
      case "color":
        style = style + (style.length > 0 && style.trim().slice(-1) !== ";" ? ";" : "") + "color: " + value + "; ";
        break;
      case "rotate":
        if (typeof value === "string") {
          customisations[key] = rotateFromString(value);
        } else if (typeof value === "number") {
          customisations[key] = value;
        }
        break;
      case "ariaHidden":
      case "aria-hidden":
        if (value !== true && value !== "true") {
          delete componentProps["aria-hidden"];
        }
        break;
      default:
        if (key.slice(0, 3) === "on:") {
          break;
        }
        if (defaultExtendedIconCustomisations[key] === void 0) {
          componentProps[key] = value;
        }
    }
  }
  const item = iconToSVG(icon, customisations);
  const renderAttribs = item.attributes;
  if (customisations.inline) {
    style = "vertical-align: -0.125em; " + style;
  }
  if (mode === "svg") {
    Object.assign(componentProps, renderAttribs);
    if (style !== "") {
      componentProps.style = style;
    }
    let localCounter = 0;
    let id = props.id;
    if (typeof id === "string") {
      id = id.replace(/-/g, "_");
    }
    return {
      svg: true,
      attributes: componentProps,
      body: replaceIDs(item.body, id ? () => id + "ID" + localCounter++ : "iconifySvelte")
    };
  }
  const { body, width, height } = icon;
  const useMask = mode === "mask" || (mode === "bg" ? false : body.indexOf("currentColor") !== -1);
  const html = iconToHTML(body, {
    ...renderAttribs,
    width: width + "",
    height: height + ""
  });
  const url = svgToURL(html);
  const styles = {
    "--svg": url
  };
  const size = (prop) => {
    const value = renderAttribs[prop];
    if (value) {
      styles[prop] = fixSize(value);
    }
  };
  size("width");
  size("height");
  Object.assign(styles, commonProps, useMask ? monotoneProps : coloredProps);
  let customStyle = "";
  for (const key in styles) {
    customStyle += key + ": " + styles[key] + ";";
  }
  componentProps.style = customStyle + style;
  return {
    svg: false,
    attributes: componentProps
  };
}
allowSimpleNames(true);
setAPIModule("", fetchAPIModule);
if (typeof document !== "undefined" && typeof window !== "undefined") {
  initBrowserStorage();
  const _window2 = window;
  if (_window2.IconifyPreload !== void 0) {
    const preload = _window2.IconifyPreload;
    const err = "Invalid IconifyPreload syntax.";
    if (typeof preload === "object" && preload !== null) {
      (preload instanceof Array ? preload : [preload]).forEach((item) => {
        try {
          if (
            // Check if item is an object and not null/array
            typeof item !== "object" || item === null || item instanceof Array || // Check for 'icons' and 'prefix'
            typeof item.icons !== "object" || typeof item.prefix !== "string" || // Add icon set
            !addCollection(item)
          ) {
            console.error(err);
          }
        } catch (e) {
          console.error(err);
        }
      });
    }
  }
  if (_window2.IconifyProviders !== void 0) {
    const providers = _window2.IconifyProviders;
    if (typeof providers === "object" && providers !== null) {
      for (let key in providers) {
        const err = "IconifyProviders[" + key + "] is invalid.";
        try {
          const value = providers[key];
          if (typeof value !== "object" || !value || value.resources === void 0) {
            continue;
          }
          if (!addAPIProvider(key, value)) {
            console.error(err);
          }
        } catch (e) {
          console.error(err);
        }
      }
    }
  }
}
function checkIconState(icon, state, mounted, callback, onload) {
  if (typeof icon === "object" && icon !== null && typeof icon.body === "string") {
    state.name = "";
    return { data: { ...defaultIconProps, ...icon } };
  }
  let iconName;
  if (typeof icon !== "string" || (iconName = stringToIcon(icon, false, true)) === null) {
    return null;
  }
  const data = getIconData(iconName);
  if (!data) {
    return null;
  }
  if (state.name !== icon) {
    state.name = icon;
    if (onload && !state.destroyed) {
      onload(icon);
    }
  }
  const classes = ["iconify"];
  if (iconName.prefix !== "") {
    classes.push("iconify--" + iconName.prefix);
  }
  if (iconName.provider !== "") {
    classes.push("iconify--" + iconName.provider);
  }
  return { data, classes };
}
function generateIcon(icon, props) {
  return icon ? render({
    ...defaultIconProps,
    ...icon
  }, props) : null;
}
function Icon($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push();
  const state = {
    // Last icon name
    name: "",
    // Loading status
    loading: null,
    // Destroyed status
    destroyed: false
  };
  let mounted = false;
  let data;
  const onLoad = (icon) => {
    if (typeof $$sanitized_props.onLoad === "function") {
      $$sanitized_props.onLoad(icon);
    }
  };
  function loaded() {
  }
  onDestroy(() => {
    state.destroyed = true;
  });
  {
    const iconData = checkIconState($$sanitized_props.icon, state, mounted, loaded, onLoad);
    data = iconData ? generateIcon(iconData.data, $$sanitized_props) : null;
    if (data && iconData.classes) {
      data.attributes["class"] = (typeof $$sanitized_props["class"] === "string" ? $$sanitized_props["class"] + " " : "") + iconData.classes.join(" ");
    }
  }
  $$payload.out += `<!--[-->`;
  if (data) {
    $$payload.out += `<!--[-->`;
    if (data.svg) {
      $$payload.out += `<svg${spread_attributes([data.attributes], false, false)}><!--[-->${data.body}<!--]--></svg>`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += `<span${spread_attributes([data.attributes], true, true)}></span>`;
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  pop();
}
function ButtonLoading($$payload, $$props) {
  push();
  let {
    icon,
    color,
    cmd,
    applyLoading = true,
    classes = "",
    text = ""
  } = $$props;
  $$payload.out += `<button${attr("class", ` ${stringify(classes ?? "")} btn join-item btn-square btn-outline btn-${stringify(color)} btn-sm`, false)}><!--[-->`;
  if (processes.loading && applyLoading) {
    $$payload.out += `<span${attr("class", ` loading loading-spinner loading-xs text-${stringify(color)}`, false)}></span>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += `<!--[-->`;
    Icon($$payload, { icon, class: "text-base" });
    $$payload.out += `<!--]--> ${escape_html(text)}`;
    $$payload.out += "<!--]!-->";
  }
  $$payload.out += `</button>`;
  pop();
}
function storable(data) {
  const store = writable(data);
  const { subscribe, set, update } = store;
  const isBrowser = typeof window !== "undefined";
  isBrowser && localStorage.storable && set(JSON.parse(localStorage.storable));
  return {
    subscribe,
    set: (n) => {
      isBrowser && (localStorage.storable = JSON.stringify(n));
      set(n);
    },
    update: (cb) => {
      const updatedStore = cb(get_store_value(store));
      isBrowser && (localStorage.storable = JSON.stringify(updatedStore));
      set(updatedStore);
    }
  };
}
const pauseBS$ = new BehaviorSubject(true);
const settingsStore = storable({
  showMetrics: true,
  showCPUChart: true,
  refreshProcesses: true,
  refreshTimerSeconds: 5,
  pause: true
});
function AppHeader($$payload, $$props) {
  push();
  var $$store_subs;
  let dialog;
  let pause = store_get($$store_subs ??= {}, "$settingsStore", settingsStore).pause;
  let list = /* @__PURE__ */ (() => {
    return [
      {
        color: "primary",
        icon: "mdi:refresh",
        cmd: async () => {
          await updateProcesses();
        }
      },
      {
        color: "accent",
        icon: !pause ? "mdi:pause" : "mdi:play",
        applyLoading: false,
        cmd: async () => {
          pauseBS$.next(!pauseBS$.value);
        }
      },
      {
        color: "info",
        icon: "mdi:cog",
        applyLoading: false,
        cmd: async () => {
          dialog.showModal();
        }
      }
    ];
  })();
  let currentIndex = 0;
  const each_array = ensure_array_like(list);
  $$payload.out += `<div class="navbar bg-base-100 gap-4 sticky top-0 z-50"><div class="flex flex-row gap-3 items-center m-auto"><div class="m-auto md:text-right"><span class="text-2xl font-bold">Hecate</span></div> <!--[-->`;
  for (let $$index = 0; $$index < each_array.length; $$index++) {
    const item = each_array[$$index];
    $$payload.out += "<!--[-->";
    $$payload.out += `<!--[-->`;
    ButtonLoading($$payload, spread_props([item]));
    $$payload.out += `<!--]-->`;
    $$payload.out += "<!--]-->";
  }
  $$payload.out += "<!--]-->";
  $$payload.out += ` <!--[-->`;
  if (!pause) {
    $$payload.out += `<span class="countdown"><span${attr("style", `--value:${stringify(store_get($$store_subs ??= {}, "$settingsStore", settingsStore).refreshTimerSeconds - currentIndex)};`, false)}></span></span>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  $$payload.out += `</div></div> <dialog id="my_modal_3" class="modal"><div class="modal-box"><form method="dialog"><button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form> <h3 class="font-bold text-lg">Settings</h3> <div class="form-control"><label class="cursor-pointer label w-[200px]"><span class="label-text">Show Cpu Charts</span> <input type="checkbox"${attr("checked", store_get($$store_subs ??= {}, "$settingsStore", settingsStore).showCPUChart, true)} class="checkbox checkbox-success"></label> <label class="cursor-pointer label w-[200px]"><span class="label-text">Show Metrics</span> <input type="checkbox"${attr("checked", store_get($$store_subs ??= {}, "$settingsStore", settingsStore).showMetrics, true)} class="checkbox checkbox-success"></label> <button class="btn btn-accent mt-5">Show All</button></div></div></dialog>`;
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  pop();
}
function LogViewer($$payload, $$props) {
  push();
  let buttons = [
    {
      color: "info",
      cmd: async () => {
        await fetchLogs(processes.selected, 10);
      },
      icon: "",
      text: "10"
    },
    {
      color: "info",
      cmd: async () => {
        await fetchLogs(processes.selected, 100);
      },
      icon: "",
      text: "100"
    },
    {
      color: "info",
      cmd: async () => {
        await fetchLogs(processes.selected, 500);
      },
      icon: "",
      text: "500"
    }
  ];
  $$payload.out += `<!--[-->`;
  if (processes.selected) {
    $$payload.out += `<!--[-->`;
    if (logging.logs) {
      $$payload.out += `<div class="divider flex-auto mt-12"><!--[-->`;
      if (processes.selected) {
        const each_array = ensure_array_like(buttons);
        $$payload.out += `<div class="flex flex-row gap-4 items-center"><div>${escape_html(processes.selected?.name)}</div> <!--[-->`;
        Badge($$payload, { process: processes.selected });
        $$payload.out += `<!--]--></div> <div class="flex flex-row gap-4"><!--[-->`;
        for (let $$index = 0; $$index < each_array.length; $$index++) {
          const button = each_array[$$index];
          $$payload.out += "<!--[-->";
          $$payload.out += `<!--[-->`;
          ButtonLoading($$payload, spread_props([button]));
          $$payload.out += `<!--]-->`;
          $$payload.out += "<!--]-->";
        }
        $$payload.out += "<!--]-->";
        $$payload.out += `</div> <input type="text" placeholder="Type here" class="input input-bordered input-primary w-full max-w-xs"${attr("value", logging.filterText, false)}>`;
        $$payload.out += "<!--]-->";
      } else {
        $$payload.out += "<!--]!-->";
      }
      $$payload.out += `</div> <div class="overflow-x-auto"><!--[-->`;
      if (logging.filteredLogs) {
        const each_array_1 = ensure_array_like(logging.filteredLogs);
        $$payload.out += `<!--[-->`;
        for (let $$index_1 = 0; $$index_1 < each_array_1.length; $$index_1++) {
          const line = each_array_1[$$index_1];
          $$payload.out += "<!--[-->";
          $$payload.out += `<!--[-->`;
          if (typeof line === "object" && typeof line.message !== "undefined") {
            $$payload.out += `<table class="table table-zebra mt-2 table-xs w-full"><tbody><tr class="!max-h-[30px]"><td class="w-[10px] max-h-[30px]"><!--[-->`;
            Icon($$payload, { icon: "radix-icons:dot", class: "text-2xl" });
            $$payload.out += `<!--]--></td><td class="w-[150px]"><div>${escape_html(format(line.timestamp, "dd/MM HH:mm:ss.SSS"))}:</div></td><td${attr("class", line.type == "out" ? "text-info" : "text-error", false)}>${escape_html(line.message)}</td></tr></tbody></table>`;
            $$payload.out += "<!--]-->";
          } else {
            $$payload.out += `<li>${escape_html(line)}</li>`;
            $$payload.out += "<!--]!-->";
          }
          $$payload.out += "<!--]-->";
        }
        $$payload.out += "<!--]-->";
        $$payload.out += "<!--]-->";
      } else {
        $$payload.out += "<!--]!-->";
      }
      $$payload.out += `</div>`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  pop();
}
function ButtonLoadingList($$payload, $$props) {
  push();
  let { process } = $$props;
  let buttonList = (() => {
    let list = [];
    if (process.status == "online" || process.status == "stopping") {
      list.push({
        color: "warning",
        icon: "ic:round-pause",
        cmd: async () => {
          await stopProcess(process);
          processes.selected = process;
        }
      });
    }
    list.push(
      {
        color: process.status == "online" ? "primary" : "success",
        icon: process.status == "online" ? "solar:restart-bold" : "solar:play-bold",
        cmd: async () => {
          await restartProcess(process);
          processes.selected = process;
        }
      },
      {
        color: "info",
        icon: "octicon:log-16",
        cmd: async () => {
          await fetchLogs(process);
          processes.selected = process;
          dialogOpenState.dialogOpen = true;
          dialogOpenState.componentToRender = LogViewer;
        }
      },
      {
        color: "neutral-content",
        icon: "fluent-emoji-high-contrast:toilet",
        cmd: async () => {
          await flushLogs(process);
          processes.selected = process;
        }
      },
      {
        color: "error",
        icon: "solar:trash-bin-trash-broken",
        cmd: async () => {
          await deleteProcess(process);
          processes.selected = process;
        }
      }
    );
    return list.filter(Boolean);
  })();
  const each_array = ensure_array_like(buttonList);
  $$payload.out += `<div class="flex flex-auto gap-5"><!--[-->`;
  for (let $$index = 0; $$index < each_array.length; $$index++) {
    const button = each_array[$$index];
    $$payload.out += "<!--[-->";
    $$payload.out += `<!--[-->`;
    ButtonLoading($$payload, spread_props([button]));
    $$payload.out += `<!--]-->`;
    $$payload.out += "<!--]-->";
  }
  $$payload.out += "<!--]-->";
  $$payload.out += `</div>`;
  pop();
}
function CardProcess($$payload, $$props) {
  push();
  var $$store_subs;
  let { process } = $$props;
  const each_array_1 = ensure_array_like(process.actions);
  $$payload.out += `<div class="card w-96 bg-neutral shadow-xl"><div class="card-body !p-2"><h2 class="card-title mb-1 flex flex-row items-center justify-center"><div>${escape_html(process.name)}</div> <!--[-->`;
  Badge($$payload, { process });
  $$payload.out += `<!--]--> <button class="btn btn-icon-sm btn-ghost"><!--[-->`;
  Icon($$payload, {
    icon: "iconamoon:eye-off",
    class: "text-xl text-accent"
  });
  $$payload.out += `<!--]--></button></h2> <div class="grid grid-cols-3 gap-2 m-auto mb-2"><div class="italic text-xs text-center">Up Time</div> <div class="italic text-xs text-center">Memory</div> <div class="italic text-xs text-center">CPU</div> <div class="text-center">${escape_html(fromMillisecondsToDDHHmmss(process.uptime))}</div> <div class="text-center">${escape_html(fromByteToHuman(Number(process.memory)))}</div> <div class="text-center">${escape_html(process.cpu)}%</div></div> <!--[-->`;
  if (store_get($$store_subs ??= {}, "$settingsStore", settingsStore).showMetrics) {
    $$payload.out += `<div class="grid grid-cols-2 gap-2 items-center m-auto"><!--[-->`;
    if (process.monitor) {
      const each_array = ensure_array_like(Object.entries(process?.monitor).filter(([key, value]) => !ToExludeMonitorKeys.includes(key) && value.value !== void 0).map(([key, value]) => {
        return { key, value: value.value };
      }));
      $$payload.out += `<!--[-->`;
      for (let $$index = 0; $$index < each_array.length; $$index++) {
        const metric = each_array[$$index];
        $$payload.out += "<!--[-->";
        $$payload.out += `<div class="text-xs italic text-left">${escape_html(metric.key)}:</div> <div class="text-left">${escape_html(metric.value)}</div>`;
        $$payload.out += "<!--]-->";
      }
      $$payload.out += "<!--]-->";
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += `</div>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  $$payload.out += ` <div class="card-actions justify-end m-auto !mt-1 !mb-1"><!--[-->`;
  ButtonLoadingList($$payload, { process });
  $$payload.out += `<!--]--></div> <div class="grid grid-cols-3 gap-2 m-auto mb-2"><!--[-->`;
  for (let $$index_1 = 0; $$index_1 < each_array_1.length; $$index_1++) {
    const action = each_array_1[$$index_1];
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center"><button class="btn btn-ghost">${escape_html(action)}</button></div>`;
    $$payload.out += "<!--]-->";
  }
  $$payload.out += "<!--]-->";
  $$payload.out += `</div></div></div>`;
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  pop();
}
const hoveringKey = writable({});
const hoveringValue = writable({});
function LinkedChart($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "uid",
    "data",
    "labels",
    "values",
    "linked",
    "height",
    "width",
    "barMinWidth",
    "barMinHeight",
    "hideBarBelow",
    "grow",
    "align",
    "gap",
    "fill",
    "fadeOpacity",
    "hover",
    "transition",
    "showValue",
    "valueDefault",
    "valuePrepend",
    "valueAppend",
    "valuePosition",
    "valueUndefined",
    "scaleMax",
    "scaleMin",
    "type",
    "lineColor",
    "tabindex",
    "dispatchEvents",
    "preserveAspectRatio",
    "clickHandler"
  ]);
  push();
  var $$store_subs;
  let dataLength, barWidth, highestValue, alignmentOffset, linkedKey;
  let uid = value_or_fallback($$props["uid"], () => (Math.random() + 1).toString(36).substring(7));
  let data = value_or_fallback($$props["data"], () => ({}));
  let labels = value_or_fallback($$props["labels"], () => []);
  let values = value_or_fallback($$props["values"], () => []);
  let linked = value_or_fallback($$props["linked"], () => "");
  let height = value_or_fallback($$props["height"], () => 40);
  let width = value_or_fallback($$props["width"], () => 150);
  let barMinWidth = value_or_fallback($$props["barMinWidth"], () => 4);
  let barMinHeight = value_or_fallback($$props["barMinHeight"], () => 0);
  let hideBarBelow = value_or_fallback($$props["hideBarBelow"], () => 0);
  let grow = value_or_fallback($$props["grow"], () => false);
  let align = value_or_fallback($$props["align"], () => "right");
  let gap = value_or_fallback($$props["gap"], () => 1);
  let fill = value_or_fallback($$props["fill"], () => "#ff3e00");
  let fadeOpacity = value_or_fallback($$props["fadeOpacity"], () => 0.5);
  let hover = value_or_fallback($$props["hover"], () => true);
  let transition = value_or_fallback($$props["transition"], () => 0);
  let showValue = value_or_fallback($$props["showValue"], () => false);
  let valueDefault = value_or_fallback($$props["valueDefault"], () => "&nbsp;");
  let valuePrepend = value_or_fallback($$props["valuePrepend"], () => "");
  let valueAppend = value_or_fallback($$props["valueAppend"], () => "");
  let valuePosition = value_or_fallback($$props["valuePosition"], () => "static");
  let valueUndefined = value_or_fallback($$props["valueUndefined"], () => 0);
  let scaleMax = value_or_fallback($$props["scaleMax"], () => 0);
  let scaleMin = value_or_fallback($$props["scaleMin"], () => 0);
  let type = value_or_fallback($$props["type"], () => "bar");
  let lineColor = value_or_fallback($$props["lineColor"], () => fill);
  let tabindex = value_or_fallback($$props["tabindex"], () => -1);
  let dispatchEvents = value_or_fallback($$props["dispatchEvents"], () => false);
  let preserveAspectRatio = value_or_fallback($$props["preserveAspectRatio"], () => false);
  let clickHandler = value_or_fallback($$props["clickHandler"], () => (key, i) => null);
  const dispatch = createEventDispatcher();
  let valuePositionOffset = 0;
  let polyline = [];
  let valueElement;
  function getHighestValue() {
    if (scaleMax)
      return scaleMax;
    if (dataLength)
      return Math.max(...Object.values(data));
    return 0;
  }
  function getHeight(value) {
    if (value < hideBarBelow || value < scaleMin)
      return 0;
    const maxValue = scaleMax || highestValue;
    const minValue = scaleMin || 0;
    const scaledValue = (value - minValue) / (maxValue - minValue);
    return Math.max(Math.ceil(scaledValue * parseInt(height)), barMinHeight);
  }
  function getBarWidth() {
    return Math.max((parseInt(width) - dataLength * parseInt(gap)) / dataLength, parseInt(barMinWidth));
  }
  function getAlignment() {
    if (align == "left")
      return 0;
    return parseInt(gap) + parseInt(width) - (parseInt(gap) + barWidth) * dataLength;
  }
  function getPolyLinePoints() {
    let points = [];
    for (let i = 0; i < Object.keys(data).length; i++) {
      points.push([
        i * (barWidth + parseInt(gap) + barWidth / Object.keys(data).length),
        height - getHeight(Object.values(data)[i])
      ]);
    }
    return points;
  }
  if (labels.length && values.length)
    data = Object.fromEntries(labels.map((_, i) => [labels[i], values[i]]));
  dataLength = Object.keys(data).length;
  barWidth = grow ? getBarWidth() : parseInt(barMinWidth);
  highestValue = getHighestValue();
  alignmentOffset = dataLength ? getAlignment() : 0;
  linkedKey = linked || (Math.random() + 1).toString(36).substring(7);
  mutate_store($$store_subs ??= {}, "$hoveringValue", hoveringValue, store_get($$store_subs ??= {}, "$hoveringValue", hoveringValue)[uid] = store_get($$store_subs ??= {}, "$hoveringKey", hoveringKey)[linkedKey] ? data[store_get($$store_subs ??= {}, "$hoveringKey", hoveringKey)[linkedKey]] : null);
  if (valuePosition == "floating")
    valuePositionOffset = (parseInt(gap) + barWidth) * Object.keys(data).indexOf(store_get($$store_subs ??= {}, "$hoveringKey", hoveringKey)[linkedKey]) + alignmentOffset;
  if (type == "line")
    polyline = getPolyLinePoints();
  if (dispatchEvents)
    dispatch("value-update", {
      value: store_get($$store_subs ??= {}, "$hoveringValue", hoveringValue)[uid],
      uid,
      linkedKey,
      valueElement
    });
  if (tabindex > 0)
    console.warn("Tabindex should not be higher than 0");
  const each_array = ensure_array_like(Object.entries(data));
  $$payload.out += `<svg${spread_attributes(
    [
      { "width": width },
      {
        "height": type == "line" ? height + barWidth / 2 : height
      },
      {
        "viewBox": `0 0 ${stringify(width)} ${stringify(height)}`
      },
      {
        "preserveAspectRatio": preserveAspectRatio ? "true" : "none"
      },
      $$restProps
    ],
    false,
    false
  )}><g${attr("transform", `translate(${stringify(alignmentOffset)}, 0)`, false)}><!--[-->`;
  if (type == "line") {
    $$payload.out += `<polyline${attr("points", polyline.join(" "), false)}${attr("stroke", lineColor, false)} fill="transparent"></polyline>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  $$payload.out += `<!--[-->`;
  for (let i = 0; i < each_array.length; i++) {
    const $$item = each_array[i];
    const [key, value] = $$item;
    $$payload.out += "<!--[-->";
    $$payload.out += `<!--[-->`;
    if (type == "bar") {
      $$payload.out += `<rect${attr("style", transition ? `transition: all ${transition}ms` : null, false)}${attr("opacity", hover && store_get($$store_subs ??= {}, "$hoveringKey", hoveringKey)[linkedKey] && store_get($$store_subs ??= {}, "$hoveringKey", hoveringKey)[linkedKey] != key ? fadeOpacity : 1, false)}${attr("fill", fill, false)}${attr("width", barWidth, false)}${attr("height", type == "line" ? height : getHeight(value), false)}${attr("x", (parseInt(gap) + barWidth) * i, false)}${attr("y", height - getHeight(value), false)}></rect>`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += `<!--[-->`;
      if (type == "line") {
        $$payload.out += `<circle${attr("fill", hover && store_get($$store_subs ??= {}, "$hoveringKey", hoveringKey)[linkedKey] !== null && store_get($$store_subs ??= {}, "$hoveringKey", hoveringKey)[linkedKey] == key ? fill : "transparent", false)}${attr("r", grow ? parseInt(barMinWidth) : barWidth / 2, false)}${attr("cy", height - getHeight(value), false)}${attr("cx", (parseInt(gap) + barWidth + barWidth / Object.keys(data).length) * i, false)}></circle>`;
        $$payload.out += "<!--]-->";
      } else {
        $$payload.out += "<!--]!-->";
      }
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += `<rect${attr("width", barWidth, false)}${attr("height", height, false)} fill="transparent"${attr("x", (parseInt(gap) + barWidth) * i, false)}${attr("tabindex", tabindex, false)}></rect>`;
    $$payload.out += "<!--]-->";
  }
  $$payload.out += "<!--]-->";
  $$payload.out += `</g></svg> <!--[-->`;
  if (showValue && (store_get($$store_subs ??= {}, "$hoveringValue", hoveringValue)[uid] || valueDefault)) {
    $$payload.out += `<div class="tiny-linked-charts-value"${attr("style", valuePosition == "floating" ? `position: absolute; transform: translateX(${valuePositionOffset}px)` : null, false)}><!--[-->`;
    if (store_get($$store_subs ??= {}, "$hoveringValue", hoveringValue)[uid] !== null) {
      $$payload.out += `${escape_html(valuePrepend)} <span>${escape_html(store_get($$store_subs ??= {}, "$hoveringValue", hoveringValue)[uid] || valueUndefined)}</span> ${escape_html(valueAppend)}`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += `<!--[-->${valueDefault}<!--]-->`;
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += `</div>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  bind_props($$props, {
    uid,
    data,
    labels,
    values,
    linked,
    height,
    width,
    barMinWidth,
    barMinHeight,
    hideBarBelow,
    grow,
    align,
    gap,
    fill,
    fadeOpacity,
    hover,
    transition,
    showValue,
    valueDefault,
    valuePrepend,
    valueAppend,
    valuePosition,
    valueUndefined,
    scaleMax,
    scaleMin,
    type,
    lineColor,
    tabindex,
    dispatchEvents,
    preserveAspectRatio,
    clickHandler
  });
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let processUI = (() => {
    if (!processes.data || !processInfos.data)
      return [];
    return processes.data.map((pro) => {
      return {
        ...processInfos.data.find((p) => p.name == pro.name),
        ...pro
      };
    }).filter((p) => p.show);
  })();
  head($$payload, ($$payload2) => {
    $$payload2.title = "<title>";
    $$payload2.title += `Hecate</title>`;
  });
  $$payload.out += `<!--[-->`;
  AppHeader($$payload);
  $$payload.out += `<!--]--> <!--[-->`;
  if (processUI && processUI.length > 0) {
    const each_array = ensure_array_like(processUI);
    const each_array_1 = ensure_array_like(processUI);
    $$payload.out += `<div class="flex flex-wrap md:hidden justify-center gap-5 mt-5"><!--[-->`;
    for (let $$index = 0; $$index < each_array.length; $$index++) {
      const process = each_array[$$index];
      $$payload.out += "<!--[-->";
      $$payload.out += `<!--[-->`;
      CardProcess($$payload, { process });
      $$payload.out += `<!--]-->`;
      $$payload.out += "<!--]-->";
    }
    $$payload.out += "<!--]-->";
    $$payload.out += `</div> <div class="text-center m-auto"><div class="hidden md:flex"><table class="table table-zebra" style="" id="tableproc"><thead><tr><th class="text-accent">ID</th><th class="text-accent">Process Name</th><th class="text-accent">PID</th><th class="text-accent">Status</th><th class="text-accent">Uptime</th><th class="text-accent">Memory</th><th class="text-accent">CPU</th><!--[-->`;
    if (store_get($$store_subs ??= {}, "$settingsStore", settingsStore).showCPUChart) {
      $$payload.out += `<th class="text-accent"></th>`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += `<th class="text-accent">Istances</th><th class="text-accent">IP</th><th class="text-accent">Actions</th><!--[-->`;
    if (store_get($$store_subs ??= {}, "$settingsStore", settingsStore).showCPUChart) {
      $$payload.out += `<th class="text-accent">Metrics</th>`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += `</tr></thead><tbody><!--[-->`;
    for (let $$index_2 = 0; $$index_2 < each_array_1.length; $$index_2++) {
      const process = each_array_1[$$index_2];
      $$payload.out += "<!--[-->";
      $$payload.out += `<tr><td>${escape_html(process.pm_id)}</td><td class="text-secondary font-semibold">${escape_html(process.name)} <button class="btn btn-icon-sm btn-ghost"><!--[-->`;
      Icon($$payload, {
        icon: "iconamoon:eye-off",
        class: "text-xl text-accent"
      });
      $$payload.out += `<!--]--></button></td><td>${escape_html(process.pid)}</td><td><!--[-->`;
      Badge($$payload, { process });
      $$payload.out += `<!--]--></td><td>${escape_html(fromMillisecondsToDDHHmmss(process.uptime))}</td><td>${escape_html(fromByteToHuman(Number(process.memory)))}</td><td>${escape_html(process.cpu)}%</td><td>${escape_html(process.istances)}</td><td>${escape_html(process.ip)}
								${escape_html(chartDataStore.find((c) => c.name == process.name)?.cpus.length ?? 0)}</td><!--[-->`;
      if (store_get($$store_subs ??= {}, "$settingsStore", settingsStore).showCPUChart) {
        $$payload.out += `<td><!--[-->`;
        LinkedChart($$payload, {
          linked: "link-1",
          labels: chartDataStore.find((c) => c.name == process.name)?.cpus.map((c, i) => i),
          values: chartDataStore.find((c) => c.name == process.name)?.cpus
        });
        $$payload.out += `<!--]--></td>`;
        $$payload.out += "<!--]-->";
      } else {
        $$payload.out += "<!--]!-->";
      }
      $$payload.out += `<td><!--[-->`;
      ButtonLoadingList($$payload, { process });
      $$payload.out += `<!--]--></td><!--[-->`;
      if (store_get($$store_subs ??= {}, "$settingsStore", settingsStore).showMetrics) {
        $$payload.out += `<td class="grid grid-cols-2 gap-1 items-center"><!--[-->`;
        if (process.monitor) {
          const each_array_2 = ensure_array_like(Object.entries(process?.monitor).filter(([key, value]) => !ToExludeMonitorKeys.includes(key) && value.value !== void 0).map(([key, value]) => {
            return { key, value: value.value };
          }));
          $$payload.out += `<!--[-->`;
          for (let $$index_1 = 0; $$index_1 < each_array_2.length; $$index_1++) {
            const metric = each_array_2[$$index_1];
            $$payload.out += "<!--[-->";
            $$payload.out += `<div class="text-xs italic text-left">${escape_html(metric.key)}:</div> <div class="text-left">${escape_html(metric.value)}</div>`;
            $$payload.out += "<!--]-->";
          }
          $$payload.out += "<!--]-->";
          $$payload.out += "<!--]-->";
        } else {
          $$payload.out += "<!--]!-->";
        }
        $$payload.out += `</td>`;
        $$payload.out += "<!--]-->";
      } else {
        $$payload.out += "<!--]!-->";
      }
      $$payload.out += `</tr>`;
      $$payload.out += "<!--]-->";
    }
    $$payload.out += "<!--]-->";
    $$payload.out += `</tbody></table></div></div>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += `<p>No processes found</p>`;
    $$payload.out += "<!--]!-->";
  }
  $$payload.out += ` <div class="h-[100px]"></div>`;
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BeBTWCcw.js.map
