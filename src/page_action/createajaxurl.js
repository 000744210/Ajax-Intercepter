function getQueryParameter(parameter) {
    try{
        return (window.location.href.split(parameter + '=')[1].split('&')[0]);
    }catch(e){
        return null;
    }
}

var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("codeBox2"),{
	lineNumbers: true,
    mode: "javascript",
	
})

myCodeMirror.setValue(`// intercept the data sent to the server.
async function onRequestDataSend(request)
{
  console.log("Intercepted ", request);
  // Modify the request object here.
  return request;
}

// Intercept the data being returned to the website.
async function onRequestDataReturn(event)
{
  console.log("Intercepted", event);
  // modify the received event object.
  return event;
}

// Called once right before the first ajax call.
async function init()
{
  
}

// Called once right before the page loads.
async function beforePageLoad()
{
  
}

// View more information here: 
// https://github.com/000744210/Ajax-Intercepter`);

var groupId =  parseInt(getQueryParameter("groupid"));
var updateId = getQueryParameter("urlid")
var displayUrl = getQueryParameter("displayurl")
document.getElementById("editGroupUrl").href = "/src/page_action/editgroup.html?id="+groupId

if(updateId!=null){
    chrome.storage.local.get(["ajaxGroupData"+groupId], function(result) {
        var array = result["ajaxGroupData"+groupId]?result["ajaxGroupData"+groupId]:{};
        document.getElementById("domain").value = array[updateId].url;
        document.getElementById("automation").checked = array[updateId].isAutomated;
        myCodeMirror.setValue(array[updateId].code);
        document.getElementById("libBox").value = array[updateId].libs;
        
        updateCodeBox()
    })
}else if(displayUrl){
    document.getElementById("domain").value = displayUrl;
}

document.getElementById("continueBtn").onclick = function(){
    var domainRegex = /^(?:([A-Za-z\*]+):)?(\/{0,3})([0-9.\-A-Za-z\*]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
    
    var url = document.getElementById("domain").value
    
    if(!url.match(domainRegex)){
        alert("Ajax url must be valid. (https://api.google.com/getinfo)")
        return;
    }
    
    chrome.storage.local.get(["ajaxGroupData"+groupId], function(result) {
        var array = result["ajaxGroupData"+groupId]?result["ajaxGroupData"+groupId]:{};

        var nextId;

        if(updateId!=null){
            nextId = parseInt(updateId)
        }else{
            nextId = parseInt(getLargestKey(array))+1
        }
        array[nextId] = {
            url:document.getElementById("domain").value,
            isAutomated: document.getElementById("automation").checked,
            code: myCodeMirror.getValue(),
            libs:document.getElementById("libBox").value
        };
        var jsonObj = {};

        jsonObj["ajaxGroupData"+groupId] = array;
        chrome.storage.local.set(jsonObj, function() {
            window.location.href="/src/page_action/editgroup.html?id="+groupId;
        });
    });
    debugger;
}

function updateCodeBox()
{
    if($("#automation").is(':checked')) {
        $("#automationSection").css("display","block")
    }else{
        $("#automationSection").css("display","none")
        
    }
}

$("#automation").change(updateCodeBox);

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