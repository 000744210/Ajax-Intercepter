// To resolve circular dependencies; We have to use this to load pages 

const pageRouter = {
    CreateDomain:()=>import("./CreateDomain.vue"),
    EditDomain:()=>import("./EditDomain.vue"),
    CreateDomainUrl:()=>import("./CreateDomainUrl.vue"),
    Home:()=>import("./Home.vue"),
    LogViewer:()=>import("./LogViewer.vue"),    
    GroupUrls:()=>import("./GroupUrls.vue"),  
}   

function getPage(pageName:string){
    //@ts-ignore
    return pageRouter[pageName]()
}

export default getPage