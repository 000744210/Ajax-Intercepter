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

var inflater = new pako.Inflate({to:'string',chunkSize:16384*64});

// called everytime we intercept the websocket receiving data.
async function onRequestDataReturn(event){
	
	var before = inflater.strm.next_out
	inflater.push(event.data,false)
	var after = inflater.strm.next_out
	
	var strOutput = ""
	var output = inflater.strm.output;

	for(i=before;i<after;i++){
		strOutput += String.fromCharCode(output[i]);
	}
	console.log(strOutput)
	
	return event
}