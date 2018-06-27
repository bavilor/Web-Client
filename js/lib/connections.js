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



/*
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
	return requestGET(url, b64UPK)  //request data
	.then(serverResponse => {
	    return string2ArrayBuffer(atob(serverResponse)); //read aes key    
	})
	.then(encryptedData => {		
		var position = 0;
		var keyIndex = 0;
		var len;
		var orders = "";

		var e = new Promise((resolve, reject) => {
			var x = function(){		
				return decryptRsaData(encryptedData.slice(position + 512, position + 768), currentKeyPair.privateKey)
				.then(length => {
					len = parseInt(arrayBufferToString(length));
					console.log(len)
					var encrAES = encryptedData.slice(position, position + 256);
					var encrIV = encryptedData.slice(position + 256, position + 512);
					var encrData = encryptedData.slice(position + 768, position + 768 + len);

					return getOrder(encrAES, encrIV, encrData, allKeyPairs[keyIndex].privateKey);
				})
				.then(order => {
					if(order !== ""){
						deleteKeyPairs[deleteKeyPairs.length] = allKeyPairs[keyIndex].publicKey;
						orders += order;
					}
				
					if(keyIndex < allKeyPairs.length - 1){
						keyIndex++;
						return x();
					}else if (position < encryptedData.byteLength){
						keyIndex = 0;
						position += 768 + len;
						return x();
					}else{
						return orders;
					}	
				})
			}
			resolve(x());
		})
		return e;
	})
	.then(orders => {
		return JSON.parse(orders.replace(/\]\[/g, ","));
	})
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
			return requestPOST(url, data, encodedUPK);
		}else{
			return generateRsaPss()
			.then(key => {
				privateRsaPssKey = key.privateKey;	
				return exportRsaPss(key.publicKey);
			})
			.then(exportedRsaPss => {
				expRsaPss = JSON.stringify(
								string2Uint8Array(
									btoa(
										arrayBufferToString(exportedRsaPss))));

				return signingData(privateRsaPssKey, string2ArrayBuffer("key")); //should use headers!!!
			})
			.then(signedData => {
				var data = btoa(uniteArraysForUpdate(wrappedAes, encryptedIv, encryptedData, signedData));
				return requestPOST(url, data, encodedUPK, expRsaPss);
			})
		}
	})
	.then(response => {
		return response;
	})
	.catch(error => {
		console.error(error);
	})
}

//get deleted keys
function getEncodedKeys(deleteKeys, currentExpUPK){
	var index = 0;
	var keysArray = new Array();
	var keysArrayIndex = 0;

	var e = new Promise((resolve, reject) => {
			var x = function(){		
				return exportUPK(deleteKeys[index])
				.then(exportedKey => {
					var k = btoa(arrayBufferToString(exportedKey));
					if(k !== currentExpUPK){
						keysArray[keysArrayIndex] = k;
						keysArrayIndex++;
					}

					index++;

					if(deleteKeys.length > index){
						return x();
					}else{
						return keysArray;
					}
				})
			}
			resolve(x());
		})
		return e;
}
*/
