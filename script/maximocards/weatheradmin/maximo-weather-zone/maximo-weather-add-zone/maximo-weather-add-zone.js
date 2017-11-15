/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-weather-add-zone',
  	behaviors: [BaseComponent],
  	observers:[
  	           '_handleActionMode(updateMode)'
  	           ],
	listeners: {
		/**
			Allows us to do another rest call with the appropriate sort type when the table header is clicked.
		**/
		
	},
    properties: {
    	parentRecord : {
    		type: Object,
    		value: {},
    		notify: true
    	},
    	recordData : {
    		type: Array,
    		value: [],
    		notify: true
    	}
	},
	//get schema information
	ready: function(){
		
		//this.set('availableList', this.availableProducts);
	},
	_save: function(){
		this._processRecordUpdate(true);
//		$M.closeDialog();
	},
	_handleRecordDataError: function(e)
	{
		$M.showResponseError(e.detail);
	},
	_processZoneRegistry: function(){
		var reg = this.parentRecord.isregistered;
		this._processRecordUpdate(false);
//		this.parent._processWeatherZoneRegistry(this.parentRecord);
		var url = this.parentRecord.href + "?action=wsmethod:processAssetsRegistry&actioncode=";
		if (reg === false){
			url = url + "Add";
		}
		else{
			url = url + "Delete";
		}
		this.set('registerResourceUri',url);

		this.$.registerResource.loadRecord().then(function(result){
			if (reg){
				this.set('ConfirmMessage', this.localize('uitext','weatheradmin','ZoneUnregisterConfirm'));
				this.set('ConfirmError', '');
			}
			else{
				this.set('ConfirmMessage', this.localize('uitext','weatheradmin','ZoneRegisterConfirm'));
				this.set('ConfirmError', '');
				$M.closeDialog();
			}
		}.bind(this), function(error) {
			this.set('ConfirmMessage', '');
			this.set('ConfirmError', error.request.xhr.response.Error.message);
		}.bind(this));

	},
	_processRecordUpdate: function(save){
		if (this.updateMode === "Add"){
			if (this.parent.$.weatherzone !== undefined){
				this.parent.$.weatherzone.createRecord(this.parentRecord)
		        .then(function(result){
		        	if (save === true){
		        		$M.closeDialog();
		        	}
				}.bind(this), function(error) {
					this.set('ConfirmMessage', '');
					this.set('ConfirmError', error.request.xhr.response.Error.message);
		         }.bind(this));
			}
		}
		else if (this.updateMode === "Update"){
		
		     if (this.currentAddressCode === undefined || this.currentAddressCode === ''){
					this.set('parentRecord.addresscode',null);
			 }
		
			if (this.$.weatheZoneResource !== undefined){
				this.$.weatheZoneResource.updateRecord(this.parentRecord)
		        .then(function(result){
		        	if (this.isCard === true){
			        	if (this.domHost !== undefined && this.domHost.domHost !== undefined){
			        		this.domHost.domHost.refresh();
			        	}
		        	}
		        	else if (this.parent !== undefined){
		        		this.parent.refresh();
		        	}
		        	if (save === true){
		        		$M.closeDialog();
		        	}
				}.bind(this), function(error) {
					this.set('ConfirmMessage', '');
					this.set('ConfirmError', error.request.xhr.response.Error.message);
		         }.bind(this));
				}
		}
	},
	_cancel: function(){
		$M.closeDialog();
		this.parent.$.weatherzone.refreshPage(1);
	},
	_addressCodeList: function(e){
		var url = this.parentRecord.href + "?action=wsmethod:getServiceAddresses";
		this.set("serviceAddressUri", url);
		this.$.serviceAddressResource.loadRecord().then(function(result){
			console.log(result);
		}.bind(this), function(error) {
			this.set('ConfirmMessage', '');
			this.set('ConfirmError', error.request.xhr.response.Error.message);
		}.bind(this));
	},
	_handleActionMode: function(updateMode){
		if (updateMode !== undefined)
		{
			this.set('updateMode',updateMode);
			if (updateMode === 'Update'){
				this.set('readOnlyKey', true);
				if (this.parentRecord.addresscode === undefined){
					this.set('currentAddressCode', '');
				}
				else{
					this.set('currentAddressCode', this.parentRecord.addresscode);
				}
				var reg = this.parentRecord.isregistered;
				if (reg === true){
					this.set('regReadOnly', true);
					this.set('regReadOnlyAddr', true);
					this.set('regLabel', this.localize('uitext','weatheradmin','unregisterzone'));
					this.set('regIcon', "Maximo:Download");
				}
				else{
					var addressCode = this.parentRecord.addresscode;
					if (addressCode !== undefined && addressCode !== ''){
						this.set('regReadOnly', true);
					}
					else{
						this.set('regReadOnly', false);
					}
					this.set('regReadOnlyAddr', false);
					this.set('regLabel', this.localize('uitext','weatheradmin','registerzone'));
					this.set('regIcon', "Maximo:Upload");
					}
			}
			else{
				this.set('currentAddressCode', '');
				this.set('regReadOnly', false);
				this.set('regReadOnlyAddr', false);
				this.set('readOnlyKey', false);
				this.set('regLabel', this.localize('uitext','weatheradmin','registerzone'));
				this.set('regIcon', "Maximo:Upload");
			}
	        var baseurl = $M.maxauth.baseUri;
			var url = baseurl + "/oslc/service/weatherapi?action=wsmethod:getServiceAddresses";
			this.set("serviceAddressUri", url);
			this.$.serviceAddressResource.loadRecord().then(function(result){
				console.log(result);
				var lst = [];
				lst.push('');
				if (this.parentRecord["addresscode"] !== undefined){
					lst.push(this.parentRecord["addresscode"]);
				}
				for(var i = 0; i < result.member.length; i++){
					if (this.parentRecord["addresscode"] === undefined || this.parentRecord["addresscode"] !== result.member[i].addresscode){
						lst.push(result.member[i].addresscode);
					}
				}
				this.set('addressList', lst.toString());
				this.set('result', result);
			}.bind(this), function(error) {
				this.set('ConfirmMessage', '');
				this.set('ConfirmError', error.request.xhr.response.Error.message);
			}.bind(this));
			
		}
	},
	_onSelectedAddressCodeChange: function(e)
	{
		var value = e.target.value;
		//var rec = this.parentRecord;
		this.set('currentAddressCode',value);
		//var addressCodes = this.result.member;
		if (value === undefined || value === ''){
			this.set('parentRecord.latitudey','');
			this.set('parentRecord.longitudex','');
			this.set('regReadOnly', false);
		}
		else{ 
			for(var i = 0; i < this.result.member.length; i++){
				if (this.result.member[i]["addresscode"] === value){
					this.set('parentRecord.latitudey',this.result.member[i]["latitudey"]);
					this.set('parentRecord.longitudex',this.result.member[i]["longitudex"]);
					if (this.parentRecord.description === undefined || this.parentRecord.description === ''){
						this.set('parentRecord.description',this.result.member[i]["description"]);
					}
					//this.parentRecord["latitudey"] = this.result.member[i]["latitudey"];
					//this.parentRecord["longitudex"] = this.result.member[i]["longitudex"];
					this.parentRecord["addresscode"] = value;
					this.set('regReadOnly', true);
					break;
				}
			}
		}
	}

});
