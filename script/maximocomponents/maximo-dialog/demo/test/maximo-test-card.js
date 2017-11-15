/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
	is: 'maximo-test-card',
  	behaviors: [BaseComponent],
	properties : {
		testvalue: {
			type: String,
			value: ''
		}
	},
  	created : function(){
  		this.async(function(){
  			this.testvalue = 'this is a really long password value so we can see how it works';
  		},300);
  	},
  	ready : function(){
  		if($M.dialogs.stack.length%2===0){
  			this.$.lorem.label = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
  		}
  	},
  	attached: function(){
  		
  	},
  	showTest: function(){
  		$M.showDialog(null, 'test_dialog'+$M.dialogs.stack.length, 'Test Dialog '+$M.dialogs.stack.length, 'maximo-test-card', false, null);
  	}
});
