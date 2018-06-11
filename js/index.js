var bufferData = '';




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
		tableData: String,
		disabledSendUpdButton: true,
		isKeys: false
	},
	methods:{
		init: function(){
			getProductList()
			.then(data => {
				this.tableData = data;
			});			
		},
		keyPress: function(event) {
	  		if(event.charCode === 45){
	  			event.returnValue = false;
	  		}
  		},
  		makeOrder: function(){
  			sendOrderList(this.tableData);	 			
  		},
  		getOrderList: function(){
  			getAllOrders();
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
		this.init();		
	}
})
