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