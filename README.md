## Ajax Interceptor
I developed a chrome extension which is designed to make web APIs testing easier. If you've ever developed or needed to test a site which had client-side validation and wanted to test if the server-side validation worked without bypassing the validation code then this extension would be used to perform a modification to the request in real time.

This extension takes advantage of JavaScript's prototyping to override the original functionality of builtin methods to add my code before the execution of the ajax calls.

 Installation
-
Step 1: Get the files

	git clone https://github.com/000744210/Ajax-Intercepter.git
	


Step 2: Enable Developer Mode In Chrome
- Go to chrome://extensions
- Toggle developer mode in the top right.

Step 3: Load The Extension
- Click the "Load unpacked" button.
- Select the root folder and press OK.

  

Guide
-
Click the new extension icon in the toolbar. A popup will appear and click the **+** button to create a domain group.

This will tell the extension that it can run on that domain. The menu will be updated with the domain group.

Click the edit button to create a list of APIs you want the extension to let you intercept and modify.

A dialog box should appear when the website attempts to fetch the API which will let you modify the request.

Tips
-
- Instead of manually writing the API url, have the domain group running and perform an action to activate the API. The API will be logged in the 'Found API' section.
- When an api contains a dynamic url path. Use the * wildcard character to capture it. Example: 
api.example.com/searchid/5236 to api.example.com/searchid/*
- If you want more control or automation of the modification you can use the programming interface to edit the request.

