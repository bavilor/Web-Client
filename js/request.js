var publicUserKey;
var privateUserKey;

//Generate key pair
function setKeyPair(){
	return generateKeys()
	.then(keyPair => {
		console.log("Keys're generated");
		return keyPair;
	})
}


//Request data
function requestData(url, b64UPK, privateKey){
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

//Send data
function sendData(list, url, encodedUPK, update){
	let aes;
	let encryptedData;
	let iv = window.crypto.getRandomValues(new Uint8Array(16));
	let encryptedIv;
	let sign;
	let privateRsaPssKey;
	let publicRsaPssKey;
	let expRsaPss;

	generateAesKey().then(aesKey => {
		aes = aesKey;
		return aesKey;
	})
	.then(aesKey => {
		return encryptAesData(aes, iv, string2ArrayBuffer(JSON.stringify(list)));
	})
	.then(encrData => {
		encryptedData = encrData;
		return encryptRsaData(objArr2Buffer(iv));
	})
	.then(encrIv => {
		encryptedIv = encrIv;
		return wrapAesKey(aes, publicServerKey);
	})
	.then(wrappedAes => {
		if(!update){
			var data = btoa(uniteArrays(wrappedAes, encryptedIv, encryptedData));
			return requestPOST(url, data, encodedUPK);
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
	})
	.then(response => {
			
	})
}

//GET request
function requestGET(url, b64UPK){
  	console.log("get request");
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
  	console.log("post request");
  	return $.ajax({
    	type: 'POST',
    	contentType:'application/json',
    	url: url,
    	beforeSend: request => {
      		request.setRequestHeader('key', encodedUPK);
      		request.setRequestHeader('rsaPssKey', rsaPssKey);
    	},
    	data: data
  	})
  	.then(response => { 
    	return response;
  	})
  	.catch(err => {
    	console.error(err);
  	});
}