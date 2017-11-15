/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-attachments-delete',
  	behaviors: [BaseComponent],
	properties : {
		filename : {
		    type : String
		},
		recordIndex : {
			type : Number
		},
		message : {
			type : String,
			notify : true,
			observer : '_refreshMessage'
		},
		recordData: {
			type : Object,
			notify : true
		}
	},
  	created : function(){
  		console.log('  	created');
  		
  	},
  	ready : function(){
  		console.log('ready');
  		
  		
   	},
  	attached : function(){
  		console.log('attached');
  		$j('.title').css({'color':'#D74006'});
  		$j('.dialogCloseButton').removeClass('dialogCloseButton');
  		$j('#divider').css({'border-bottom': 'none'});
  		$j('.border').removeClass('border');
  		$j('.wrapper').css({'border':'none'});
  		
  	},
  	_refreshMessage : function() {
  		this.$.msg.label = this.message;
  	},
  	_getMessage : function(record) {
		var fileName = record.describedBy.fileName;
		var message = 'Are you sure you want to delete ' + fileName;
		
  		return message;
  	},
  	_confirm : function() {
  		this.fire('delete', {'recordIndex':this.recordIndex, 'filename':this.filename});
  	},
  	_closeDialog : function() {
  		this.hidden = true;
  	},
  	_focusevent : function(e)
  	{
  		console.log('_focusevent');
  	}
});
