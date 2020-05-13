console.log("This page is currently intercepting all Ajax requests");

(function(){
	
	// xmlHttpRequestTracker is used to obtain the url that was used in open() when the send() is called since send() does not know the url when it is called.
	// Example:
	//     req.open("/api") // calls xmlHttpRequestTracker.onOpen in our intercepter to log it.
	//     req.open("/newapi") // calls xmlHttpRequestTracker.onOpen in our intercepter to log it.
	//     req.send("id=5") 
	// The onSend will return /newapi since that's the one being used to call the request. No site should be doing 2 open calls like above but it could happen.
	xmlHttpRequestTracker = {};
	xmlHttpRequestTracker.history = [];
	xmlHttpRequestTracker.onSend = function(xmlHttpRequestObject){
		var headers = {}
		for(i=xmlHttpRequestTracker.history.length-1;i>=0;i--){ // loop though our open() history in reverse to read it by most recently added.
			var historyObj = xmlHttpRequestTracker.history[i];
			
			// because we don't have a getRequestHeader function, we need to give the headers to remake the request.
			if(historyObj.requestObject==xmlHttpRequestObject && historyObj.eventName == "setRequestHeader"){	
				if(!(historyObj.header in headers)){
					headers[historyObj.header] = historyObj.value;
				}
			}else if(historyObj.requestObject==xmlHttpRequestObject && historyObj.eventName == "open"){ // if the two xmlHttpRequest objects from the open/close call are the same				
				return { // return the url that was used in the open call for that object 
					method:historyObj.arguments[0],
					url:   historyObj.arguments[1],
					headers: headers
				};			
			}
		}
	}
	xmlHttpRequestTracker.onOpen = function(xmlHttpRequestObject,arguments){
		xmlHttpRequestTracker.history.push(
			{
				eventName:"open",
				requestObject:xmlHttpRequestObject,
				arguments:arguments
			});
	}
	
	xmlHttpRequestTracker.onSetRequestHeader = function(xmlHttpRequestObject,header,value){
		xmlHttpRequestTracker.history.push(
			{
				requestObject:xmlHttpRequestObject,
				eventName:"setRequestHeader",
				header:header,
				value:value
			});
	}

	function logAPI(url,params){
		logger = document.querySelector("html > logger")
		if(logger){
			var url = relativeToAbsolute(url)

			var parsedUrl = parseUrl(url);
			
			// https://www.google.com/home?q=hello+world would be https://www.google.com/home
			var apiUrl = parsedUrl.protocol + "//" + parsedUrl.hostname + parsedUrl.pathname
			//console.log("BEFORE", url);
			//console.log("AFTER",apiUrl);
			//console.log();
			var urlParams = parsedUrl.search.split("&")
			urlParamsString = ","
			urlParams.forEach(function(paramPair){
				var pair = paramPair.split("=")
				urlParamsString += pair[0].replace("?","")+ ",";
			})
			//console.log(urlParamsString);
			var api = document.createElement("api")
			api.dataset.url = apiUrl;
			api.dataset.params = params + urlParamsString
			logger.appendChild(api);
		}
	}
	
	
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
	
	function relativeToAbsolute(url){
		if(!url.startsWith("http://") && !url.startsWith("https://")){
			if(url.startsWith("/")){
				url = window.location.protocol + "//" + window.location.hostname + url 
			}else{
				url = window.location.protocol + "//" + window.location.hostname +"/"+ url 
				
			}
		}
		return url;
	}
	
	function wildTest(wildcard, str) {
		let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // regexp escape 
		const re = new RegExp(`^${w.replace(/\*/g,'.*').replace(/\?/g,'.')}$`,'i');
		return re.test(str); // remove last 'i' above to have case sensitive
	}
	
	
	function matchesUrlFilters(url){
		url = relativeToAbsolute(url)
		url = url.split('?')[0]
		var filters = Object.entries(_FILTER_URLS);
		for(let [key,value] of filters){
			if(wildTest(value.url,url)){
				return value;
			}
		}
	}
	
	function escapeHtml(s) {
		return (s + '').replace(/[&<>"']/g, function (m) {
			return ({
				'&': '&amp;', '<': '&lt;', '>': '&gt;',
				'"': '&quot;', "'": '&#39;'
			})[m];
		});
	}	
	
	async function promptSend(data){
		//console.log(data);
		return new Promise(function(resolve){
			var swalConfig = {
				html: 
					  "<label for='swal-input1'>Url</label><input name='swal-input1' id='swal-input1' style='width:100%'><br><br>"+
					  "<label for='swal-input2'>Method</label><input name='swal-input2' id='swal-input2' style='width:100%'><br><br>"+
					  "<div style='display:"+(data.method.toUpperCase()=="GET"?"none":"block")+";'><label for='swal-input3'>Body</label><br><textarea id='swal-input3' rows='10' cols='50'></textarea></div><br><br>"+
					  "<label for='swal-input4'>Headers</label><br><textarea name='swal-input4' id='swal-input4' style='width:100%' cols='40' rows='10'></textarea>",
				focusConfirm: false,
				preConfirm: () => {
					resolve({
						url: document.getElementById("swal-input1").value,
						method: document.getElementById("swal-input2").value,
						body:document.getElementById("swal-input3").value,
						headers:document.getElementById("swal-input4").value
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
		
			try{
				Swal.getQueueStep(); 
				Swal.insertQueueStep(swalConfig)
			}catch(e){
				Swal.queue([swalConfig])			
			}

		});
	}
	
	//inactive
	async function promptOpen(data){
		return new Promise(function(resolve){
			var swalConfig = {
				html: `<label for='swal-input2'>Url</label><input name='swal-input2' id='swal-input2' style='width:100%'><br><br>`+
					  `<label for='swal-input1'>Method</label><input name='swal-input1' id='swal-input1' style='width:100%'>`,
				focusConfirm: false,
				preConfirm: () => {
					resolve([document.getElementById("swal-input1").value,document.getElementById("swal-input2").value])
				},
				onBeforeOpen: () => {
					document.getElementById("swal-input1").value = data.url;
					document.getElementById("swal-input2").value = data.method;
				},
				showCancelButton: false,
				allowOutsideClick: false
			};
		
			try{
				Swal.getQueueStep();
				Swal.insertQueueStep(swalConfig)
			}catch(e){
				Swal.queue([swalConfig])			
			}
		})

	}
	
	async function promptFetch(data){
		return new Promise(function(resolve){
			var swalConfig = {
				html: `<label for='swal-input1'>Url</label><input name='swal-input1' id='swal-input1' style='width:100%'><br><br>`+
					  `<label for='swal-input2'>Method</label><input name='swal-input2' id='swal-input2' style='width:100%'><br><br>`+
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
		
			try{
				Swal.getQueueStep();
				Swal.insertQueueStep(swalConfig)
			}catch(e){
				Swal.queue([swalConfig])			
			}
		})

	}

	
	async function promptForm(form){	
		// Query all elements that would have been submitted in the form.
		var inputs = form.querySelectorAll("input[name]:not([type='radio']):not([type='checkbox']), select, textarea, input[type='radio']:checked, input[type='checkbox']:checked");
		
		// Generate a new form without the validation the submitted one had. 
		var htmlString = "<label for='swal-input-form-no-submit'>Submission URL</label><input id='swalActionUrl' value='"+form.action+"'  style='width:100%'><br><br><hr><br><form id='swalFormSubmit' method='"+form.method+"' action='"+form.action+"'>";
		var inc = 0
		inputs.forEach(function(ele){
			if(ele.tagName.toLowerCase() == "textarea"){
				htmlString += "<label for='swal-input-form"+inc+"'>"+ele.name+"</label><textarea name='"+ele.name+"' id='swal-input-form"+inc+"' style='width:100%'>"+escapeHtml(ele.value)+"</textarea><br><br>";	
			}else{
				htmlString += "<label for='swal-input-form"+inc+"'>"+ele.name+"</label><input name='"+ele.name+"' id='swal-input-form"+inc+"' value='"+escapeHtml(ele.value)+"' style='width:100%'><br><br>";					
			}
			inc++
		})
		htmlString += "</form>"
		
		return new Promise(function(resolve){
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
				showConfirmButton:true,
				allowOutsideClick: false
			};
		
			try{
				Swal.getQueueStep();
				Swal.insertQueueStep(swalConfig)
			}catch(e){
				Swal.queue([swalConfig])			
			}
		})

	}	
	// Intercepts all fetch calls
	var proxyFetch = fetch;
	window.fetch = async function(url,options={}){
			// they are using a Request object so we convert it to the options format.
			if(url instanceof Request){
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
		
		logAPI(url,"")
		var foundFilter = matchesUrlFilters(url)
		if(foundFilter==null) return proxyFetch(url,options);
		if(foundFilter.isAutomated){
			var isRejected = false;
			var requestObj = {
				type : 'Fetch',
				url : url,
				options : options,
				reject : function(){
					isRejected = true;
				}
			};
			
			

			eval(foundFilter.code);
			
			var newRequestObj = onFilterMatch(requestObj);
			if(!isRejected){
				return proxyFetch(newRequestObj.url,newRequestObj.options);	
			}			
		}else{
			
			
			
			var headers = options.headers||{}
			var headerString = "";
			keyvaluepairs = Object.entries(headers);
			for(i=0;i<keyvaluepairs.length;i++){
				headerString += keyvaluepairs[i][0] + ":" + keyvaluepairs[i][1] +"\n\n";
			}
			
			newArguments = await promptFetch({url:url,method:options.method||"GET",headers:headerString})
			
			headers = newArguments.headers.split("\n");
			headerOption = {}
			for(i=0;i<headers.length;i++){
				var str = headers[i]
				var index = str.indexOf(':');
				var arr = [str.slice(0, index), str.slice(index + 1)];
				if(arr[0]!='' && arr[1]!=''){
					headerOption[arr[0]] = arr[1];
				}
			}
			
			options.method = newArguments.method;
			options.headers =headerOption;
			url = newArguments.url
			return proxyFetch(url,options);			
		}
		
		
		
	}

	// Intercepts all XmlHttpRequest.setRequestHeader calls
	// Because we don't have a getRequestHeader method, we log the set calls so we can reobtain the list of headers for the object.
	var proxiedSetRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
    window.XMLHttpRequest.prototype.setRequestHeader = function(header,value) {
		xmlHttpRequestTracker.onSetRequestHeader(this,header,value)
        return proxiedSetRequestHeader.apply(this, [].slice.call(arguments));
    }	
	
	// Intercepts all XmlHttpRequest.open calls
	var proxiedOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
		xmlHttpRequestTracker.onOpen(this,arguments)
		
		
		//var foundFilter = matchesUrlFilters(url)
		//console.log(foundFilter)
		//if(foundFilter==null) return proxiedOpen.apply(this, [].slice.call(arguments));
		
        //let newArguments = await promptOpen(arguments)
        //arguments[0] = prompt("Enter Method",arguments[0])
        
//		newUrl = prompt("Enter Url",arguments[1])

	//	if(newUrl){
	//		arguments[1] = newUrl;
	//	}
		
        return proxiedOpen.apply(this, [].slice.call(arguments));
    }



	// Intercepts all XmlHttpRequest.send calls
	var proxiedSend = window.XMLHttpRequest.prototype.send;
	window.XMLHttpRequest.prototype.send = async function() {
		pairedOpenArguments = xmlHttpRequestTracker.onSend(this);
		logAPI(pairedOpenArguments.url,"")
		//console.log(pairedOpenArguments)
		var foundFilter = matchesUrlFilters(pairedOpenArguments.url)
		//console.log(foundFilter);
		
		// if the api does not match any the user wants to edit we will just perform the function as it normally would.
		if(foundFilter==null)  {
			return proxiedSend.apply(this, [].slice.call(arguments));
		}
		if(!foundFilter.isAutomated){
			
			var stringHeaders = "";
			for(const header in pairedOpenArguments.headers){
				stringHeaders += header + ":" +pairedOpenArguments.headers[header] + "\n\n";
			}
			
			let newArguments = await promptSend({
				body:arguments[0],
				method:pairedOpenArguments.method,
				url:pairedOpenArguments.url,
				headers:stringHeaders
			});
			
			headers = newArguments.headers.split("\n");
			headerOption = {}
			for(i=0;i<headers.length;i++){
				var str = headers[i]
				var index = str.indexOf(':');
				var arr = [str.slice(0, index), str.slice(index + 1)];
				if(arr[0]!='' && arr[1]!=''){
					headerOption[arr[0]] = arr[1];
				}
			}
			newArguments.headers = headerOption;
			
			arguments[0] = newArguments.body;

			if(newArguments.url != pairedOpenArguments.url && newArguments.method != pairedOpenArguments.method){
				proxiedOpen.apply(this, [].slice.call([newArguments.method,newArguments.url]))
			}else{
				proxiedOpen.apply(this, [].slice.call([pairedOpenArguments.method,pairedOpenArguments.url]))
			}		
			
			for(const header in newArguments.headers){
				proxiedSetRequestHeader.apply(this, [].slice.call([header,newArguments.headers[header]]));
			}
			
			return proxiedSend.apply(this, [].slice.call(arguments));
		}else{
			var isRejected = false;
			var requestObj = {
				type : 'XmlHttpRequest',
				args : {},
				url : pairedOpenArguments.url.split('?')[0],
				method : pairedOpenArguments.method,
				headers : pairedOpenArguments.headers,
				body : arguments[0],
				reject : function(){
					isRejected = true;
				}
			}
			
			const params = new URLSearchParams(window.location.search);

			const paramsObj = Array.from(params.keys()).reduce(
				(acc, val) => ({ ...acc, [val]: params.get(val) }),
				{}
			);
			
			requestObj.args = paramsObj;
			
			eval(foundFilter.code);
			
			var newRequestObj = onFilterMatch(requestObj);
			
			if(!isRejected){
				proxiedOpen.apply(this, [].slice.call([newRequestObj.method,newRequestObj.url]))
				
				for(const header in newRequestObj.headers){
					proxiedSetRequestHeader.apply(this, [].slice.call([header,newRequestObj.headers[header]]));
				}
				
				proxiedSend.apply(this, [].slice.call([newRequestObj.body]));
			}
		}
		
	}

	// Intercept all form submissions
	window.onload = function(event) {
		document.body.addEventListener('submit',async function (event) {
			
			paramElements = event.target.querySelectorAll("[name]:checked,[name]:not([type=checkbox]):not([type=radio])") // get all elements with the attribute name. This should be everything that would be a parameter in the request.
			paramString = "";
			paramElements.forEach((ele)=>paramString += ele.name + ",")
			paramString.trim(",")
			
			logAPI(event.target.action,paramString)
			var foundFilter = matchesUrlFilters(event.target.action)
			if(foundFilter!=null){
				event.preventDefault(); // prevents the form being submitted.
				if(foundFilter.isAutomated){
					var isRejected = false;
					var requestObj = {
						type : "Form",
						args : {},
						url : event.target.action,
						method : event.target.method,
						reject : function(){
							isRejected = true;
						}
					}
					
					paramElements.forEach((ele)=> {
						if(ele.name in requestObj.args){
							// convert the index over to an array. For rare cases with multiple inputs with the same name.
							requestObj.args[ele.name] = [requestObj.args[ele.name],ele.value];
						}else{
							if(Array.isArray(requestObj.args[ele.name])){
								requestObj.args[ele.name].push(ele.value);
							}else{
								requestObj.args[ele.name] = ele.value;
							}
						}
					});
			
					eval(foundFilter.code);
			
					var newRequestObj = onFilterMatch(requestObj);
					
					if(!isRejected){
					var formString = "<form style='display:none;' id='injected-form-submission' action='"+newRequestObj.url+"' method='"+newRequestObj.method+"'>";
						for(let [arg,value] of Object.entries(newRequestObj.args)){
							if(Array.isArray(value)){
								for (var v of value) {
									formString += '<input value="'+v+'" name="'+arg+'">'
								}								
							}else{
								formString += '<input value="'+value+'" name="'+arg+'">'
							}
						}
						//formString += "<input type='submit' id='injected-form-submission-button'>";
						formString += "</form>"
						var container = document.createElement("div");
						container.innerHTML = formString;
						document.body.appendChild(container);
						document.getElementById("injected-form-submission").submit()
					}
				}else{
					// we prompt them another form with all of the information filled in but without any validation they had on it.
					await promptForm(event.target)
				}
			}
		})
	};	

	
})()