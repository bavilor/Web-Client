var productsURL = 'http://localhost:8080/getProducts';
var sendOrderURL = 'http://localhost:8080/setOrder';
var getOrderURL = 'http://localhost:8080/getOrder'
var updOrderURL = "http://localhost:8080/updateOrder"
var encodedUPK;
var bufferData = '';
var keys;



function genKeysWrite2DB(){
	return generateKeys()
	.then(keyPair => {
		writeKeyPair("write", keyPair);
		console.log("OK2");
	})
}

//Main VUE
var webclient = new Vue({
	el:'#webclient',
	data:{
		totalPrice: 0,
		sended: false,
		tableData: String,
		disabledUpdButton: true,
		disabledSendUpdButton: true,
		isKeys: false
	},
	methods:{
		getProductList: function(){
			generateKeys()
			.then(keyPair => {
				return writeKeyPair(keyPair);
				
			})
			.then(keyPairs =>{
				console.log(4)
				console.log(keys);
			})
			.then(userPublicKey => {
				return exportUPK(userPublicKey);				
			}) 
			.then(exportedUPK => {
				let uint8 = btoa(arrayBufferToString(exportedUPK));
				uint8 = string2Uint8Array(uint8);
				uint8 = JSON.stringify(uint8);
				encodedUPK = uint8;
				return encodedUPK;
			})
			.then(b64UPK => {
				return requestData(productsURL, b64UPK, userPrivateKey);
			})
			.then(resp => {
				let arr = new Array();
				for(let i = 0; i < resp.length; i++){
					arr[i] = new Order(resp[i].id, resp[i].name, resp[i].price, "0")
				}
				this.tableData = arr;
			})
			.catch(err => {
				console.error(err);
			});
		},
		keyPress: function(event) {
	  		if(event.charCode === 45){
	  			event.returnValue = false;
	  		}
  		},
  		makeOrder: function(){
  			this.totalPrice = 0;
  			console.log("Send order");
  			let list = generateOrderList(this.tableData);
  			if(list.length === 0){
  				alert("No data to the order");
  			}else{
  				this.disabledUpdButton = false;
  				sendData(list, sendOrderURL, encodedUPK, false);
  				for(var i = 0; i < list.length; i++){
  					this.totalPrice += (list[i].price * list[i].amount);
  				}
  			}
  			this.sended = true;
  		},
  		getOrderList: function(){
  			if(this.sended){
  				console.log("Update order");
  				requestData(getOrderURL)
  				.then(resp => {
  					for(let i = 0; i < this.tableData.length; i++){
						for(let j = 0; j < resp.length; j++){
							if(this.tableData[i].name == resp[j].name){
								this.tableData[i].amount = resp[j].amount;
							}
						}
					}
  					this.disabledSendUpdButton = false;
  				})
  			}else{
  				alert("Take the order first");
  			}
  		},
  		sendUpdOrder: function(){
  			this.totalPrice = 0;
  			let list = generateOrderList(this.tableData);
  			sendData(list, updOrderURL, true);
  			for(var i = 0; i < list.length; i++){
  				this.totalPrice += (list[i].price * list[i].amount);
  			}
  		}
	},
	created: function(){	
		this.getProductList();		
	}
})
