
chrome.storage.local.get(["domainGroupData"], function(result) {
	domains = result['domainGroupData'] || {}
	domainList = "";
	
	Object.entries(domains).forEach((entry)=>{
		var name = ""
		var runningClass = ""
		var runningColor = ""
		
		var id = entry[0]
		var domain = entry[1]
		var isRunning = domain.isRunning;
		
		
		// determin if we have a display name or else we need to fall back to the url as the name
		if(domain.display.trim() == ""){
			name = domain.url
		}else{
			name = domain.display.trim();
		}
		
		if(isRunning){
			runningColor="#08e200"
			runningClass = "fa fa-pause"
		}else{
			runningColor="#ccc"
			runningClass = "fa fa-play"
		}
		domainList += 
		'<div class="wordListContainer">'+
			'<div class="groupTitle">'+
				'<div class="groupColor" style=" background-color: '+runningColor+';color:#fff;">'+name.charAt(0).toUpperCase()+'</div>'+
				'<div class="groupHeader '+(isRunning?"":"groupDisabled")+'">'+name+'</div>'+
			'</div><a data-id='+id+' class="editGroup delete-btn"><i class="fa fa-times" aria-hidden="true"></i></a>'+
			'<a class="flipGroup run-btn" data-id='+id+'><i class="'+runningClass+'" aria-hidden="true"></i></a>'+
			'<a href="/src/page_action/editgroup.html?id='+id+'" class="editGroup"><i class="fa fa-pencil" aria-hidden="true"></i></a>'+
		'</div>';
		

	})
	document.getElementById("domainGroup").innerHTML = domainList;
	var runBtns = document.getElementsByClassName("run-btn")
	for(i = 0;i<runBtns.length;i++){
		let ele = runBtns[i];
		ele.onclick = function(){
			chrome.storage.local.get(["domainGroupData"], function(result) {
				//we toggle the state of the isrunning property.
				result['domainGroupData'][parseInt(ele.dataset.id)].isRunning = !result['domainGroupData'][parseInt(ele.dataset.id)].isRunning

				var jsonObj = {};

				jsonObj["domainGroupData"] = result['domainGroupData'];
				chrome.storage.local.set(jsonObj,function(){
					window.location.reload();
				});		
			})
		}
	}

	// Delete button for domain group
	deletebtns = document.getElementsByClassName("delete-btn")
	for(i=0;i<deletebtns.length;i++){
		let ele = deletebtns[i];
		ele.onclick = function(){
			let id=ele.dataset.id;
			
			var confirmed = window.confirm("Are you sure you want to delete this?")
			
			if(!confirmed)return;
			
			chrome.storage.local.get(["domainGroupData"], function(result) {
				urls = result['domainGroupData'] || {}
				delete urls[parseInt(id)]
				
				var jsonObj = {};
				jsonObj["domainGroupData"] = urls;
				chrome.storage.local.set(jsonObj, function() { 
					// clear all of the related data to this group.
					var jsonObj = {}
					jsonObj["ajaxGroupData"+id] = {}
					chrome.storage.local.set(jsonObj, function() {
						var jsonObj = {}
						jsonObj["ajaxLoggerData"+id] = {}
						chrome.storage.local.set(jsonObj, function() {						
							window.location.reload();
						})
					});		
				});	

				
			})
		}
	}
	
});

