/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicemanager-solutiondetail-card',
  	behaviors: [BaseComponent],
    properties: {
		record : {
			type: Object,
			notify: true
		},
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('Solution Detail');
   			}
   		}
	},

	ready : function (){
		
	},
	/**
	 * Close Dialog.
	 */
	close : function() {
		UndoBehavior.close.call(this);
	}
});