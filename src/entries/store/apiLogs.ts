// store/apiLogs.ts
import { defineStore } from 'pinia'
import storageManager from './chromeLocalStorage'

interface APIInfo{
  domainId:string;
  id:string;
  url:string;
  params:Array<string>
}

// Does a wild card regex comparison to validate if they match.
// wildTest("google.com/search/*/","google.com/search/2346/") -> true
// This implementation of wildcard search is different than the traditional implementation.
// Normally It works like this: wildTest("google.com/search/*","google.com/search/2346/word") -> true
// But in my impelementation the * only reads up to a / eg, .* -> [^/]* so in the case above would return false.
// To get the initial implementation you can use **
function wildTest(wildcard:string, str:string):boolean {
	let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\/$/,''); 
  let mapObj = {
       "**":".*",
       "*":"[^/]*",
       "?":"."
    };
  let regx = w.replace(/\*\*|\*|\?/g, function(matched:string){
    //@ts-ignore
    return mapObj[matched];
  });
	const re = new RegExp(`^${regx}/?$`, 'i');
	return re.test(str); // remove last 'i' above to have case sensitive
}

export const useApiLogsStore = defineStore('apiLogs', {
  state: () => {
    return { 
      apiLogs: storageManager.useStorageAsync('apiLogs', [] as unknown, storageManager.chromeLocalStorage) as Array<APIInfo>
    }
  },
  getters:{
    getByDomainId: (state) => (id: string) => state.apiLogs.find((api) => api.domainId === id),
  },
  actions: {
    deleteLog(id: string) {
      this.apiLogs = this.apiLogs.filter((api)=>{
        return api.id !== id
      })

    },
    groupBy(domainId:string,wildcard:string){
      let newApiLog = []
      let toBeGrouped = []
      console.log("begin groupBy")
      for(let log of this.apiLogs){
        console.log(log.domainId, domainId,wildcard,log.url,wildTest(wildcard,log.url))
        if(log.domainId == domainId && wildTest(wildcard,log.url)){
          toBeGrouped.push(log)
          console.log("toBeGrouped")
        }else{
          newApiLog.push(log)
          console.log("newApiLog")
        }
      }
      console.log("tobegrouped final",toBeGrouped)
      if(toBeGrouped.length > 0){

        let params = toBeGrouped.map(u=>u.params)
        let groupedParams = [...(new Set(params.flat()))]
        console.log("params",groupedParams)
        newApiLog.push({
          domainId,
          url:wildcard,
          params:groupedParams,
          id:Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString()
        })
      }

      this.apiLogs = newApiLog
    },
    logBatch(domainId:string,batch:Array<{url:string,params:Array<string>}>){
      let apis = []

      for(let data of batch){
        if(data.url && data.params && Array.isArray(data.params)){
          let apiExists = this.apiLogs.find((api:APIInfo)=>api.domainId === domainId && wildTest(api.url, data.url))
          if(apiExists){
            let paramSet = new Set([...apiExists.params, ...data.params])
            let newParams = [...paramSet]
            apiExists.params = newParams
          }else{
            apis.push({
              domainId,
              url:data.url,
              params:data.params,
              id:Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString()
            })
          }
        }
      }
      this.apiLogs.push(...apis)

    },
    log(domainId:string, url:string, params:Array<string>){
      let apiExists = this.apiLogs.find((api:APIInfo)=>api.domainId === domainId && wildTest(api.url, url))

      if(apiExists){
        // we keep track of new api params that came our way.
        let paramSet = new Set([...apiExists.params, ...params])
        let newParams = [...paramSet]
        apiExists.params = newParams
      }else{
        this.apiLogs.push({
          domainId,
          url,
          params,
          id:Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString()
        })
      }

    },
  },

})
