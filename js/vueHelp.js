var productsURL = 'http://localhost:8080/getProducts';
var sendOrderURL = 'http://localhost:8080/setOrder';
var getOrderURL = 'http://localhost:8080/getOrder';
var updOrderURL = "http://localhost:8080/updateOrder";
var getSPKURL = "http://localhost:8080/getServerPublicKey";
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
  	let list = generateOrderList(tableData);
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
function getAllOrders(){
  	requestOrders(getOrderURL, encodedUPK, currentKeyPair.privateKey)
  	


  /*	.then(resp => {
  		for(let i = 0; i < this.tableData.length; i++){
			for(let j = 0; j < resp.length; j++){
				if(this.tableData[i].name == resp[j].name){
					this.tableData[i].amount = resp[j].amount;
				}
			}
		}
  		this.disabledSendUpdButton = false;
  	})*/
}