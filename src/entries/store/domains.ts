// store/domains.ts

import { defineStore } from 'pinia'
import storageManager from './chromeLocalStorage'

interface DomainInfo{
  url: string,
  displayName: string,
  isRunning: boolean,
  id: string
}

export const useDomainsStore = defineStore('domains', {
  state: () => {
    return { 
      // @ts-ignore
      domains: storageManager.useStorageAsync('domains', [] as unknown,storageManager.chromeLocalStorage) as Array<DomainInfo>
    }
  },
  actions: {
    addDomain(url:string,displayName:string){
      let doesUrlExistAlready = this.domains.find((domain)=>domain.url === url)
      if(doesUrlExistAlready){
        alert("Domain already exists")
      }else{
        this.domains.push({
          url: url,
          displayName: displayName,
          isRunning: false,
          id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString()
        })
      }
    },
    deleteDomain(id:string){
      this.domains = this.domains.filter((domain:any)=>{
        return domain.id !== id
      })
    },
    setRunningState(id:string,runState:boolean){
      let result = this.domains.find((domain)=>domain.id === id)
      if(result) result.isRunning = runState
    }
  },

})
