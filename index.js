var webclient = new Vue({
	el:'#web-client',

	components: {
		'custom-table' : tableComponent,
	},

	data:function(){
		return {
			productList: [],
			disabledSendUpdButton: true, 
			currentKeyPair: undefined,
			b64RsaPublicKey: String, 
			allKeyPairs: []
		}
	},

	methods:{
		clickMakeOrder: function(){
			var isEmpty = true;
			var orderList = [];

			for(var i = 0; i < this.productList.length; i++){
				if(this.productList[i].amount !== 0){
					isEmpty = false;
					break;
				}
			}

			if(!isEmpty){
				var orderListIndex = 0;

				for(var i = 0; i < this.productList.length; i++){
					if(this.productList[i].amount !== 0){
						orderList[orderListIndex] = this.productList[i];
						orderListIndex++;
					}
				}

				this.requestServerPublicKey()
				.then(serverPublicKey => {
					return this.encryptData(serverPublicKey, orderList);
				})
				.then(encryptedOrderList => {
					return requestPOST(
						'http://localhost:8080/setOrder',
						 btoa(arrayBuffer2String(encryptedOrderList)),
						 b64RsaPublicKey, 
						 undefined)
				})
				.then(responseCode => {
					if(responseCode === 200){
						alert('The order was send.');
						this.totalPrice = 0;

						for(var i = 0; i < this.productList.length; i++){
							if(this.productList[i].amount !== 0){
								this.totalPrice += this.productList[i].amount * this.productList[i].price;
								this.productList[i].amount = 0;
							}				
						}
					}
					this.disabledSendUpdButton = true; 	
				})	
			}else{
				alert('The order is empty!');
			}	
		},
		clickRequestOrderList: function(){
			var self = this;
			var encrResponse;
			var pos = 0;
			var length;
			var encrAesKey;
			var encrIv;
			var encrOrder;
			var keyIndex = 0;
			var decrOrders = '';

			requestGET(b64RsaPublicKey, 'http://localhost:8080/getOrder')
			.then(ecnrOrdersList => {
				encrResponse = string2ArrayBuffer(atob(ecnrOrdersList));

				var p = new Promise((resolve, reject) => {
					resolve(rep());

					function rep(){
						return decryptRsaData(encrResponse.slice(pos+512, pos+768), currentKeyPair.privateKey)
						.then(decrlength => {
							length = parseInt(arrayBuffer2String(decrlength));

							encrAesKey = encrResponse.slice(pos, pos+256);
							encrIv = encrResponse.slice(pos+256, pos+512);
							encrOrder = encrResponse.slice(pos+768, pos+768+length);

							return self.decryptData(encrAesKey, encrIv, encrOrder, allKeyPairs[keyIndex].privateKey);
						})
						.then(order => {
							if(order !== undefined){
								decrOrders += arrayBuffer2String(order);
							}
							if(keyIndex < allKeyPairs.length-1){
								keyIndex++;
								return rep();
							}else if (pos+768+length < encrResponse.byteLength){
								keyIndex = 0;
								pos += 768+length;
								return rep();
							}else{
								return decrOrders;
							}	
						})
					}
				})
				return p;
			})
			.then(orders => {
				var orderList = JSON.parse(orders.replace(/\]\[/g, ","));

				for(var i=0; i<this.productList.length; i++){
					this.productList[i].amount = 0;	
					for(var j=0; j<orderList.length; j++){
						if(this.productList[i].name === orderList[j].name){
							this.productList[i].amount += orderList[j].amount;
						}
					}
				}
				this.disabledSendUpdButton = false;
			})
		},
		clickCreateKeyPair: function(){
  			generateRsaKeyPair()
			.then(rsaKeyPair => {
				writeKeyPair(rsaKeyPair);
				this.prepareKeys();
			})
  		},
  		clickRequestProductList: function(){
  			return this.requestProductList()
			.then(products => {
				var buffer = new Array();
				//don't work without buffer (with productList)
				for(var i = 0; i < products.length; i++){
					buffer[i] = new Order(products[i].name, products[i].price, 0);
				}
				this.productList = buffer;	
			})
			this.disabledSendUpdButton = true; 
  		},
  		clickSendUpdOrder: function(){
  			this.createSignedRequest(this.productList, "http://localhost:8080/updateOrder")
  			.then(responseCode => {
  				console.log(responseCode);

  				if(responseCode === 200){
					alert('The update order was send.');
					this.totalPrice = 0;

					for(var i = 0; i < this.productList.length; i++){
						this.productList[i].amount = 0;			
					}

					this.createExportedPublicKeysArray()
					.then(exportedPublicKeysArray => {
						return this.createSignedRequest(exportedPublicKeysArray, "http://localhost:8080/deleteUsers");
					})
					.then(responseCode => {
						console.log(responseCode);
					})
				}
				this.disabledSendUpdButton = true;
  			})
  		},
  		prepareKeys: function(){
  			return readKeyPairs()
			.then(rsaKeyPairs => {
				if(rsaKeyPairs.length !== 0){
					console.log("Keys're checked");
					currentKeyPair = rsaKeyPairs[rsaKeyPairs.length-1];
					allKeyPairs = rsaKeyPairs;

					return exportPublicRsaKey(currentKeyPair.publicKey)
					.then(publicKeyArrayBuffer => {
						b64RsaPublicKey = JSON.stringify(transformPublicKey(publicKeyArrayBuffer));
						console.log("Key is exported");
					})	
				}else{
					this.createKeyPair();
				}
			})	
  		},
  		requestProductList: function(){
  			var encrResponse;

			return requestGET(b64RsaPublicKey, 'http://localhost:8080/getProducts')
			.then(encrProductList => {	
				encrResponse = string2ArrayBuffer(atob(encrProductList));

				return this.decryptData(
					encrResponse.slice(0,256), 
					encrResponse.slice(256,512), 
					encrResponse.slice(512,encrResponse.length), 
					currentKeyPair.privateKey)
			})
			.then(priceList => {
				return JSON.parse(arrayBuffer2String(priceList));
			})
  		},
  		decryptData: function(encrAes, encrIv, encrData, privateKey){
			var aes;

			return restoreAesKey(encrAes, privateKey)
			.then(decrAes => {
				aes = decrAes;
				return decryptRsaData(encrIv, privateKey);
			})
			.then(iv => {
				return decryptAesData(aes, iv, encrData);
			})
		},
		requestServerPublicKey: function(){
			return requestGET(b64RsaPublicKey, 'http://localhost:8080/getServerPublicKey')
			.then(encodedServerPublicKey => {
				return  importRsaPublicKey(string2ArrayBuffer(atob(encodedServerPublicKey)));
			})
		},
		encryptData: function(serverPublicKey, orderList){
			var iv = window.crypto.getRandomValues(new Uint8Array(16));
			var aesKey;
			var encrOrderList;
			var encrIv;
			var encrAesKey;

			return generateAesKey()
			.then(genAesKey => {
				aesKey = genAesKey;
				return encryptAesData(aesKey, iv, string2ArrayBuffer(JSON.stringify(orderList)));
			})
			.then(encryptedOrderList => {
				encrOrderList = new Uint8Array(encryptedOrderList);
				return encryptRsaData(serverPublicKey, iv);
			})
			.then(encryptedIv => {
				encrIv =  new Uint8Array(encryptedIv);
				return wrapAesKey(aesKey, serverPublicKey);
			})
			.then(encrAes => {
				encrAesKey = new Uint8Array(encrAes);
				var order =  new Uint8Array(encrAesKey.length + encrIv.length + encrOrderList.length);
				
				order.set(encrAesKey);
				order.set(encrIv, encrAesKey.length);
				order.set(encrOrderList, encrAesKey.length + encrIv.length);

				return order;
			})
		},
  		prepareSign: function(singData){
  			var rsaPssKey;
  			var signedData;

  			return generateRsaPss()
  			.then(rsaPss => {
  				rsaPssKey = rsaPss;
  				return signingData(rsaPssKey.privateKey, string2ArrayBuffer(singData));
  			})
  			.then(signed => {
  				signedData = signed;
  				return exportRsaPss(rsaPssKey.publicKey);
  			})
  			.then(exportedRsaPss => {
  				var expordedRsaPssKey = JSON.stringify(transformPublicKey(exportedRsaPss));

  				return {
  					expordedRsaPssKey,
  					signedData
  				}
  			})
  		},
  		createExportedPublicKeysArray: function(){
  			var keyIndex = 0;
  			var keysArray = [];

  			var p = new Promise((resolve, reject) => {
				resolve(rep());

				function rep(){
					return exportPublicRsaKey(this.allKeyPairs[keyIndex].publicKey)
					.then(publicKeyArrayBuffer => {
						keysArray[keyIndex] =  btoa(arrayBuffer2String(publicKeyArrayBuffer))
						keyIndex++;

						if(keyIndex < this.allKeyPairs.length-1){
							return rep();
						}else{
							return keysArray;
						}
					})		
				}
			})
			return p;
  		},
  		createSignedRequest: function(dataArray, url){
  			var ecnryptedData;
  			var serverPublicKey;

  			return this.requestServerPublicKey()
  			.then(spk => {
  				serverPublicKey = spk;
  				return this.encryptData(serverPublicKey, dataArray);
  			})
  			.then(encrData => {
  				ecnryptedData = encrData;
  				return this.prepareSign('key');
  			})
  			.then(pssData => {
  				var sign = new Uint8Array(pssData.signedData);
				var order =  new Uint8Array(ecnryptedData.length + sign.length);
				
				order.set(ecnryptedData);
				order.set(sign, ecnryptedData.length);

				return requestPOST(
					url, 
					btoa(arrayBuffer2String(order)),
					b64RsaPublicKey,
					pssData.expordedRsaPssKey)
  			})
  		}
	},

	created: function(){
		this.prepareKeys()
		.then(empty => {
			return this.requestProductList();
		})
		.then(products => {
			var buffer = new Array();
			//don't work without buffer (with productList)
			for(var i = 0; i < products.length; i++){
				buffer[i] = new Order(products[i].name, products[i].price, 0);
			}
			this.productList = buffer;	
		})
	}
})	