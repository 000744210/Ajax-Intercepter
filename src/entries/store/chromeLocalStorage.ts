// Creates a simulated localStorage with chrome.storage.local
// This is provided to UseStorageAsync
// UseStorageAsync exported from @vueuse/core
//@ts-nocheck
import browser from "webextension-polyfill";
import {toValue,watchWithFilter,isClient, get} from '@vueuse/shared';
import {shallowRef,ref} from 'vue-demi'
const defaultWindow = isClient ? window : void 0;
let chromeLocalStorage = {
  getItem: function (k) {
    
    return new Promise((resolve) => {
      browser.storage.local.get([k]).then((result) => {
        console.log("result",result)
        resolve(result[k]);
      });
    });
  },

  setItem: function (k, v) {
    let obj = {};
    obj[k] = v;
    console.log("setting",k,v)
    browser.storage.local.set(obj);
  },
};



function useStorageAsync(key, initialValue, storage, options = {}) {
  var _a;
  
  const {//@ts-ignore
    flush = "pre",//@ts-ignore
    deep = true,//@ts-ignore
    listenToStorageChanges = true,//@ts-ignore
    writeDefaults = false,//@ts-ignore
    mergeDefaults = false,//@ts-ignore
    shallow,//@ts-ignore
    window = defaultWindow, //@ts-ignore
    eventFilter,//@ts-ignore
    onError = (e) => {
      console.error(e);
    }
  } = options;
  const rawInit = toValue(initialValue);
  const type = guessSerializerType(rawInit);
  const data = (shallow ? shallowRef : ref)(initialValue);
  let canSave = false
  //@ts-ignore
  const serializer = (_a = options.serializer) != null ? _a : StorageSerializers[type];
  let lastSerialized = serializer.write(data.value)
  if (!storage) {
    // storage will always be provided
    /*try {
      storage = getSSRHandler("getDefaultStorage", () => {
        var _a2;
        return (_a2 = defaultWindow) == null ? void 0 : _a2.localStorage;
      })();
    } catch (e) {
      onError(e);
    }*/
  }
  async function read(event) {
    if (!storage || event && event.key !== key)
      return;
    try {
      const rawValue = event ? event.newValue : await storage.getItem(key);
      if (rawValue == null) {
        lastSerialized = rawInit
        data.value = rawInit;        
        if (writeDefaults && rawInit !== null)
          console.log('setItem from writeDefaults')
          await storage.setItem(key, await serializer.write(rawInit));
      } else if (mergeDefaults) {
        const value = await serializer.read(rawValue);
        if (typeof mergeDefaults === "function")
          data.value = mergeDefaults(value, rawInit);
        else if (type === "object" && !Array.isArray(value))
          data.value = __spreadValues$4(__spreadValues$4({}, rawInit), value);
        else
          data.value = value;
      } else {
        lastSerialized = rawValue
        data.value = await serializer.read(rawValue);
      }
    } catch (e) {
      onError(e);
    }
  }
  //@ts-ignore
  read().then(()=>{canSave = true /* prevents wiping data if we write to the storage before we load in the data */});

  if (listenToStorageChanges)
    //useEventListener(window, "storage", (e) => Promise.resolve().then(() => read(e)));
    browser.storage.onChanged.addListener((keys,areaName)=>{
      
      if(keys[key] && areaName == "local" && keys[key].oldValue != keys[key].newValue){
        console.log("storage Update",keys,areaName)
        read({key:key,newValue:keys[key].newValue})
      }
    })
  if (storage ) {
    watchWithFilter(
      data,
      async () => {
        try {
          if (data.value == null)
            await storage.removeItem(key);
          else{
            
            let serialized = await serializer.write(data.value)
            if(serialized!=lastSerialized && canSave){
              
              console.log(lastSerialized,serialized)
              await storage.setItem(key,serialized);
            }
            lastSerialized = serialized
          }
        } catch (e) {
          onError(e);
        }
      },
      {
        flush,
        deep,
        eventFilter
      }
    );
  }
  return data;
}

var __defProp$4 = Object.defineProperty;
var __getOwnPropSymbols$4 = Object.getOwnPropertySymbols;
var __hasOwnProp$4 = Object.prototype.hasOwnProperty;
var __propIsEnum$4 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$4 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$4.call(b, prop))
      __defNormalProp$4(a, prop, b[prop]);
  if (__getOwnPropSymbols$4)
    //@ts-ignore
    for (var prop of __getOwnPropSymbols$4(b)) {
      if (__propIsEnum$4.call(b, prop))
        __defNormalProp$4(a, prop, b[prop]);
    }
  return a;
};

const StorageSerializers = {
  boolean: {
    read: (v) => v === "true",
    write: (v) => String(v)
  },
  object: {
    read: (v) => JSON.parse(v),
    write: (v) => JSON.stringify(v)
  },
  number: {
    read: (v) => Number.parseFloat(v),
    write: (v) => String(v)
  },
  any: {
    read: (v) => v,
    write: (v) => String(v)
  },
  string: {
    read: (v) => v,
    write: (v) => String(v)
  },
  map: {
    read: (v) => new Map(JSON.parse(v)),
    write: (v) => JSON.stringify(Array.from(v.entries()))
  },
  set: {
    read: (v) => new Set(JSON.parse(v)),
    write: (v) => JSON.stringify(Array.from(v))
  },
  date: {
    read: (v) => new Date(v),
    write: (v) => v.toISOString()
  }
};

function guessSerializerType(rawInit) {
  return rawInit == null ? "any" : rawInit instanceof Set ? "set" : rawInit instanceof Map ? "map" : rawInit instanceof Date ? "date" : typeof rawInit === "boolean" ? "boolean" : typeof rawInit === "string" ? "string" : typeof rawInit === "object" ? "object" : !Number.isNaN(rawInit) ? "number" : "any";
}



export default {chromeLocalStorage, useStorageAsync}