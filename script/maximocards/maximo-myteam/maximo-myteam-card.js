/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
		is: 'maximo-myteam-card',
	  	behaviors: [BaseComponent],
	  	latitude: null,
	  	longitude: null,
	    properties: {
			recordData: {
				type: Object,
				notify: true
			},
			selectedRecord: {
				type: Object,
				notify: true
			},
			woFilterData: {
				type: Object,
				value: null,
				notify: true
			},
			selectedQueryDefaultLabel: {
				type: String,
				notify: true
			},
			selectedQueryName: {
				type: String,
				value: 'futureCardQuery',
				notify: true,
				observer: '_selectedQueryNameChanged'
			},
			selectedAssetTypeLabelDefault: {
				type: String,
				notify: true
			},
	      	
			dynamicAttributeNames: {
				type: Array,
				value: [],
				notify: true
			}     
		 },
	
		
		_handleRecordDataRefreshed: function()
		{
	
		},
		
		_showWODetails: function()
		{
			
		},
		
		_selectedQueryNameChanged : function()
		{
			
		},
		
		created: function(){
			var self = this;
			
			navigator.geolocation.getCurrentPosition(function(position){
				self.latitude = position.coords.latitude;
				self.longitude = position.coords.longitude;
			});
		},
		
	    ready: function(){

	    },
	  
	});
