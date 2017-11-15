/*
 * Licensed Materials - Property of IBM
 *
 * 5724-U18
 *
 * (C) Copyright IBM Corp. 2016,2017 All Rights Reserved
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

	Polymer({
	    is: 'maximo-weather-end-points',
			listeners: {
				/**
					Allows us to do another rest call with the appropriate sort type when the table header is clicked.
				**/
				'register-end-point-change':'_registryLabel'
      },
   		properties: {

				/**
					url for meters list
				**/
				endPointTableData:{
					type: Array,
					value: function(){
						return [];
					}
				},

				active:{
					type: Boolean
				},

		   		parentData: {
		   			type:Object,
					observer: '_registryLabel'
		   		},
				registerLabel:{
					type: String
				},
		   	    schema:{
		   	    	type: Object
		   	    }
	    },

	    behaviors: [BaseComponent],

			/**
				Fetch schema information
			**/
		_registryLabel: function(){
			if (this.parentData !== undefined){
				var reg = this.parentData.isregistered;
				if (reg === false){
					this.set('registerLabel', this.localize('uitext','weatheradmin','Register'));
					this.set('regUnregLabel', this.localize('uitext','weatheradmin','NotRegistered'));
				}
				else{
					this.set('registerLabel', this.localize('uitext','weatheradmin','Unregister'));
					this.set('regUnregLabel', this.localize('uitext','weatheradmin','Registered'));
				}
			}
		},
		_getReadOnly: function(e)
		{
			if (this.parentData !== undefined){
				return this.parentData.isregistered;
			}
		},
		  _handleRecordDataRefreshed: function(e){
			  /*if (this.schema !== undefined && this.schema.properties !== undefined)
			  {
				  //this.set("weatherProductSchema", this.schema.properties.weatherproduct.items);
				  this.set("weatherEndPointSchema", this.schema.properties.weatherendpoint.items);
			  }
			  if (this.recordData !== undefined && this.recordData[0] !== undefined)
			  {
				  //this.set("weatherProductData", this.recordData[0].weatherproduct);
				  this.set('weatherEndPointData',this.recordData[0].weatherendpoint);
				  //this.set("weatherProductUri", this.recordData[0].weatherproduct_collectionref);
				  this.set("weatherEndPointUri", this.recordData[0].weatherendpoint_collectionref);
				  this.set('parentData',this.recordData[0]);
			  }*/
			  console.log(this.parentData);
		  },
		_processEndPointsRegistry: function(){
			var reg = this.recordData.isregistered;
			var url = this.recordData.href;
			if (reg === true){
				url = url + "?action=wsmethod:registryEndPointsForAlerts&register=0";
			}
			else{
				url = url + "?action=wsmethod:registryEndPointsForAlerts&register=1";
			}
			this.set('registerResourceUri',url);

			this.$.registerResource.loadRecord().then(function(refresh){
				this.fire('register-end-point-change');
			}.bind(this));
		},
			//get schema information
			ready: function(){
				  console.log(this);
			}


});
