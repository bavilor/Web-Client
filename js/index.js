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
  			getAllOrders(this.tableData);
  			this.disabledSendUpdButton = false;
  		},
  		sendUpdOrder: function(){
  			sendUpdOrderList(this.tableData);
  		}
	},
	created: function(){	
		this.init();		
	}
})
