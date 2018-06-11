var publicUserKey;
var privateUserKey;

//Request data
function requestProductList(url, b64UPK, privateKey){
 	let aes;

	return requestGET(url, b64UPK)  //request data
	.then(response => {
	    bufferData = string2ArrayBuffer(atob(response)); //read aes key
	    return getAESFromResponse(bufferData.slice(0, 256), privateKey);
	})
	.then(restoredAes => {
	    aes = restoredAes; 
	    return decryptRsaData(bufferData.slice(256, 512), privateKey); //read iv
	})
	.then(iv => {
	    return decryptAesData(aes, iv,bufferData.slice(512)); //read data
	})
	.then(decryptedData => {
	  	return JSON.parse(arrayBufferToString(decryptedData)); //restore data
	});
}

//Requst server public key
function requestServerPublicKey(url, b64UPK){
	var response;
	var responseSecretKey;

	return requestGET(url, b64UPK)
	.then(b64response => {
		response = string2ArrayBuffer(
			atob(
				b64response));

		return getAESFromResponse(response.slice(0,256), currentKeyPair.privateKey);
	})
	.then(aes => {
		responseSecretKey = aes;
		return decryptRsaData(response.slice(256, 512), currentKeyPair.privateKey);
	})
	.then(iv => {
		return decryptAesData(responseSecretKey, iv, response.slice(512, response.length));
	})
	.then(decrRsa => {
		return importPSK(decrRsa);
	})
	.catch(error => {
		console.error(error);
	})
}

//request orders
function requestOrders(url, b64UPK, privateKey){
	var position = 0;
	var stringOrders;
	var secretKey;
	var encrOrders;

	requestGET(url, b64UPK)  //request data
	.then(response => {
	    return string2ArrayBuffer(atob(response)); //read aes key    
	})
	.then(orders => {
		encrOrders = orders;
		func();	
		function func(){
			var encrAES = encrOrders.slice(position, position + 256);
			var encrIV = encrOrders.slice(position + 256, position + 512);
			var length;
				
			decryptRsaData(encrOrders.slice(position + 512, position + 768), privateKey)
			.then(decrLength => {
				length = parseInt(arrayBufferToString(decrLength));

				var encrData = encrOrders.slice(position + 768, position + 768 + length);

				position = position + 768 + length;
				var x;
				for(var i = 0; i < allKeyPairs.length; i++) {
					getOrder(encrAES, encrIV, encrData, allKeyPairs[i].privateKey)
					.then(result => {
						console.log(typeof(result));
						stringOrders += ", " + result;
						console.log(stringOrders);
					})	
				}
				
				if(position < encrOrders.byteLength){
					func()
				}
			})		
		}		
	})

	console.log(stringOrders);
}

//Send data
function sendData(list, url, encodedUPK, serverPublicKey, update){
	let iv = window.crypto.getRandomValues(new Uint8Array(16));
	let secretKey;
	let encryptedData;
	let encryptedIv;

	let sign;
	let privateRsaPssKey;
	let publicRsaPssKey;
	let expRsaPss;

	return generateAesKey().then(aes => {
		secretKey = aes;
		return encryptAesData(aes, iv, string2ArrayBuffer(JSON.stringify(list)));
	})
	.then(encrData => {
		encryptedData = encrData;
		return encryptRsaData(objArr2Buffer(iv), serverPublicKey);
	})
	.then(encrIv => {
		encryptedIv = encrIv;
		return wrapAesKey(secretKey, serverPublicKey);
	})
	.then(wrappedAes => {
		var result;
		if(!update){
			var data = btoa(uniteArrays(wrappedAes, encryptedIv, encryptedData));
			result = requestPOST(url, data, encodedUPK);
		}else{
			generateRsaPss()
			.then(key => {
				privateRsaPssKey = key.privateKey;	
				return exportRsaPss(key.publicKey);
			})
			.then(exportedRsaPss => {
				expRsaPss = exportedRsaPss;
				return signingData(privateRsaPssKey, signSession);
			})
			.then(signedData => {
				var data = btoa(uniteArraysForUpdate(wrappedAes, encryptedIv, encryptedData, signedData));
				return requestPOST(url, data, encryptedUserSession,btoa(arrayBufferToString(expRsaPss)));
			})
		}
	
		return result;
	})
	.catch(error => {
		console.error(error);
	})
}

//GET request
function requestGET(url, b64UPK){
  	console.log("GET request");
  	return $.ajax({
    	type: 'GET',
    	url: url,
    	beforeSend: request => {
      		request.setRequestHeader('key', b64UPK);
    	}
  	})
  	.then(response => {
    	return response;
  	})
  	.catch(err => {
    	console.error(err);
  	});
}

//POST request
function requestPOST(url, data, encodedUPK, rsaPssKey){
  	console.log("POST request");

  	return $.ajax({
    	type: 'POST',
    	contentType:'application/json',
    	url: url,
    	beforeSend: request => {
      		request.setRequestHeader('key', encodedUPK);
      		request.setRequestHeader('rsaPssKey', rsaPssKey);
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