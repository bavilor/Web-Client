var tableComponent = Vue.component('custom-table', {
	components:{
		'input-amount' : inputAmountComponent,
	},
	props: {
		products : Array,
	},
	computed:{
		totalPrice: {
			get: function () {
				var price = 0;
				
				for(var i=0; i<this.products.length; i++){
					price += this.products[i].amount * this.products[i].price;
				}
				return (Math.round(price * 100) / 100 );;
			}
		}
	},
	template: 
		`
		<div>
		    <table align="center">
		  		<thead>
		  			<tr>
		  				<th style="width: 80px;"> Name </th>
		  				<th style="width: 80px;"> Price </th>
		  				<th style="width: 80px;"> Amount</th>
		  			</tr>
		  		</thead>	
		  		<tbody>
					<tr v-for='record in products'>
						<td width="100px" align="center"> {{ record.name }} </td>
						<td width="100px" align="center">  {{ record.price }}</td>
						<td>
							<input-amount v-bind:record="record"> </input-amount>
						</td>
					</tr>
		  		</tbody>
		  	</table>
		  	<p > Total price: {{ totalPrice }} </p>
	  	</div>
	  `
})