import browser from "webextension-polyfill";

console.log("hello")
/*
chrome.runtime.onInstalled.addListener(async () => {
    //@ts-ignore
    const old = await chrome.scripting.getRegisteredContentScripts();
    //@ts-ignore
    if (old[0]) await chrome.scripting.unregisterContentScripts({ids: old.map(s => s.id)});
    //@ts-ignore
    await chrome.scripting.registerContentScripts([{
      id: 'inject',
      js: ['./content-scripts/inject.js'],
      runAt: 'document_start',*/
      //matches: ['*://*/*']
 //   }]);
 // });

import { createPinia } from "pinia";
import { useDomainsStore } from "../store/domains";
import { useDomainUrlsStore } from "../store/domainUrls";
import externFunc from "./executeScript";
import {parse} from 'tldts';
const pinia = createPinia();
console.log(browser)

browser.webNavigation.onBeforeNavigate.addListener((e:any)=>{
  // this is required. 
  // Chrome had this amazing idea to make extensions go to sleep seconds after code stops running.
  // This means all the code has to be re-ran each time it needs to be woken up.
  // chrome.webNavigation.onCommitted was not being listened to quick enough resulting in the page reload not being detected.
  // This event will wake the webworker up to have enough time to listen for the onCommitted events.
});

const domains = useDomainsStore(pinia)
const domainUrls = useDomainUrlsStore(pinia)




browser.webNavigation.onCommitted.addListener((details:any) => {
  console.log("details",details)
  //@ts-ignore
  //if (["reload", "link", "typed", "generated"].includes(details.transitionType)) {
    let matchingDomain = findMatchingDomain(domains.domains,details.url)
    if(matchingDomain && matchingDomain.isRunning){
      let urlsToIntercept = domainUrls.domainUrls.filter((domainUrl:any)=>domainUrl.domainId == matchingDomain.id && domainUrl.isRunning)
      
      //if(urlsToIntercept.length > 0){
        executeFunctionOnPage(details.tabId,externFunc,urlsToIntercept,matchingDomain.id)
      //}
    }
  //}
});

function executeFunctionOnPage(tabId:number, func:Function,arg:any,domainId:number){
  let isFireFox = navigator.userAgent.toLowerCase().includes('firefox')
  // firefox uses mv2 code while chrome uses mv3
  if(isFireFox){

    browser.tabs.executeScript(
      tabId,
      {
        allFrames:true,
        runAt:"document_start",
        // hacky way to replicate injecting into the world:"MAIN" that firefox does not currently support.
        // how this works:
        // externFunc.toString will be "e=>{/* code */}"
        // I wrap that string with (e=>{/* code */})(parameters_to_pass)
        // now that string code will be executed with parameters passed
        // when it is injected into a script tag to bypass the sandbox code execution.
        // some string escaping is required to make it work correctly.

        code:`script = document.createElement("script");
        script.textContent = '(${externFunc.toString()
          .replace(/\\/g,"\\\\")
          .replace(/\n/g,"\\n")
          .replace(/\t/g,"\\t")
          //.replace(/\b/g,"\\b")
          //.replace(/\f/g,"\\f")
          .replace(/\r/g,"\\r")
          //.replace(/\v/g,"\\v")
          .replace(/'/g,"\\'")
          .replace(/\"/g,'\\"') })(JSON.parse(unescape("${escape(JSON.stringify(arg))}")),${domainId})';
        (document.getElementsByTagName('head')[0] || document.body).appendChild(script);`
      })
      
  }else{
    browser.scripting.executeScript({
      target: {
        allFrames:true,
        tabId: tabId
      },

      args:[arg,domainId],
      //@ts-ignore
      world:"MAIN", // makes it run in the webpage scope instead of an isolated scope.
      //@ts-ignore
      injectImmediately:true,
      func: externFunc,
  })
  }

}


function findMatchingDomain(domains:any, urlToMatch:any){
  let urlInfo = parse(urlToMatch)
    
  for(let domain of domains){
    if(urlInfo.hostname?.endsWith(domain.url)){
      console.log(`'${urlInfo.hostname}' ends with '${domain.url}'`)
      return domain
    }else{
      console.log(`'${urlInfo.hostname}' does not end with '${domain.url}'`)
    }
  }
}