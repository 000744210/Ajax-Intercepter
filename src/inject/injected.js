console.log("This page is currently intercepting all Ajax requests");

(function () {

    // xmlHttpRequestTracker is used to obtain the url that was used in open() when the send() is called since send() does not know the url when it is called.
    // Example:
    //     req.open("/api") // calls xmlHttpRequestTracker.onOpen in our intercepter to log it.
    //     req.open("/newapi") // calls xmlHttpRequestTracker.onOpen in our intercepter to log it.
    //     req.send("id=5")
    // The onSend will return /newapi since that's the one being used to call the request. No site should be doing 2 open calls like above but it could happen.
    xmlHttpRequestTracker = {};
    xmlHttpRequestTracker.history = [];
    xmlHttpRequestTracker.urlMap = new Map();
    xmlHttpRequestTracker.getXmlHttpRequestUrl = function(xmlHttpRequestObject){
        return xmlHttpRequestTracker.urlMap.get(xmlHttpRequestObject)
    }
    
    xmlHttpRequestTracker.onSend = function (xmlHttpRequestObject) {
        var headers = {}
        for (i = xmlHttpRequestTracker.history.length - 1; i >= 0; i--) { // loop though our open() history in reverse to read it by most recently added.
            var historyObj = xmlHttpRequestTracker.history[i];

            // because we don't have a getRequestHeader function, we need to give the headers to remake the request.
            if (historyObj.requestObject == xmlHttpRequestObject && historyObj.eventName == "setRequestHeader") {
                if (!(historyObj.header in headers)) {
                    headers[historyObj.header] = historyObj.value;
                }
            } else if (historyObj.requestObject == xmlHttpRequestObject && historyObj.eventName == "open") { // if the two xmlHttpRequest objects from the open/close call are the same
                return { // return the url that was used in the open call for that object
                    method: historyObj.arguments[0],
                    url: historyObj.arguments[1],
                    headers: headers
                };
            }
        }
    }
    xmlHttpRequestTracker.onOpen = function (xmlHttpRequestObject, arguments) {
        
        this.urlMap.set(xmlHttpRequestObject,arguments[1])
        
        xmlHttpRequestTracker.history.push({
            eventName: "open",
            requestObject: xmlHttpRequestObject,
            arguments: arguments
        });
    }

    xmlHttpRequestTracker.onSetRequestHeader = function (xmlHttpRequestObject, header, value) {
        xmlHttpRequestTracker.history.push({
            requestObject: xmlHttpRequestObject,
            eventName: "setRequestHeader",
            header: header,
            value: value
        });
    }
    
    
    var filters = Object.entries(_FILTER_URLS);
    
    // the location where our evaluated user's code is stored.
    var filterMethods = {}
    for (let [key, value] of filters) {
        
        // assign an id to every filter.
        // id is used for a lookup for the filterMethods object
        value.id = key;
        
        let isEvaluated = false;
        let filterMethod = null;
        Object.defineProperty(filterMethods, key, {
            // The purpose of this is that we need to wait for librarys to load in before we call eval.
            // By the time the code gets to accessing the filterMethods the entire website would be loaded.
            get:function(){
                if(!isEvaluated){
                    (function(onRequestDataSend=null,onRequestDataReturn=null){
                        eval(value.code);
                        filterMethod = {
                            'onRequestDataSend':onRequestDataSend,
                            'onRequestDataReturn':onRequestDataReturn
                        };
                        isEvaluated = true;
                    })();            
                }
                return filterMethod;
            }
        });
    }
    
    /*
        logAPI inserts a DOM object into the DOM for storing a log of APIs found.
        This is due to a limitation with extensions. The only way to share 
        information is through the usage of the DOM. This is insecure hense why they tried to prevent it.
    */
    logHistory = new Set();
    function logAPI(url, params) {
        logger = document.querySelector("html > logger");
        if (logger) {
            var url = relativeToAbsolute(url);
            
            var parsedUrl = parseUrl(url);
            
            // https://www.google.com/home?q=hello+world would be https://www.google.com/home
            var apiUrl = parsedUrl.protocol + "//" + parsedUrl.hostname + parsedUrl.pathname;
            
            var numberRegex = /\/\d+/gi; // detects a forwards slash and a sequence of numbers: /346
            
            // https://www.google.com/search/234 would be  https://www.google.com/search/* to compress the api list
            apiUrl = apiUrl.replace(numberRegex,"/*")
            
            
            // To increase performance we only append to the logger if the api has not been logged this session.
            // Heavy use apis could slow down a browser a lot without this.
            if(!logHistory.has(apiUrl)){
                logHistory.add(apiUrl);
                var urlParams = parsedUrl.search.split("&");
                urlParamsString = ",";
                urlParams.forEach(function (paramPair) {
                    var pair = paramPair.split("=");
                    urlParamsString += pair[0].replace("?", "") + ",";
                })
                //console.log(urlParamsString);
                var api = document.createElement("api");
                api.dataset.url = apiUrl;
                api.dataset.params = params + urlParamsString;

                logger.appendChild(api);
            }
        }
    }

    function parseUrl(url) {
        var m = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/),
        r = {
            hash: m[10] || "", // #asd
            host: m[3] || "", // localhost:257
            hostname: m[6] || "", // localhost
            href: m[0] || "", // http://username:password@localhost:257/deploy/?asd=asd#asd
            origin: m[1] || "", // http://username:password@localhost:257
            pathname: m[8] || (m[1] ? "/" : ""), // /deploy/
            port: m[7] || "", // 257
            protocol: m[2] || "", // http:
            search: m[9] || "", // ?asd=asd
            username: m[4] || "", // username
            password: m[5] || "" // password
        };
        if (r.protocol.length == 2) {
            r.protocol = "file:///" + r.protocol.toUpperCase();
            r.origin = r.protocol + "//" + r.host;
        }
        r.href = r.origin + r.pathname + r.search + r.hash;
        return m && r;
    };

    function relativeToAbsolute(url) {
        if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("wss://") && !url.startsWith("ws://")) {
            if (url.startsWith("/")) {
                url = window.location.protocol + "//" + window.location.hostname + url
            } else {
                url = window.location.protocol + "//" + window.location.hostname + "/" + url

            }
        }
        return url;
    }

    function wildTest(wildcard, str) {
        let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // regexp escape
        const re = new RegExp(`^${w.replace(/\*/g,'.*').replace(/\?/g,'.')}$`, 'i');
        return re.test(str); // remove last 'i' above to have case sensitive
    }

    function matchesUrlFilters(url) {
        url = relativeToAbsolute(url);
            url = url.split('?')[0];
            var filters = Object.entries(_FILTER_URLS);
        for (let[key, value]of filters) {
            if (wildTest(value.url, url)) {
                return value;
            }
        }
    }
    
    // https://stackoverflow.com/questions/486896/adding-a-parameter-to-the-url-with-javascript
    function updateUrl(url, key, value) {
        if (value !== undefined) {
            value = encodeURI(value);
        }
        var hashIndex = url.indexOf("#") | 0;
        if (hashIndex === -1) hashIndex = url.length | 0;
        var urls = url.substring(0, hashIndex).split('?');
        var baseUrl = urls[0];
        var parameters = '';
        var outPara = {};
        if (urls.length > 1) {
            parameters = urls[1];
        }
        if (parameters !== '') {
            parameters = parameters.split('&');
            for (k in parameters) {
                var keyVal = parameters[k];
                keyVal = keyVal.split('=');
                var ekey = keyVal[0];
                var evalue = '';
                if (keyVal.length > 1) {
                    evalue = keyVal[1];
                }
                outPara[ekey] = evalue;
            }
        }

        if (value !== undefined) {
            outPara[key] = value;
        } else {
            delete outPara[key];
        }
        parameters = [];
        for (var k in outPara) {
            parameters.push(k + '=' + outPara[k]);
        }

        var finalUrl = baseUrl;

        if (parameters.length > 0) {
            finalUrl += '?' + parameters.join('&');
        }

        return finalUrl + url.substring(hashIndex);
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

    async function promptSend(data) {
        //console.log(data);
        return new Promise(function (resolve) {
            var swalConfig = {
                html:
                "<label for='swal-input1'>Url</label><input name='swal-input1' id='swal-input1' style='width:100%'><br><br>" +
                "<label for='swal-input2'>Method</label><input name='swal-input2' id='swal-input2' style='width:100%'><br><br>" +
                "<div style='display:" + (data.method.toUpperCase() == "GET" ? "none" : "block") + ";'><label for='swal-input3'>Body</label><br><textarea id='swal-input3' rows='10' cols='50'></textarea></div><br><br>" +
                "<label for='swal-input4'>Headers</label><br><textarea name='swal-input4' id='swal-input4' style='width:100%' cols='40' rows='10'></textarea>",
                focusConfirm: false,
                preConfirm: () => {
                    resolve({
                        url: document.getElementById("swal-input1").value,
                        method: document.getElementById("swal-input2").value,
                        body: document.getElementById("swal-input3").value,
                        headers: document.getElementById("swal-input4").value
                    })
                },
                onBeforeOpen: () => {
                    document.getElementById("swal-input1").value = data.url;
                    document.getElementById("swal-input2").value = data.method;
                    document.getElementById("swal-input3").value = data.body;
                    document.getElementById("swal-input4").value = data.headers;
                },
                showCancelButton: false,
                allowOutsideClick: false
            };

            try {
                Swal.getQueueStep();
                Swal.insertQueueStep(swalConfig)
            } catch (e) {
                Swal.queue([swalConfig])
            }

        });
    }
	
    async function promptFetch(data) {
        return new Promise(function (resolve) {
            var swalConfig = {
                html: `<label for='swal-input1'>Url</label><input name='swal-input1' id='swal-input1' style='width:100%'><br><br>` +
                `<label for='swal-input2'>Method</label><input name='swal-input2' id='swal-input2' style='width:100%'><br><br>` + 
`<label for='swal-input3'>Headers</label><textarea name='swal-input3' id='swal-input3' style='width:100%' cols='40' rows='10'></textarea><br><br>`,
                focusConfirm: false,
                preConfirm: () => {
                    resolve({
                        url: document.getElementById("swal-input1").value,
                        method: document.getElementById("swal-input2").value,
                        headers: document.getElementById("swal-input3").value
                    })
                },
                onBeforeOpen: () => {
                    document.getElementById("swal-input1").value = data.url;
                    document.getElementById("swal-input2").value = data.method;
                    document.getElementById("swal-input3").value = data.headers;
                },
                showCancelButton: false,
                allowOutsideClick: false
            };

            try {
                Swal.getQueueStep();
                Swal.insertQueueStep(swalConfig)
            } catch (e) {
                Swal.queue([swalConfig])
            }
        })

    }

    async function promptForm(form) {
        // Query all elements that would have been submitted in the form.
        var inputs = form.querySelectorAll("input[name]:not([type='radio']):not([type='checkbox']), select, textarea, input[type='radio']:checked, input[type='checkbox']:checked");

        // Generate a new form without the validation the submitted one had.
        var htmlString = "<label for='swal-input-form-no-submit'>Submission URL</label><input id='swalActionUrl' value='" + form.action + "'  style='width:100%'><br><br><hr><br><form id='swalFormSubmit' method='" + form.method + "' action='" + form.action + "'>";
        var inc = 0;
        inputs.forEach(function (ele) {
            if (ele.tagName.toLowerCase() == "textarea") {
                htmlString += "<label for='swal-input-form" + inc + "'>" + ele.name + "</label><textarea name='" + ele.name + "' id='swal-input-form" + inc + "' style='width:100%'>" + escapeHtml(ele.value) + "</textarea><br><br>";
            } else {
                htmlString += "<label for='swal-input-form" + inc + "'>" + ele.name + "</label><input name='" + ele.name + "' id='swal-input-form" + inc + "' value='" + escapeHtml(ele.value) + "' style='width:100%'><br><br>";
            }
            inc++;
        })
        htmlString += "</form>";

        return new Promise(function (resolve) {
            var swalConfig = {
                html: htmlString,
                focusConfirm: false,
                preConfirm: () => {
                    // We submit our generated form instead of the original form.
                    document.getElementById("swalFormSubmit").action = document.getElementById("swalActionUrl").value
                        document.getElementById("swalFormSubmit").submit()
                },

                onClose: () => {
                    // If we cancel the form it will continue as if the user never attempted to submit the original form.
                    resolve()
                },

                showCancelButton: true,
                showConfirmButton: true,
                allowOutsideClick: false
            };

            try {
                Swal.getQueueStep();
                Swal.insertQueueStep(swalConfig)
            } catch (e) {
                Swal.queue([swalConfig])
            }
        })

    }
    // Intercepts all fetch calls
    var proxyFetch = fetch;
    window.fetch = async function (url, options = {}) {
        // they are using a Request object so we convert it to the options format.
        if (url instanceof Request) {
            options.cache = url.cache;
            options.context = url.context;
            options.credentials = url.credentials;
            options.destination = url.destination;
            options.headers = url.headers;
            options.integrity = url.integrity;
            options.method = url.method;
            options.mode = url.mode;
            options.redirect = url.redirect;
            options.referrer = url.referrer;
            options.referrerPolicy = url.referrerPolicy;
            options.body = url.body;
            options.bodyUsed = url.bodyUsed;

            url = url.url;
        }

        logAPI(url, "")
        var foundFilter = matchesUrlFilters(url);
        if (foundFilter == null){
            return proxyFetch(url, options);
        }
        
        if (foundFilter.isAutomated) {
            var isRejected = false;
            var requestObj = {
                type: 'Fetch',
                url: url,
                options: options,
                reject: function () {
                    isRejected = true;
                }
            };

            let onRequestDataSend = filterMethods[foundFilter.id].onRequestDataSend;
            let onRequestDataReturn = filterMethods[foundFilter.id].onRequestDataReturn;
            if(onRequestDataSend!=null){
                var newRequestObj = await onRequestDataSend(requestObj);
                if (!isRejected  ) {
                    if(onRequestDataReturn!=null){
                        let fetchReturn = proxyFetch(newRequestObj.url, newRequestObj.options);
                        return new Promise(function(resolve,reject){
                            fetchReturn.then(function(data){
                                data.text().then(function(text){
                                    let requestObj = {
                                        type: 'Fetch',
                                        data: text,
                                    }
                                    
                                    onRequestDataReturn(requestObj).then(function(newData){
                                        // create a new response for the modified body
                                        let dataResponse = new Response(newData.data,{
                                            status:data.status,
                                            statusText:data.statusText,
                                            headers:data.headers
                                        });

                                        resolve(dataResponse);
                                    });    
                                })
                                
                            }).catch(function(data){
                                reject(data);
                            })
                        })
                    }else{
                        return proxyFetch(newRequestObj.url, newRequestObj.options);
                    }
                }
            }else{
                // todo: fix this bug. it does not intercept the return data of this request because they did not define a onRequestDataSend method
                // I have to refactor the mess of code from above into a function and reuse it on this fetch call.
                return proxyFetch(url, options);
            }
        } else {

            var headers = options.headers || {}
            var headerString = "";
            keyvaluepairs = Object.entries(headers);
            for (i = 0; i < keyvaluepairs.length; i++) {
                headerString += keyvaluepairs[i][0] + ":" + keyvaluepairs[i][1] + "\n\n";
            }

            newArguments = await promptFetch({
                    url: url,
                    method: options.method || "GET",
                    headers: headerString
                });

            headers = newArguments.headers.split("\n");
            headerOption = {};
            for (i = 0; i < headers.length; i++) {
                var str = headers[i];
                var index = str.indexOf(':');
                var arr = [str.slice(0, index), str.slice(index + 1)];
                if (arr[0] != '' && arr[1] != '') {
                    headerOption[arr[0]] = arr[1];
                }
            }

            options.method = newArguments.method;
            options.headers = headerOption;
            url = newArguments.url;
            return proxyFetch(url, options);
        }

    }

    // Intercepts all XmlHttpRequest.setRequestHeader calls
    // Because we don't have a getRequestHeader method, we log the set calls so we can reobtain the list of headers for the object.
    var proxiedSetRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
    window.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        xmlHttpRequestTracker.onSetRequestHeader(this, header, value);
        return proxiedSetRequestHeader.apply(this, [].slice.call(arguments));
    }

    // Intercepts all XmlHttpRequest.open calls
    var proxiedOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        xmlHttpRequestTracker.onOpen(this, arguments);

        //var foundFilter = matchesUrlFilters(url)
        //console.log(foundFilter)
        //if(foundFilter==null) return proxiedOpen.apply(this, [].slice.call(arguments));

        //let newArguments = await promptOpen(arguments)
        //arguments[0] = prompt("Enter Method",arguments[0])

        //        newUrl = prompt("Enter Url",arguments[1])

        //    if(newUrl){
        //        arguments[1] = newUrl;
        //    }

        return proxiedOpen.apply(this, [].slice.call(arguments));
    }

    // Intercepts all XmlHttpRequest.send calls
    var proxiedSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = async function () {
        pairedOpenArguments = xmlHttpRequestTracker.onSend(this);
        logAPI(pairedOpenArguments.url, "");
        //console.log(pairedOpenArguments)
        var foundFilter = matchesUrlFilters(pairedOpenArguments.url);
        //console.log(foundFilter);

        // if the api does not match any the user wants to edit we will just perform the function as it normally would.
        if (foundFilter == null) {
            return proxiedSend.apply(this, [].slice.call(arguments));
        }
        if (!foundFilter.isAutomated) {

            var stringHeaders = "";
            for (const header in pairedOpenArguments.headers) {
                stringHeaders += header + ":" + pairedOpenArguments.headers[header] + "\n\n";
            }

            let newArguments = await promptSend({
                    body: arguments[0],
                    method: pairedOpenArguments.method,
                    url: pairedOpenArguments.url,
                    headers: stringHeaders
                });

            headers = newArguments.headers.split("\n");
            headerOption = {}
            for (i = 0; i < headers.length; i++) {
                var str = headers[i];
                var index = str.indexOf(':');
                var arr = [str.slice(0, index), str.slice(index + 1)];
                if (arr[0] != '' && arr[1] != '') {
                    headerOption[arr[0]] = arr[1];
                }
            }
            newArguments.headers = headerOption;

            arguments[0] = newArguments.body;

            if (newArguments.url != pairedOpenArguments.url || newArguments.method != pairedOpenArguments.method) {
                proxiedOpen.apply(this, [].slice.call([newArguments.method, newArguments.url]))
            } else {
                proxiedOpen.apply(this, [].slice.call([pairedOpenArguments.method, pairedOpenArguments.url]))
            }

            for (const header in newArguments.headers) {
                proxiedSetRequestHeader.apply(this, [].slice.call([header, newArguments.headers[header]]));
            }

            return proxiedSend.apply(this, [].slice.call(arguments));
        } else {
            let onRequestDataSend = filterMethods[foundFilter.id].onRequestDataSend;
            if(onRequestDataSend!=null){
                var isRejected = false;
                var requestObj = {
                    type: 'XmlHttpRequest',
                    args: {},
                    url: pairedOpenArguments.url.split('?')[0],
                    method: pairedOpenArguments.method,
                    headers: pairedOpenArguments.headers,
                    body: arguments[0],
                    reject: function () {
                        isRejected = true;
                    }
                }

                var params = new URLSearchParams(relativeToAbsolute(pairedOpenArguments.url).split('?')[1]);

                var paramsObj = Array.from(params.keys()).reduce(
                        (acc, val) => ({
                            ...acc,
                            [val]: params.get(val)
                        }), {});

                requestObj.args = paramsObj;

                

                var newRequestObj = await onRequestDataSend(requestObj);

                if (!isRejected) {
                    
                    var withCredentials = this.withCredentials;
                    var responseType = this.responseType;
                    
                    var argUrl = newRequestObj.url
                    // apply arguments to the send url
                    for (const [key, value] of Object.entries(newRequestObj.args)) {
                        argUrl = updateUrl(argUrl,key,value);
                    }
                    
                    proxiedOpen.apply(this, [].slice.call([newRequestObj.method, argUrl]))

                    for (const header in newRequestObj.headers) {
                        proxiedSetRequestHeader.apply(this, [].slice.call([header, newRequestObj.headers[header]]));
                    }
                    
                    // not sure if this does anything but it's better safe than sorry.
                    this.withCredentials = withCredentials;
                    this.responseType = responseType;
                    
                    proxiedSend.apply(this, [].slice.call([newRequestObj.body]));
                }
            }else{
                return proxiedSend.apply(this, [].slice.call(arguments));
            }
        }

    };

    // xmlHttpRequest on data return
    (function(){
        var handleHandler = new Map();
        var eventRef = null;
        var sourceHandler = null;
        
        Object.defineProperty(window.XMLHttpRequest.prototype, "onload", {
            get: function () {
                return sourceHandler;
            },
            set: function (handler) {

                sourceHandler = handler;
                if (eventRef) {
                    proxiedRemoveEventListener.apply(this, ["load", eventRef]);
                }
                if (typeof(handler) == "function") {
                    eventRef = async function (event) {
                        var url = xmlHttpRequestTracker.getXmlHttpRequestUrl(this);
                        
                        var foundFilter = matchesUrlFilters(url);
                        if (foundFilter != null) {
                            
                            let onRequestDataReturn = filterMethods[foundFilter.id].onRequestDataReturn;
                            if(onRequestDataReturn!=null){
                                let writableObj = makeWritable(this);
                                var isRejected = false;
                                writableObj.reject = function () {
                                    isRejected = true;
                                }
                                
                                // Make sure when we ran eval that they created the method.
                            
                                let thisRef = await onRequestDataReturn(writableObj);
                                if (!isRejected) {
                                    handler.bind(thisRef)(event);
                                }
                            }else{
                                handler.bind(this)(event)
                            }
                        } else {
                            handler.bind(this)(event);
                        }
                    }
                    proxiedAddEventListener.apply(this, ["load", eventRef]);
                } else {
                    eventRef = null;
                }
            }
        });

        var proxiedAddEventListener = window.XMLHttpRequest.prototype.addEventListener;
        window.XMLHttpRequest.prototype.addEventListener = async function () {
            if (arguments[0] == "load") {
                let handler = arguments[1];
                let xmlObject = this;
                arguments[1] = async function (event) {
                    let url = xmlHttpRequestTracker.getXmlHttpRequestUrl(xmlObject);
                    let foundFilter = matchesUrlFilters(url);
                    if (foundFilter != null) {
                        let onRequestDataReturn = filterMethods[foundFilter.id].onRequestDataReturn;
                        if(onRequestDataReturn != null){
                            let writableObj = makeWritable(this);
                            
                            let isRejected = false;
                            writableObj.reject = function () {
                                isRejected = true;
                            }
                            // Make sure when we ran eval that they created the method.
                        
                            let thisRef = await onRequestDataReturn(writableObj);
                            if (!isRejected) {
                                handler.bind(thisRef)(event);
                                //handler(event);
                            }
                        }else{
                            handler.bind(this)(event);
                        }
                    }else{
                        handler.bind(this)(event);
                    }
                }

                if (!handleHandler.has(this)) {
                    var map = new Map();
                    map.set(handler, arguments[1]);
                    handleHandler.set(this, map);

                    proxiedAddEventListener.apply(this, [].slice.call(arguments));
                } else if (!handleHandler.get(this).has(handler)) {
                    handleHandler.get(this).set(handler, arguments[1]);
                    proxiedAddEventListener.apply(this, [].slice.call(arguments));
                }
                
            } else {
                proxiedAddEventListener.apply(this, [].slice.call(arguments));
            }

        }

        var proxiedRemoveEventListener = window.XMLHttpRequest.prototype.removeEventListener;
        window.XMLHttpRequest.prototype.removeEventListener = function () {
            //let url = xmlHttpRequestTracker.getXmlHttpRequestUrl(this);
            //var foundFilter = matchesUrlFilters(url);
            //if (foundFilter != null) {
            if (arguments[0] == "load") {
                if(handleHandler.has(this) && handleHandler.get(this).has(arguments[1])){
                    arguments[1] = handleHandler.get(this).get(arguments[1]);
                }
            }
            //}
            proxiedRemoveEventListener.apply(this, [].slice.call(arguments));

        }

        function makeWritable(event) {
            //alert("middleman")
            for (prop in event) {
                try {
                    Object.defineProperty(event, prop, {
                        value: event[prop],
                        writable: true,
                        configurable: true
                    })
                } catch (e) {}
                // we can not define event.isTrusted due to security in chrome.
            }
            return event;
        }
    })();    
    
    // Intercept all form submissions
    window.onload = function (event) {
        document.body.addEventListener('submit', async function (event) {

            paramElements = event.target.querySelectorAll("[name]:checked,[name]:not([type=checkbox]):not([type=radio])"); // get all elements with the attribute name. This should be everything that would be a parameter in the request.
            paramString = "";
            paramElements.forEach((ele) => paramString += ele.name + ",");
            paramString.trim(",");

            logAPI(event.target.action, paramString);
            var foundFilter = matchesUrlFilters(event.target.action);
            if (foundFilter != null) {
                event.preventDefault(); // prevents the form being submitted.
                if (foundFilter.isAutomated) {
                    let onRequestDataSend = filterMethods[foundFilter.id].onRequestDataSend;
                    if(onRequestDataSend!=null){
                        var isRejected = false;
                        var requestObj = {
                            type: "Form",
                            args: {},
                            url: event.target.action,
                            method: event.target.method,
                            reject: function () {
                                isRejected = true;
                            }
                        }

                        paramElements.forEach((ele) => {
                            if (ele.name in requestObj.args) {
                                // convert the index over to an array. For rare cases with multiple inputs with the same name.
                                requestObj.args[ele.name] = [requestObj.args[ele.name], ele.value];
                            } else {
                                if (Array.isArray(requestObj.args[ele.name])) {
                                    requestObj.args[ele.name].push(ele.value);
                                } else {
                                    requestObj.args[ele.name] = ele.value;
                                }
                            }
                        });

                        
                        var newRequestObj = await onRequestDataSend(requestObj);

                        if (!isRejected) {
                            var formString = "<form style='display:none;' id='injected-form-submission' action='" + newRequestObj.url + "' method='" + newRequestObj.method + "'>";
                            for (let[arg, value]of Object.entries(newRequestObj.args)) {
                                if (Array.isArray(value)) {
                                    for (var v of value) {
                                        formString += '<input value="' + v + '" name="' + arg + '">';
                                    }
                                } else {
                                    formString += '<input value="' + value + '" name="' + arg + '">';
                                }
                            }
                            //formString += "<input type='submit' id='injected-form-submission-button'>";
                            formString += "</form>"
                            var container = document.createElement("div");
                            container.innerHTML = formString;
                            document.body.appendChild(container);
                            document.getElementById("injected-form-submission").submit();
                        }
                    }
                } else {
                    // we prompt them another form with all of the information filled in but without any validation they had on it.
                    await promptForm(event.target);
                }
            }
        })
    };
    // Websocket on data return
    (function(){
        var handleHandler = new Map();
        var eventRef = null;
        var sourceHandler = null;

        Object.defineProperty(WebSocket.prototype, "onmessage", {
            get: function () {
                return sourceHandler;
            },
            set: function (handler) {
                logAPI(this.url, "");

                sourceHandler = handler;
                if (eventRef) {
                    proxiedRemoveEventListener.apply(this, ["message", eventRef]);
                }
                if (typeof(handler) == "function") {
                    eventRef = async function (event) {
                        var foundFilter = matchesUrlFilters(this.url);
                        if (foundFilter != null) {
                            
                            let onRequestDataReturn = filterMethods[foundFilter.id].onRequestDataReturn;
                            if(onRequestDataReturn!=null){
                                event = makeWritable(event);
                                var isRejected = false;
                                event.reject = function () {
                                    isRejected = true;
                                }
                                
                                // Make sure when we ran eval that they created the method.
                                
                                event = await onRequestDataReturn(event);
                                if (!isRejected) {
                                    handler.bind(this)(event);
                                }
                            }else{
                                handler.bind(this)(event)
                            }
                        } else {
                            handler.bind(this)(event);
                        }
                    }
                    proxiedAddEventListener.apply(this, ["message", eventRef]);
                } else {
                    eventRef = null;
                }
            }
        })

        var proxiedAddEventListener = WebSocket.prototype.addEventListener;
        WebSocket.prototype.addEventListener = async function () {
            let thisRef = this;
            logAPI(this.url, "")
            if (arguments[0] == "message") {
                var foundFilter = matchesUrlFilters(this.url);
                if (foundFilter != null) {
                    let handler = arguments[1];
                    arguments[1] = async function (event) {
                        let onRequestDataReturn = filterMethods[foundFilter.id].onRequestDataReturn;
                        if(onRequestDataReturn != null){
                            event = makeWritable(event);
                            
                            let isRejected = false;
                            event.reject = function () {
                                isRejected = true;
                            }
                            // Make sure when we ran eval that they created the method.
                            
                            event = await onRequestDataReturn(event);
                            if (!isRejected) {
                                handler.bind(thisRef)(event);
                            }
                        }else{
                            handler.bind(thisRef)(event);
                        }
                    }

                    if (!handleHandler.has(this)) {
                        var map = new Map();
                        map.set(handler, arguments[1]);
                        handleHandler.set(this, map);

                        proxiedAddEventListener.apply(this, [].slice.call(arguments));
                    } else if (!handleHandler.get(this).has(handler)) {
                        handleHandler.get(this).set(handler, arguments[1]);
                        proxiedAddEventListener.apply(this, [].slice.call(arguments));
                    }
                }
            } else {
                proxiedAddEventListener.apply(this, [].slice.call(arguments));
            }

        }

        var proxiedRemoveEventListener = WebSocket.prototype.removeEventListener;
        WebSocket.prototype.removeEventListener = function () {
            var foundFilter = matchesUrlFilters(this.url);
            if (foundFilter != null) {
                if (arguments[0] == "message") {
                    arguments[1] = handleHandler.get(this).get(arguments[1]);
                }
            }
            proxiedRemoveEventListener.apply(this, [].slice.call(arguments));

        }

        function makeWritable(event) {
            //alert("middleman")
            for (prop in event) {
                try {
                    Object.defineProperty(event, prop, {
                        value: event[prop],
                        writable: true,
                        configurable: true
                    })
                } catch (e) {}
                // we can not define event.isTrusted due to security in chrome.
            }
            return event;
        }
    })();
    
    // websocket onsend
    var proxiedWebSocketSend = WebSocket.prototype.send;
    WebSocket.prototype.send = async function(){
        var foundFilter = matchesUrlFilters(this.url);
        if(foundFilter){
            var isRejected = false;
            var requestObj = {
                type: 'WebSocket',
                data: arguments[0],
                reject: function () {
                    isRejected = true;
                }
            }            
            let onRequestDataSend = filterMethods[foundFilter.id].onRequestDataSend;

            if (onRequestDataSend!=null){
                var newRequestObj = await onRequestDataSend(requestObj);

                if (!isRejected) {
                    proxiedWebSocketSend.apply(this, [newRequestObj.data])
                }        
            }else{
                proxiedWebSocketSend.apply(this, [].slice.call(arguments))
            }
        }else{
            proxiedWebSocketSend.apply(this, [].slice.call(arguments))
        }
    }
    
})()