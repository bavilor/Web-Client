/*Send public key to the server: ArrayByffer -> Uint8Array -> String.fromCharCode(Uint8Array[i]) ->
btoa -> string.charCodeAt(i) -> JSON.stringify
*/

function transformPublicKey (publicKeyArrayBuffer){
			var str = arrayBuffer2String(publicKeyArrayBuffer);
			b64str = btoa(str);
			return string2Uint8Array(b64str);
}

function objArr2Buffer(array){
  var buf = new ArrayBuffer(array.length);
  var bufView = new Uint8Array(buf);

  for(var i = 0; i < array.length; i++){
    bufView[i] = array[i];
  }
  return buf;
}

function arrayBuffer2String(arrayBuffer) {
  var str = '';
  var bytes = new Uint8Array(arrayBuffer);

  for (var i = 0; i < bytes.byteLength; i++) {
      str += String.fromCharCode(bytes[i]);
  }
  return str;
}

function string2ArrayBuffer(string) {
  var buf = new ArrayBuffer(string.length); 
  var bufView = new Uint8Array(buf);

  for (var i=0; i < string.length; i++) {
    bufView[i] = string.charCodeAt(i);
  }
  return buf;
}

function string2Uint8Array(string){
	var uint8 = new Array();

	for (var i=0; i < string.length; i++) {
    	uint8[i] = string.charCodeAt(i);
 	}
 	return uint8;
}

function Order(name, price, amount){
	this.name = name;
	this.price = price;
	this.amount = amount;
}

function generateOrderList(order){
	let list = new Array();

	for(var i = 0; i < order.length; i++){
		if(order[i].amount !== "0"){
			list[list.length] = order[i];	
		}
	}
	return list;
}

function uniteArrays(wrappedAes, encrIv, encrData){
	let wrappedAes8 = new Uint8Array(wrappedAes);
	let encrIv8 = new Uint8Array(string2ArrayBuffer(encrIv));
	let encrData8 = new Uint8Array(encrData);
	let result = new Array();

	let lenghtWithData = 512 + encrData8.length;


	for(var i = 0; i < 256; i++){
		result[i] = wrappedAes8[i];
	}

	for(var i = 256; i < 512; i++){
		result[i] = encrIv8[i - 256];
	}

	for(var i = 512; i < encrData8.length + 512; i++){
		result[i] = encrData8[i - 512];
	}

	return arrayBufferToString(objArr2Buffer(result));
}

function uniteArraysForUpdate(wrappedAes, encrIv, encrData, sign){
	
	let wrappedAes8 = new Uint8Array(wrappedAes);
	let encrIv8 = new Uint8Array(string2ArrayBuffer(encrIv));
	let encrData8 = new Uint8Array(encrData);

	let result = new Array();

	let aesIvDataLength  = encrData8.length + 512;

	for(var i = 0; i < 256; i++){
		result[i] = wrappedAes8[i];
	}

	for(var i = 256; i < 512; i++){
		result[i] = encrIv8[i - 256];
	}

	for(var i = 512; i < aesIvDataLength; i++){
		result[i] = encrData8[i - 512];
	}

	for(var i = aesIvDataLength; i < aesIvDataLength + 256; i++){
		result[i] = sign[i - aesIvDataLength];
	}
	return arrayBufferToString(objArr2Buffer(result));
}

function getOrder(encrAES, encrIV, encrData, privateKey){
	var secretKey;
	
	return getAESFromResponse(encrAES, privateKey)
	.then(result => {
		secretKey = result;	
		return decryptRsaData(encrIV, privateKey);
	})
	.then(result => {
		return decryptAesData(secretKey, result, encrData);
	})
	.then(result => {
		return arrayBufferToString(result);
	})
}