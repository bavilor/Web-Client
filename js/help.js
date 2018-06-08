/*Send public key to the server: ArrayByffer -> Uint8Array -> String.fromCharCode(Uint8Array[i]) ->
btoa -> string.charCodeAt(i) -> JSON.stringify
*/

//Return arrayBuffer from array object
function objArr2Buffer(objArr){
  var buf = new ArrayBuffer(objArr.length);
  var bufView = new Uint8Array(buf);
  for(var i = 0; i < objArr.length; i++){
    bufView[i] = objArr[i];
  }
  return buf;
}

//Restore string data from arrayBuffer
function arrayBufferToString(arrayBuffer) {
  var str = '';
  var bytes = new Uint8Array(arrayBuffer);
  for (var i = 0; i < bytes.byteLength; i++) {
      str += String.fromCharCode(bytes[i]);
  }
  return str;
}

//Convert string to arrayBuffer
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

//Order object
function Order(id, name, price, amount){
	this.id = id;
	this.name = name;
	this.price = price;
	this.amount = amount;
}

//Generate order list by use the products and amount arrays
function generateOrderList(order){
	let length = order.length;
	let list = new Array();
	var x = 0;
	for(var i = 0; i < length; i++){
		for(var j = x; j < length; j++){
			if(order[j].amount !== "0"){
				list[i] = order[j];
				x = j + 1;
				break;	
			}	
		}
		
	}
	return list;
}

//Unite wrapped aes, encrypted iv and data
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

//Unite wrapped aes, encrypted iv, data, public rsa-pss key and sign
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