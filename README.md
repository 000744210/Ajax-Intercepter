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
- If you want more control or automation of the modification you can use the programming interface to edit the request.

Notes
--
- Any modification to the domain group (adding/editing filter or enabling/disabling domain group) requires refreshing of affected pages to take action.
- If the website is using a FormData object in their request then it will break the prompt by displaying [object FormData] in the body. You would be need to use the advanced automation option to edit the FormData object instead. 


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
