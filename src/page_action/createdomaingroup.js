chrome.tabs.query({ active: true, currentWindow: true },function(tab){
    document.getElementById("domain").value = parseUrl(tab[0].url).hostname
})

function parseUrl(url) {
    var m = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/),
        r = {
            hash: m[10] || "",                   // #asd
            host: m[3] || "",                    // localhost:257
            hostname: m[6] || "",                // localhost
            href: m[0] || "",                    // http://username:password@localhost:257/deploy/?asd=asd#asd
            origin: m[1] || "",                  // http://username:password@localhost:257
            pathname: m[8] || (m[1] ? "/" : ""), // /deploy/
            port: m[7] || "",                    // 257
            protocol: m[2] || "",                // http:
            search: m[9] || "",                  // ?asd=asd
            username: m[4] || "",                // username 
            password: m[5] || ""                 // password
        };
    if (r.protocol.length == 2) {
        r.protocol = "file:///" + r.protocol.toUpperCase();
        r.origin = r.protocol + "//" + r.host;
    }
    r.href = r.origin + r.pathname + r.search + r.hash;
    return m && r;
};    

document.getElementById("continueBtn").onclick = function(){
    var domainRegex = /^[a-z0-9]*(\.([a-z0-9]+))*$/
    
    var url = document.getElementById("domain").value
    
    if(!url.match(domainRegex)){
        alert("Domain url must be valid. (google.com not https://www.google.com)")
        return;
    }
    
    chrome.storage.local.get(["domainGroupData"], function(result) {
        var array = result["domainGroupData"]?result["domainGroupData"]:{};
        // get the largest key and increment by 1
        var nextId = parseInt(getLargestKey(array))+1
        array[nextId] = {
            url:document.getElementById("domain").value,
            display:document.getElementById("displayname").value,
            isRunning:true
        };
        
        var jsonObj = {};

        jsonObj["domainGroupData"] = array;
        chrome.storage.local.set(jsonObj, function() {
            window.location.href="/src/page_action/page_action.html"
        });
    });
    
}

function getLargestKey(obj){
    var keys = Object.keys(obj)
    largest = 0;
    for(i=0;i<keys.length;i++){
        if(keys[i] > largest){
            largest = keys[i]
        }
    }
    return largest;
}