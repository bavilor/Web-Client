function requestGET(b64RsaPublicKey, url){
  	console.log("GET request");
  	return $.ajax({
    	type: 'GET',
    	url: url,
    	beforeSend: request => {
      		request.setRequestHeader('key', b64RsaPublicKey);
    	}
  	})
  	.catch(err => {
    	console.error(err);
  	});
}

//POST request
function requestPOST(url, data, b64RsaPublicKey, b64PssPublicKey){
  	console.log("POST request");
  	return $.ajax({
    	type: 'POST',
    	contentType:'application/json',
    	url: url,
    	beforeSend: request => {
      		request.setRequestHeader("key", b64RsaPublicKey);
      		request.setRequestHeader("sign", b64PssPublicKey);
    	},
    	data: data,
  	})
  	.then(function(xml, textStatus, xhr) {
        return xhr.status;
    })
  	.catch(err => {
    	console.error(err);
  	})  	
}