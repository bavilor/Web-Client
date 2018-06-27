var inputAmountComponent = Vue.component('input-amount', {
	props: {
		record : Object
	},
	template: 
		`
		<input type=number min=0 v-model=record.amount @keypress=checkCorrectKey>
		`,
	methods: {
		checkCorrectKey: function(event){
			if(event.charCode < 48 || event.charCode > 57){
				event.returnValue = false;
			}
		}
	}
})