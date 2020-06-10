//	This script is made to automaticaly apply a watermark to any images uploaded to discord.
//	API URL = https://discord.com/api/v6/channels/*/messages
//  Domain Group = discord.com


// When uploading an image to discord you must say this phrase for it to apply the watermark to the image.
// Leave blank "" to always have a watermark.
const ENABLE_WATERMARK_KEYWORD = ":wm:";

// The watermark to be drawn to the image.
const WATERMARK_TEXT = "Made by ____";

// The mimetype the image will be uploaded as. 
// Use image/jpeg with a higher compression if you encounter problems with file size.
const OUTPUT_MIME_TYPE = "image/png";

// used for jpeg compression. Choose a value between 0-1 
const OUTPUT_COMPRESSION = 1;

// The filename that discord will save it as.
const OUTPUT_FILENAME = "image.png";


async function onFilterMatch(request){
	if(request.body instanceof FormData && request.body.get("content").indexOf(ENABLE_WATERMARK_KEYWORD) != -1){
		var content = request.body.get("content");
		content = content.replace(ENABLE_WATERMARK_KEYWORD,"");
		request.body.set("content",content)
	    var file = request.body.get('file');
		if(file.type == "image/png" || file.type == "image/jpg" || file.type == "image/jpeg"){
			var bs = await toBase64(file);
			var newImage = await drawTextOnImage(bs,WATERMARK_TEXT)
			request.body.set("file",newImage);
		}
	}
	return request;	
}

const toBase64 = file => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => resolve(reader.result);
	reader.onerror = error => reject(error);
});

function drawTextOnImage(bs,text){
	return new Promise(function(resolve){
		canvas = document.createElement("canvas")
		ctx = canvas.getContext('2d');
		canvas.width = 100;
		canvas.height = 100;
		
		var img = new Image;
		img.onload = function(){
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 3, 3);
			ctx.font = "15pt Verdana";
			
			ctx.fillStyle = "red";
			ctx.fillText(text,5,20);
			resolve(dataURLtoFile(canvas.toDataURL(OUTPUT_MIME_TYPE,OUTPUT_COMPRESSION),OUTPUT_FILENAME))
		}
		img.src = bs;
		
	})

}

function dataURLtoFile(dataurl, filename) {
	var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
	bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	while(n--){
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, {type:mime});
}























 <meta http-equiv="Content-Security-Policy" content="object-src 'self' blob:"/>