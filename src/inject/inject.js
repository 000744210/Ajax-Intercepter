function validURL(str) {
  // https://regexr.com/58mu8 add test case when it thinks it found a broken api url.
  var pattern = new RegExp(/^(([^:\/<>?#]+:)(?:\/\/((?:([^\/<>?#:]*):([^\/<>?#:]*)@)?([^\/<>?#:]*)(?::([^\/<>?#:]*))?)))([^<>?#]*)(\?[^<>#]*)?(#.*)?$/,'i');
  return !!pattern.test(str);
}

function escapeHtml(s) {
    return (s + '').replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

// Does a wild card regex comparison to validate if they match.
// wildTest("google.com/search/*/","google.com/search/2346/") -> true
// This implementation of wildcard search is different than the traditional implementation.
// Normally It works like this: wildTest("google.com/search/*","google.com/search/2346/word") -> true
// But in my impelementation the * only reads up to a / eg, .* -> [^/]* so in the case above would return false.
// To get the initial implementation you can use **
function wildTest(wildcard, str) {
	let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\/$/,''); 
    var mapObj = {
       "**":".*",
       "*":"[^/]*",
       "?":"."
    };
    regx = w.replace(/\*\*|\*|\?/g, function(matched){
      return mapObj[matched];
    });
	const re = new RegExp(`^${regx}/?$`, 'i');
	return re.test(str); // remove last 'i' above to have case sensitive
}
chrome.storage.local.get(["domainGroupData"], function (result) {

    domains = result['domainGroupData'] || {}
    
    for(entry of Object.entries(domains)){
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
            })
            
            

            
			
			//var port = chrome.runtime.connect();

			window.addEventListener("message", function(event) {
			  // We only accept messages from ourselves
			  if (event.source != window)
				return;

			  if (event.data.type && (event.data.type == "FROM_PAGE")) {
				console.log("LOGGED DETECTED", event.data.url)
				event.data.args = event.data.args.filter(a=>a.length != 0)
				
				chrome.storage.local.get(["ajaxLoggerData" + id], function (result) {
					var loggedAPIs = result['ajaxLoggerData' + id] || {};
					var found = false;
					
					// We use this to determine if a change was made to the storage. If changes were made we update the storage.
					var changeMade = false;
					
					for(var [key, value] of Object.entries(loggedAPIs)){
						if(wildTest(key,event.data.url)){
							var before = value.length;
							var data = [...new Set(value.concat(event.data.args))]
							var after = data.length;
							// if the size increaces then it means a new argument was found
							if(after > before){
								changeMade = true;
							}
							
							loggedAPIs[key] = data;
							found = true;
							break;
						}
					}
					
					if(!found){
						console.log("new api found",event.data.url);
						loggedAPIs[event.data.url] = event.data.args;
						changeMade = true;
					}
					if(changeMade){
						var jsonObj = {}
						jsonObj["ajaxLoggerData" + id] = loggedAPIs;
						chrome.storage.local.set(jsonObj);	
					}
				})
				//port.postMessage(event.data.text);
			  }
			},true);
			
			
			// old code to do api logging. new code above
           /* logger.addEventListener( 'DOMNodeInserted',function(e){
                // old-todo: instead of doing this query every dom insertion, only update ajaxLoggerData with that single element to optimize the code/performance.
                // I think it's remnants of when trying out the onunload event.
                var apis = document.querySelectorAll("html > logger > api");
                var apiUrls = []
                apis.forEach(api => apiUrls.push({url: api.dataset.url,params:api.dataset.params.split(",")}))
            
                
                chrome.storage.local.get(["ajaxLoggerData" + id], function (result) {
                    var loggedAPIs = result['ajaxLoggerData' + id] || {};
                    
                    //var apiSet = new Set(loggedAPIs);
                    apiUrls.forEach(function(api){ 
                        if(validURL(api.url)){ // prevent the website from trying to fake an api and assign html pretending to be an api which would be rendered in the menu.
                            loggedAPIs[api.url] = new Set(loggedAPIs[api.url])
                            api.params.forEach(function(param){
                                if(param.length > 0){
                                    loggedAPIs[api.url].add(escapeHtml(param))
                                }
                            });
                            loggedAPIs[api.url] = [...loggedAPIs[api.url]]
                        }else{
							// should only execute if the website trys to fake an api. 
							// If this is called incorrectly then it means my url validation function does not support that url and should be fixed.
							alert("INVALID API | PLEASE REPORT | " + api.url)
						}
                    });
                    
                    
                    var jsonObj = {}
                    jsonObj["ajaxLoggerData" + id] = loggedAPIs;
                    
                    chrome.storage.local.set(jsonObj);
                })                
            });*/
            break;
        }else{
            console.log(window.location.hostname + " does not end with " + url)
        }
    }
})