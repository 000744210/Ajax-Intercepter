function getQueryParameter(parameter) {
	return (window.location.href.split(parameter + '=')[1].split('&')[0]);
}
var groupId =  parseInt(getQueryParameter("id"));
document.getElementById("createAjaxUrl").href = "/src/page_action/createajaxurl.html?groupid=" + groupId
document.getElementById("apiBtn").href = "/src/page_action/viewlogs.html?groupid=" + groupId


chrome.storage.local.get(["ajaxGroupData"+groupId], function(result) {
		urls = result['ajaxGroupData'+groupId] || {}

		domainList = "";

		Object.entries(urls).forEach((entry)=>{
			var id = entry[0]
			var ajax = entry[1]
			var name = ajax.url

			domainList += 
				'<div class="wordListContainer">'+
					'<div class="groupTitle">'+
						'<div class="groupHeader"><div style="width:260px;overflow:hidden;height:28px;font-size:2.5vh;">'+name+'</div></div>'+
						'<a data-id='+id+' class="editGroup delete-btn"><i class="fa fa-times" aria-hidden="true"></i></a>'+
						'<a href="/src/page_action/createajaxurl.html?groupid='+groupId+'&urlid='+id+'" class="editGroup"><i class="fa fa-pencil" aria-hidden="true"></i></a>'+	
					'</div>'+
				'</div>'
			
		})
		document.getElementById("domainGroup").innerHTML = domainList;
		
		deletebtns = document.getElementsByClassName("delete-btn")
		for(i=0;i<deletebtns.length;i++){
			let ele = deletebtns[i];
			ele.onclick = function(){
				let id=ele.dataset.id;
				
				var confirmed = window.confirm("Are you sure you want to delete this?")
				
				if(!confirmed)return;
				
				chrome.storage.local.get(["ajaxGroupData"+groupId], function(result) {
					urls = result['ajaxGroupData'+groupId] || {}
					delete urls[parseInt(id)]
					
					var jsonObj = {};
					jsonObj["ajaxGroupData"+groupId] = urls;
					chrome.storage.local.set(jsonObj, function() {
						window.location.reload();
					});
				})
			}
		}
		
	});