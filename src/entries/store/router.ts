// store/router.ts
import { defineStore } from 'pinia'
import getPage from '../pages'

export const useRouterStore = defineStore('router', {
  state: () => {
    return { 
      pageTemplate: null as any,
      templateBindings: {} as any,
      history: [] as Array<{pageName:string,templateBindings:object}>
    }
  },

  actions: {
    async renderPage(pageName:string, templateBindings:object) {
      let pageTemplate = getPage(pageName)

      pageTemplate = (await pageTemplate).default

      this.pageTemplate = pageTemplate
      this.templateBindings = templateBindings
      
      this.history.push({
        pageName,templateBindings
      })
    },
    back(){
      this.history.pop()
      if(this.history.length > 0){
        let lastHistory = this.history.pop()
        if(lastHistory){
          this.renderPage(lastHistory.pageName, lastHistory.templateBindings)
        }
      }else{
        this.renderPage("Home",{})
      }
    }
  },
})