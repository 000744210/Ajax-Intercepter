function getQueryParameter(parameter) {
	return (window.location.href.split(parameter + '=')[1].split('&')[0]);
}

function makeUL(array) {
    // Create the list element:
    var list = '<ul class="logged-param-list">'

    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = '<li>';
        item += array[i];
		item +=  "</li>";
		
		list += item;
        // Add it to the list:
    }
	list += "</ul>"

    // Finally, return the constructed list:
    return list;
}


var groupId =  parseInt(getQueryParameter("groupid"));
document.getElementById("backBtn").href = "/src/page_action/editgroup.html?groupid=" + groupId



chrome.storage.local.get(["ajaxLoggerData"+groupId], function(result) {
	urls = result['ajaxLoggerData'+groupId] || {}

	domainList = "";
	
	Object.entries(urls).forEach((url)=>{	
		
		
		
		domainList += 
			'<div class="wordListContainer">'+
				'<div class="groupTitle" style="height:21px">'+
					'<div class="groupHeader"><div style="line-height: 14px;width: 302px;height: 28px;font-size: 2.5vh;word-break: break-all;">'+url[0]+'</div></div>'+
					'<a href="/src/page_action/createajaxurl.html?groupid='+groupId+'&displayurl='+url[0]+'" class="editGroup"><i class="fa fa-check" aria-hidden="true"></i></a>'+	
				'</div>'+
				'<div>'+
					makeUL(url[1]) +
				'</div>'+
			'</div>'
	})
	document.getElementById("domainGroup").innerHTML = domainList;
})