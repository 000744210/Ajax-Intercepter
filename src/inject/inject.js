
/*chrome.storage.local.get(["domainGroupData"], function (result) {

    domains = result['domainGroupData'] || {}
    Object.entries(domains).forEach((entry) => {
        var id = entry[0];
        var ajax = entry[1];
        var url = ajax.url;

        if (ajax.isRunning && window.location.hostname.endsWith(url)) {
            console.log("Started Injection")
            var docs = document.querySelectorAll("iframe").map(x=>x.contentWindow.document)
            docs.push(document);

            docs.forEach(function(doc){
                
                chrome.storage.local.get(["ajaxGroupData" + id], function (result) {
                    var urls = result['ajaxGroupData' + id] || {};
                    s = doc.createElement('script');
                    s.innerHTML = "var _FILTER_URLS = " + JSON.stringify(urls);

                    (doc.head || doc.documentElement).appendChild(s);
                })

                s = doc.createElement('script');
                s.src = chrome.runtime.getURL('/js/sweetalert2.js');
                s.onload = function () {
                    this.remove();
                };
                (doc.head || doc.documentElement).appendChild(s);

                s = doc.createElement('script');
                s.src = chrome.runtime.getURL('src/inject/injected.js');
                s.onload = function () {
                    this.remove();
                };
                (doc.head || doc.documentElement).appendChild(s);

                var logger = doc.createElement("logger")
                doc.documentElement.appendChild(logger);

                // Listens for when a new api object gets inserted into the logger object.
                // This would have been better as a onunload event but due to how async code can't be ran in there we had to do this.
                logger.addEventListener( 'DOMNodeInserted',function(e){

                    var apis = doc.querySelectorAll("html > logger > api");
                    var apiUrls = []
                    apis.forEach(api => apiUrls.push({url: api.dataset.url,params:api.dataset.params.split(",")}))
                
                    
                    chrome.storage.local.get(["ajaxLoggerData" + id], function (result) {
                        var loggedAPIs = result['ajaxLoggerData' + id] || {};
                        
                        //var apiSet = new Set(loggedAPIs);
                        apiUrls.forEach(function(api){ 
                            loggedAPIs[api.url] = new Set(loggedAPIs[api.url])
                            api.params.forEach(function(param){
                                if(param.length > 0){
                                    loggedAPIs[api.url].add(param)
                                }
                            });
                            loggedAPIs[api.url] = [...loggedAPIs[api.url]]
                        });
                        
                        
                        var jsonObj = {}
                        jsonObj["ajaxLoggerData" + id] = loggedAPIs;
                        
                        chrome.storage.local.set(jsonObj);
                    })                
                });
            })
        }else{
            console.log(window.location.hostname + " does not end with " + url)
        }
    })
})
*/

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

chrome.storage.local.get(["domainGroupData"], function (result) {

    domains = result['domainGroupData'] || {}
    Object.entries(domains).forEach((entry) => {
        var id = entry[0];
        var ajax = entry[1];
        var url = ajax.url;

        if (ajax.isRunning && window.location.hostname.endsWith(url)) {
            console.log("Started Injection")
            chrome.storage.local.get(["ajaxGroupData" + id], function (result) {
                var urls = result['ajaxGroupData' + id] || {};
                s = document.createElement('script');
                s.innerHTML = "var _FILTER_URLS = " + JSON.stringify(urls);

                (document.head || document.documentElement).appendChild(s);
                
                var libSet = new Set();
                for(let groupId in urls){
                    urls[groupId].libs.split("\n").forEach(function(lib){
                        
                        lib = lib.trim();
                        if(lib.length>1){
                            libSet.add(lib);
                        }
                    })
                    
                }
                console.log(libSet)
                libSet.forEach(function(libUrl){
                    var script = document.createElement('script');
                    script.setAttribute("type", "text/javascript");
                    script.onload = function () {
                        console.log("loaded",script);
                        this.remove();
                    };
                    script.src = libUrl;
                   
                    (document.head || document.documentElement).appendChild(script);
                })
                
            })
            
            s = document.createElement('script');
            s.src = chrome.runtime.getURL('/js/sweetalert2.js');
            s.onload = function () {
                this.remove();
            };
            (document.head || document.documentElement).appendChild(s);

            s = document.createElement('script');
            s.src = chrome.runtime.getURL('src/inject/injected.js');
            s.onload = function () {
                this.remove();
            };
            (document.head || document.documentElement).appendChild(s);

            var logger = document.createElement("logger")
            document.documentElement.appendChild(logger);

            // Listens for when a new api object gets inserted into the logger object.
            // This would have been better as a onunload event but due to how async code can't be ran in there we had to do this.
            logger.addEventListener( 'DOMNodeInserted',function(e){

                var apis = document.querySelectorAll("html > logger > api");
                var apiUrls = []
                apis.forEach(api => apiUrls.push({url: api.dataset.url,params:api.dataset.params.split(",")}))
            
                
                chrome.storage.local.get(["ajaxLoggerData" + id], function (result) {
                    var loggedAPIs = result['ajaxLoggerData' + id] || {};
                    
                    //var apiSet = new Set(loggedAPIs);
                    apiUrls.forEach(function(api){ 
                        if(validURL(api.url)){
                            loggedAPIs[api.url] = new Set(loggedAPIs[api.url])
                            api.params.forEach(function(param){
                                if(param.length > 0){
                                    loggedAPIs[api.url].add(param)
                                }
                            });
                            loggedAPIs[api.url] = [...loggedAPIs[api.url]]
                        }
                    });
                    
                    
                    var jsonObj = {}
                    jsonObj["ajaxLoggerData" + id] = loggedAPIs;
                    
                    chrome.storage.local.set(jsonObj);
                })                
            });
        }else{
            console.log(window.location.hostname + " does not end with " + url)
        }
    })
})