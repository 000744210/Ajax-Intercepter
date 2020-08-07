// Does a wild card regex comparison to validate if they match.
// wildTest("google.com/search/*/","google.com/search/2346/") -> true
// This implementation of wildcard search is different than the traditional implementation.
// Normally It works like this: wildTest("google.com/search/*","google.com/search/2346/word") -> true
// But in my impelementation the * only reads up to a / eg, .* -> [^/]* so in the case above would return false.
function wildTest(wildcard, str) {
	let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\/$/,''); // regexp escape & remove trailing forward slash
	const re = new RegExp(`^${w.replace(/\*/g,'[^/]*').replace(/\?/g,'.')}/?$`, 'i');
	return re.test(str); // remove last 'i' above to have case sensitive
}

function parseUrl(url) {
	var m = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/),
	r = {
		hash: m[10] || "", // #asd
		host: m[3] || "", // localhost:257
		hostname: m[6] || "", // localhost
		href: m[0] || "", // http://username:password@localhost:257/deploy/?asd=asd#asd
		origin: m[1] || "", // http://username:password@localhost:257
		pathname: m[8] || (m[1] ? "/" : ""), // /deploy/
		port: m[7] || "", // 257
		protocol: m[2] || "", // http:
		search: m[9] || "", // ?asd=asd
		username: m[4] || "", // username
		password: m[5] || "" // password
	};
	if (r.protocol.length == 2) {
		r.protocol = "file:///" + r.protocol.toUpperCase();
		r.origin = r.protocol + "//" + r.host;
	}
	r.href = r.origin + r.pathname + r.search + r.hash;
	return m && r;
};


// When our extension loads in, we reload every tab that needs to be intercepted.
// Chrome prioritizes loading a webpage rather than waiting for all extensions to load in.
chrome.storage.local.get(["domainGroupData"], function (result) {
	domainGroups = result['domainGroupData'] || {}
	
	chrome.tabs.query({}, function(tabs){
		tabs.forEach(tb => {
			var tabHostname = parseUrl(tb.url).hostname
			for(entry of Object.entries(domainGroups)){
				var ajax = entry[1];
				var url = ajax.url;
				
				if(ajax.isRunning && tabHostname.endsWith(url)){
					chrome.tabs.reload(tb.id);
				}
			}
		});
	});
	
});

