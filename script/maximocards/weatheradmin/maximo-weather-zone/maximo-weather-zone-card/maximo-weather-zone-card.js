/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-weather-zone-card',
	
  	behaviors: [BaseComponent],
  	
  	listeners: {},
  	
    properties: {
    	
    	/**
    	 * inspection form record
    	 */
    	record: {
    		type: Object
    	}
    	
    	
	},
	
	_processZoneRegistry: function(e){
		e.stopPropagation();
		if (this.record !== undefined && e.detail !== this.record.isregistered){
			$M.toggleWait(true);
			var upd = this.domHost.$.registerResource;
			var reg = e.detail;
			var url = this.record.href + "?action=wsmethod:processAssetsRegistry&actioncode=";
			if (reg === true){
				url = url + "Add";
			}
			else{
				url = url + "Delete";
			}
			this.domHost.set('registerResourceUri',url);

			upd.loadRecord().then(function(result){
				if (reg){
	        		$M.notify(this.localize('uitext','weatheradmin','ZoneRegisterConfirm'), $M.alerts.info);
				}
				else{
	        		$M.notify(this.localize('uitext','weatheradmin','ZoneUnRegisterConfirm'), $M.alerts.info);
				}
			}.bind(this), function(error) {
				e.stopPropagation();
				this.$.checkbox.checked = this.record.isregistered;
			}.bind(this));
		}

	},
	_getChecked: function(record){
		  return record.isregistered;
	  }, 
	_delete: function(e){
		if (this.record !== undefined){
			e.stopPropagation();
			if (this.record.isregistered === true){
				$M.confirm($M.localize('uitext', 'weatheradmin', 'UnregisterFirst'));
			}
			else{
			    $M.confirm($M.localize('uitext', 'weatheradmin', 'ZoneDeleteConfirm'),this._handleRecordDelete, this, 1, [0,1]);
			}
		}
	},
	_handleRecordDelete: function(callback){
		if (callback === true){
			$M.toggleWait(true);
			this.domHost.$.dataresource.deleteRecord(this.record.href)
	        	.then(function(result){
	        		this.domHost.$.weatherzone.refreshPage(1);
	        		$M.notify(this.localize('uitext','weatheradmin','ZoneDeleted'), $M.alerts.info);
	    			$M.toggleWait(false);
	        }.bind(this));
		}
	},
	
	_handleRecordDataError: function(e)
	{
		this.refresh();
		$M.showResponseError(e.detail);
	},
	_editZone: function(e){
		$M.showDialog(this, 'editzone', $M.localize('uitext','weatheradmin','EditWeatherZone', null), 'maximo-weather-add-zone', false, null, {'parentRecord':this.record, 'isCard': true, 'updateMode':'Update', 'schema':this.schema});
	},

	_stopTap: function(e){
		e.stopPropagation();
	}
});
