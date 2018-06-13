var productsURL = 'http://localhost:8080/getProducts';
var sendOrderURL = 'http://localhost:8080/setOrder';
var getOrderURL = 'http://localhost:8080/getOrder';
var updOrderURL = "http://localhost:8080/updateOrder";
var getSPKURL = "http://localhost:8080/getServerPublicKey";
var deleteURL = "http://localhost:8080/deleteUsers";
var currentKeyPair;
var encodedUPK;

//request product list from server, write keypair to indexed DB
function getProductList(){
	return generateKeys()
	.then(resultKeyPair => {
		currentKeyPair = resultKeyPair;
		return resultKeyPair.publicKey;
	})
	.then(userPublicKey => {
		return exportUPK(userPublicKey);				
	}) 
	.then(exportedUPK => {
		encodedUPK = JSON.stringify(
			string2Uint8Array(
				btoa(
					arrayBufferToString(
						exportedUPK))));
		return encodedUPK;
	})
	.then(b64UPK => {
		return requestProductList(productsURL, b64UPK, currentKeyPair.privateKey);
	})
	.then(resp => {
		let arr = new Array();

		for(let i = 0; i < resp.length; i++){
			arr[i] = new Order(resp[i].id, resp[i].name, resp[i].price, "0")
		}
		writeKeyPair(currentKeyPair);
		readKeyPairs();
		return arr;	
	})
	.catch(err => {
		console.error(err);	
	});
} 

//send order list
function sendOrderList(tableData){
  	var list = generateOrderList(tableData);
  	var totalPrice = 0;

  	if(list.length === 0){
  		alert("No data to the order");
  	}else{
  		requestServerPublicKey(getSPKURL, encodedUPK)
  		.then(serverPublicKey =>{
  			return sendData(list, sendOrderURL, encodedUPK, serverPublicKey, false);
  		})
  		.then(response => {
  			if(response === 200){
  				for(var i = 0; i < list.length; i++){
  					totalPrice += (list[i].price * list[i].amount);
  				}
  				webclient.totalPrice = totalPrice;
  			}
  		})	
  	}
}

//get all orders 
function getAllOrders(tableData){
  	requestOrders(getOrderURL, encodedUPK, currentKeyPair.privateKey)
  	.then(ordersArray => {
  		for(var i = 0; i < tableData.length; i++){
  			tableData[i].amount = "0";
  			for(var j = 0; j < ordersArray.length; j++){
  				if(tableData[i].name === ordersArray[j].name){
  					tableData[i].amount = parseInt(tableData[i].amount) + ordersArray[j].amount;
  				}
  			}
  		}
  	})
}

function sendUpdOrderList(tableData){
	var totalPrice = 0;
  	var list = generateOrderList(tableData);

  	requestServerPublicKey(getSPKURL, encodedUPK)
  	.then(serverPublicKey => {
  		return sendData(list, updOrderURL, encodedUPK, serverPublicKey, true);
  	})	
  	.then(response => {
  		if(response === 200){
  			for(var i = 0; i < list.length; i++){
  				totalPrice += (list[i].price * list[i].amount);
  			}
  			webclient.totalPrice = totalPrice;

  			exportUPK(currentKeyPair.publicKey)
  			.then(currentExpUPK => {
  				return getEncodedKeys(deleteKeyPairs,btoa(arrayBufferToString(currentExpUPK)));
  			})
  			.then(result => {
  				requestPOST(deleteURL, JSON.stringify(result), encodedUPK);
  				indexedDB.deleteDatabase("KeyStore");
  				writeKeyPair(currentKeyPair);
  				readKeyPairs();
  			})	
  		}
  	})	
}