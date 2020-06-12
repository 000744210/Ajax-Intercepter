
//
//    This script is made to decompress a zlib websocket stream.
//    The following socket is the Discord message stream.     
//
//    Domain Group = discord.com   
//    API Url = wss://gateway.discord.gg/
//
//    Loaded Librarys:
//        https://cdnjs.cloudflare.com/ajax/libs/pako/1.0.11/pako.min.js
//


// We use this to make a global variable only get defined once.
// All code in the textarea is executed every time a match is found. 
// This behaviour may change in the future.
if(!window.inflater){
	window.inflater = new pako.Inflate({to:'string',chunkSize:16384*64});
}

// called everytime we intercept the websocket receiving data.
async function onWebSocketMessageReceived(event){
	
	var before = window.inflater.strm.next_out
	window.inflater.push(event.data,false)
	var after = window.inflater.strm.next_out
	
	var strOutput = ""
	var output = window.inflater.strm.output;

	for(i=before;i<after;i++){
		strOutput += String.fromCharCode(output[i]);
	}
	
	console.log(strOutput)
	
	return event
}