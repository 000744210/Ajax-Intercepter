// store/domains.ts

import { defineStore } from "pinia";
import storageManager from "./chromeLocalStorage"
//import { useStorage } from '@vueuse/core'

interface UrlInfo{
  url:string,
  code:string,
  isRunning: boolean,
  domainId:string,
  id: string,
}

export const useDomainUrlsStore = defineStore("domainUrls", {
  state: () => {
    return {
      domainUrls: storageManager.useStorageAsync('domainUrls', [] as unknown,storageManager.chromeLocalStorage) as Array<UrlInfo>
    };
  },
  getters: {
    getById: (state) => (id: string) =>
      state.domainUrls.find((domain) => domain.id === id),
    getByDomainId: (state) => (id: string) =>
      state.domainUrls.find((domain) => domain.domainId === id),
  },
  actions: {
    addDomainUrl(url: string, code: string, domainId: string) {
      let doesUrlExistAlready = this.domainUrls.find(
        (domain) => domain.url === url && domain.domainId == domainId
      );
      if (doesUrlExistAlready) {
        alert("Url already exists");
      } else {
        //@ts-ignore
        this.domainUrls.push({
          url,
          code,
          isRunning: true,
          domainId,
          id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(),
        });
      }
    },
    updateDomainUrl(id: string, url:string, code: string) {
      let domainUrl = this.domainUrls.find((domain) => domain.id === id);
      if(domainUrl){
        domainUrl.url = url;
        domainUrl.code = code;
      }
    },
    deleteDomainUrl(id: string) {
      this.domainUrls = this.domainUrls.filter((domain) => {
        return domain.id !== id;
      });
    },
    setRunningState(id: string, runState: boolean) {
      let result = this.domainUrls.find((domain) => domain.id === id)
      if(result) result.isRunning = runState;
    },
  },
});
