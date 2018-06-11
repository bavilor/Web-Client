//Inport SPK
function importPSK(data){
  	return window.crypto.subtle.importKey(
    	"spki",
    	data,
    	{
     	name:'RSA-OAEP',
      	hash:{
      	name:'SHA-256'
    	}
  	},
  	false,
  	['encrypt', 'wrapKey'])
  	.then(psk => {
    	return psk;
  	})
 	.catch(err => {
    	console.error(err);
  	});
}

//Generate rsa keys
function generateKeys(){
  return window.crypto.subtle.generateKey(
	{
	    name: 'RSA-OAEP',
	    modulusLength: 2048,
	    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
	    hash: {name: "SHA-256"},
	},
   	true,
   	['encrypt', 'decrypt', 'unwrapKey'])
  	.then(function(keys){
     	return keys;
  	})
  	.catch(err => {
    	console.error(err);
  	});
}

//Export UPK
function exportUPK(publicKey){
  	return window.crypto.subtle.exportKey(
  		'spki',
  		publicKey)
  	.then(data => {
    	return data;
  	})
  	.catch(err => {
    	console.error(err);
  	});
}

//Decrypt data, encr by rsa key
function decryptRsaData(data, privateKey){
  	return window.crypto.subtle.decrypt(
  	{
    	name: 'RSA-OAEP',
  	},
  	privateKey,
  	data)
  	.then (decrData => {
   	 	return decrData;
  	})
  	.catch(err => {
    	console.error(err);
  	}); 
}

//Encrypt data by use server RSA key
function encryptRsaData(data, serverPublicKey){
  	return window.crypto.subtle.encrypt(
  	{
    	name: "RSA-OAEP"
  	},
  	serverPublicKey,
  	data
  	)
  	.then(data => {
    	var x = arrayBufferToString(data);
    	return x;
  	})
  	.catch(err => {
      	console.error(err);
  	});
}

//Restore AES key
function getAESFromResponse(data, privateKey){
  	return window.crypto.subtle.unwrapKey(
    	'raw',
    	data,
    	privateKey,
    {
      	name: 'RSA-OAEP',
      	modulusLength: 2048,
      	publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      	hash: {name: 'SHA-256'}
    },
    {
      	name: 'AES-CBC',
      	length: 128
    },
    false,
    ['decrypt'])
    .then(skey => {
      	return skey;
    })
    .catch(err => {
      	console.error(err);
    });
}

//Decrypt data by use a AES key from server
function decryptAesData(aes, iv, data){
  	return window.crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: iv
    },
    aes,
    data)
  	.then(decrypted => {
    	return decrypted;
  	})
  	.catch(err => {
    	console.error(err);
  	});
}

//Generate AES key
function generateAesKey(){
	return window.crypto.subtle.generateKey(
		{
			name: 'AES-CBC',
			length: 128
		},
		true, 
		['encrypt']
	)
	.then(skey => {
		return skey;
	})
	.catch(err => {
		console.error(err);
	})
}

//Export aes key
function exportAesKey(aes){
	return window.crypto.subtle.exportKey(
		"raw",
		aes
	)
	.then(result => {
		return result;
	})
	.catch(err => {
		console.error(err);
	})
}

//Encrypt by use a aes key
function encryptAesData(skey, iv, data){
	return window.crypto.subtle.encrypt(
		{
			name: 'AES-CBC',
			iv: iv
		},
		skey,
		data
	)
	.then(result => {
		return result;
	})
	.catch(err => {
		console.error(err);
	})
}

//Wrap aes key by rsa server
function wrapAesKey(aes, rsa){
	return window.crypto.subtle.wrapKey(
		"raw",
		aes,
		rsa,
		{
			name: "RSA-OAEP",
			hash: {name: "SHA-256"}
		}
	)
	.then(result => {
		return result;
	})
	.catch(err => {
		console.error(err);
	})
}

//Generate RSA-PSS key
function generateRsaPss(){
	return window.crypto.subtle.generateKey(
    {
        name: "RSA-PSS",
        modulusLength: 2048, 
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"},
    },
    true, 
    ["sign","verify"] 
	)
	.then(function(key){
    	return key;
	})
	.catch(function(err){
	    console.error(err);
	});
}

//Sign data
function signingData(key, data){
	return window.crypto.subtle.sign(
    {
        name: "RSA-PSS",
        saltLength: 128, 
    },
    key,
    data
	)
	.then(signature =>{
	    return new Uint8Array(signature);
	})
	.catch(err => {
	    console.error(err);
	});
}

//Export RSA-PSS
function exportRsaPss(key){
	return window.crypto.subtle.exportKey(
    "spki", 
    key 
	)
	.then (keydata =>{
    	return keydata;
	})
	.catch(err => {
	    console.error(err);
	});
}
