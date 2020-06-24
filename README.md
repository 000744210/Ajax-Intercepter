## Ajax Interceptor
I developed a chrome extension which is designed to make web APIs testing easier. If you've ever developed or needed to test a site which had client-side validation and wanted to test if the server-side validation worked without bypassing the validation code then this extension would be used to perform a modification to the request in real time.

This extension takes advantage of JavaScript's prototyping to override the original functionality of builtin methods to add my code before the execution of the ajax calls.

 Installation
--
Step 1: Get the files

	git clone https://github.com/000744210/Ajax-Intercepter.git
	


Step 2: Enable Developer Mode In Chrome
- Go to chrome://extensions
- Toggle developer mode in the top right.

Step 3: Load The Extension
- Click the "Load unpacked" button.
- Select the root folder and press OK.

  

Guide
--
Click the new extension icon in the toolbar. A popup will appear and click the **+** button to create a domain group.

This will tell the extension that it can run on that domain. The menu will be updated with the domain group.

Click the edit button to create a list of APIs you want the extension to let you intercept and modify.

A dialog box should appear when the website attempts to fetch the API which will let you modify the request.

Tips
--
- Instead of manually writing the Domain url, go to the domain you will be running it on. Create a domain group and it will autofill the page's url into the field.
- Instead of manually writing the API url, have the domain group running and perform an action to activate the API. The API will be logged in the 'Found API' section.
- When an API contains a dynamic url path. Use the * wildcard character to capture it. Example: 
api.example.com/searchid/5236 to api.example.com/searchid/*
- If you want more control or automation of the modification you can use the programming interface with the advanced automation option to edit the request.

Notes
--
- Any modification to the domain group (adding/editing filter or enabling/disabling domain group) requires refreshing of affected pages to take action.
- If the website is using a FormData object in their request then it will break the prompt by displaying <kbd>[object FormData]</kbd> in the body. You would need to use the advanced automation option to edit the FormData object instead. 
- Undefined behaviour occures if two or more domain groups execute on the same webpage.

Visual Guide
--
<kbd>
	<div align="center">
		<kbd>
			<img src="https://i.imgur.com/krCAf2Q.png">
		</kbd>
	</div>
	<br><br>
	Created a domain group for discord.com. The domain name should only be the host name. <br>For example "discord.com" not "www.discord.com" or "https://discord.com"
</kbd>
<br><br>
<kbd>
	<div align="center">
		<kbd>
			<img src="https://i.imgur.com/Oq7aL6L.png">
		</kbd>
	</div>
	<br><br>
	Discovered APIs from loading Discord. Clicking the checkmark will load the api into a filter creation page.
</kbd>
<br><br>
<kbd>
	<div align="center">
		<kbd>
			<img src="https://i.imgur.com/U8STeQF.png">
		</kbd>
	</div>
	<br><br>
	Created a filter for the messages API which is used to send a message in a discord server.<br>Advanced Automation option can be used to skip the prompted form and automatically edit the request behind the scenes.
</kbd>
<br><br>
<kbd>
	<div align="center">
		<kbd>
			<img src="https://i.imgur.com/6ch201C.png">
		</kbd>
	</div>
	<br><br>
	When attempting to send a message in the discord server, you will be prompted with a form containing what was about to be sent to discord. Any modification can be made to try and find security flaws or bugs. For example you can see what happens when you try to edit your content message with a message discord's client side validation prevents such as an empty string or change TTS to true.
</kbd>

## Scripting
There are two event functions defined which are used for reading/editing the request data. 

<kbd>onRequestDataSend</kbd> is an interception of the data before it gets sent to the server. The parameter <kbd>request</kbd> contains the event data which is modifiable. The object sent to <kbd>onRequestDataSend</kbd> is different depending on which AJAX method is used to send the request.

This is the list of objects sent to <kbd>onRequestDataSend</kbd> based by the type if request.

- Fetch 

      {
          type : "Fetch",    
          url : "",     // The url of the API.
          options : {}  // The options for the fetch request.
          reject : function() // Drop packet
      }

- XmlHttpRequest

      {
          type : "XmlHttpRequest",  
          args : {},    // The arguments being sent to the API.
          url : "",     // The url of the API.
          method : "",  // GET/POST/PUT/DELETE
          headers : {}, // The headers which are being sent.
          body : ''     // The body which is being sent 
 				          // with the POST/PUT/DELETE request.
          reject : function() // Drop packet
      }
 - Form
    
       {
           type : "Form",
           args : {},    // The arguments being sent to the API.
           url : "",     // The url of the API.
           method : "",  // GET/POST/PUT/DELETE
           reject : function() // Drop packet
       }

- WebSocket

      {
          type : "WebSocket",    
          data : "",
          reject : function() // Drop packet
      }


<kbd>onRequestDataReturn</kbd> is the data the website will be receiving.

This is the list of objects sent to <kbd>onRequestDataReturn</kbd> based by the type of request.

- XmlHttpRequest
	The parameter will contain the XmlHttpRequest object. The object properties are modifiable.
- Fetch
              
      {
	      type: 'Fetch',
          data: "" // body of the fetch data
      }
 - WebSocket
     The parameter will contain a modifiable [Message Event]([https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent)) object.
     The event contains a reject function to drop the packet.


Tips:
- console.log the object to identify what object is passed to the event.