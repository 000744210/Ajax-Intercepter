function getQueryParameter(parameter) {
	return (window.location.href.split(parameter + '=')[1].split('&')[0]);
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

var groupId =  parseInt(getQueryParameter("groupid"));
document.getElementById("backBtn").href = "/src/page_action/viewlogs.html?groupid=" + groupId



chrome.storage.local.get(["ajaxLoggerData"+groupId], function(result) {
	urls = result['ajaxLoggerData'+groupId] || {}
	
	document.querySelector("#continueBtn").onclick = function(){
		
		var wildcardStr = document.getElementById("logGroup").value

		if(wildcardStr.length == 0){
			alert("Wildcard URL must not be empty")
			return;
		}
		
		if(wildcardStr.indexOf("*") == -1 && wildcardStr.indexOf("?") == -1){
			alert("The url must contain a wildcard character '*' to shrink the log list")
			return;
		}
		
		chrome.storage.local.get(["ajaxLoggerData"+groupId], function(result) {
			var logs = result["ajaxLoggerData"+groupId] || {}
			
			// this will be the log we update the chrome.storage with.
			var newLogs = {};
			
			// list of args from all merged logs
			var newLogArgs = []
			
			/*
				We loop through the entire api log and rebuild the log base on the success of the user's wildcard url.
				
				For each log entry, if the log api does not match the user's wildcard we insert it into into newLogs
									if the log api matches the user's wildcard we don't insert into newlogs but we merge the arguments into a single array.
			*/
			var matchFound = false;
			for(var [key,value] of Object.entries(logs)){
				if(wildTest(wildcardStr,key)){
					matchFound = true;
					// merge all matched arg arrays together into a single array. The array will have duplicates but I undupe it with a Set later.
					newLogArgs = newLogArgs.concat(value);
				}else{
					newLogs[key] = value;
				}
			}
			
			if(!matchFound){
				alert("The provided wildcard URL does not match any existing API logs.\nNote: the * character only reads up to a / character")
				return;
			}
			
			// insert the user's wildcard into the logs with a non duped arg list into the rebuilt log list.
 			newLogs[wildcardStr] = [...new Set(newLogArgs)];
			
			var jsonObj = {};
			jsonObj["ajaxLoggerData"+groupId] = newLogs;
			
			chrome.storage.local.set(jsonObj, function() { 
				window.location.href = "/src/page_action/viewlogs.html?groupid=" + groupId
			});	

		
		})
	}
	
})