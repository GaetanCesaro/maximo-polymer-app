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
  is: 'maximo-weather-zone',
  behaviors: [BaseComponent],

	listeners: {
		/**
			Allows us to do another rest call with the appropriate sort type when the table header is clicked.
		**/
		'table-action-clicked':'handleActionClicked'
},
  properties: {
    schema:{
    	type: Object
    },
    zoneToDelete:{
    	type: Object
    },
	/**
	Collection order by, required for collection sorting
	**/
	collectionOrderBy:{
		type: String,
		value: "",
		observer: 'collectionOrderByChanged'
	},
    radiusUOM:{
    	type: String
    },
    recordData:{
		type: Array,
		value: []
	},
	actions:{
		type: Object,
		value: function(){
			return {
				header:{
					width: window.innerWidth/5+ "px"
				},
				list:[
					{
						icon:'Maximo:Edit',
						action: 'editzone',
						style: 'color:#4b8400;height:50px',
						label:$M.localize('uitext','mxapibase','Edit')
					},
					{
						icon:'Maximo:Trash',
						action: 'deletezone',
						label:$M.localize('uitext','mxapibase','Delete')
					},
					{
						action: 'registerzone',
						//label:this._test()
						label:$M.localize('uitext','weatheradmin','Register'),
						labelattribute: 'reglabel_description'
					}
				]
			}
		}
	}
  },

  _handleRecordDataRefreshed: function(e){
//	  this.$.weatherZoneTable.fire('collection-data-refreshed', this.$.weatherzone);
  },
	ready: function(){
		this.$.radiusuomproperty.fetchProperty();
		this._loadTable();
		this.set('selected',0);
		this.set('switchLabel',this.localize('uitext','weatheradmin','Card'));
		this.set('switchIcon','Maximo:Cards');
	},
	_loadTable: function(){
		var self = this;
		this.$.weatherzone.refreshRecords().then(function(data){
			var newCols =
				[
					{'attribute':'zone','title':self.schema.properties.zone.title,'width':window.innerWidth/8 + "px",sortable:true},
					{'attribute':'description','title':self.schema.properties.description.title,'width':window.innerWidth/8+ "px",sortable:true},
					//{'attribute':'groupname','title':self.schema.properties.groupname.title,'width':window.innerWidth/8+ "px",sortable:true},
					{'attribute':'addresscode','title':self.schema.properties.addresscode.title,'width':window.innerWidth/8+ "px",sortable:true},
					{'attribute':'latitudey','title':self.schema.properties.latitudey.title,'width':window.innerWidth/8+ "px",sortable:false},
					{'attribute':'longitudex','title':self.schema.properties.longitudex.title,'width':window.innerWidth/8+ "px",sortable:false},
					{'attribute':'radius','title':self.schema.properties.radius.title,'width':window.innerWidth/8+ "px",sortable:false}
				]
			self.set('columns', newCols);
		});	
	},
	handleActionClicked: function(e){
		var detail = e.detail;

		if(detail.action.action === 'editzone'){
			this._editZone(e);
		}else if(detail.action.action === 'deletezone'){
			this.set('zoneToDelete',e.detail.record);
			this._tableRowDelete(e);
		}else if(detail.action.action === 'registerzone'){
			this.set('zoneToDelete',e.detail.record);
			this._processWeatherZoneRegistry(e.detail.record);
		}

	},
	_handleRadiusUOMRefreshed: function(e)
	{
		if(e.detail)
		{
			var radiusUOM = e.detail;
			if(radiusUOM)
			{
				this.set("radiusUOM", radiusUOM);
			}
			else{
				this.set("radiusUOM", "Miles");
				
			}
		}
	},
	handleActiveCheckboxToggled(){
		console.log(e.detail());
	},
	_save: function(){
		var modified = this.$.weatherZoneTable.getDirtyRecords();
		if (modified.length > 0){
			this.$.weatherzone.createRecord(modified[0]);
		}
//		this.$.weatherzone.createRecordBulk(modified);
//	        .then(function(result){
//	            this.refresh();
//	         }.bind(this));
	},
	_handleRecordDelete: function(callback){
		if (callback === true){
			$M.toggleWait(true);
			this.$.dataresource.deleteRecord(this.zoneToDelete.href)
	        	.then(function(result){
	        		$M.toggleWait(false);
	              this.$.weatherzone.refreshPage(1);
	        	}.bind(this));
		}
//		this.$.weatherzone.createRecordBulk(modified);
	},
	refresh: function(e){
        this.$.weatherzone.refreshPage(1);
	},
	
	_handleRegisterSuccess: function(e){
		$M.toggleWait(false);
	},
	
	_handleRecordDataError: function(e)
	{
		$M.toggleWait(false);
		//$M.notify(e.detail.request.xhr.response.Error, $M.alerts.warn);
		$M.showResponseError(e.detail);
	},
	_processWeatherZoneRegistry: function(record){
		$M.toggleWait(true);
		var selected = record;
		//var selected = record.detail.originator._tableInfo.tableRecord;
		var url = selected.href + "?action=wsmethod:processAssetsRegistry&actioncode=";
		if (selected.isregistered === false){
			url = url + "Add";
		}
		else{
			url = url + "Delete";
		}
		this.set('registerResourceUri',url);

		this.$.registerResource.loadRecord();
		this.refresh();
        this.$.weatherzone.refreshPage(1);
	},
	_unregisterWeatherZone: function(){
		var selected = this.$.weatherZoneTable.getSelectedRecords();
		var url = this.recordData[0].href + "?action=wsmethod:processAssetsRegistry&action=Delete";
		this.set('registerResourceUri',url);

		this.$.registerResource.loadRecord();
	},
	_tableRowDelete: function(e){
		if (e.detail.record !== undefined){
			if (e.detail.record.isregistered === true){
				$M.confirm($M.localize('uitext', 'weatheradmin', 'UnregisterFirst'));
			}
			else{
				e.stopPropagation();
				this.set('zoneToDelete',e.detail.record);
			    $M.confirm($M.localize('uitext', 'weatheradmin', 'ZoneDeleteConfirm'),this._handleRecordDelete, this, 1, [0,1]);
			}
		}
			
//		this.$.weatherZoneTable.fire('table-action-allowed', e);
	},
	collectionOrderByChanged: function(){
		this.$.weatherzone.refreshRecords();
	},
	  _openAddWeatherZoneDialog: function(){
		  this.$.weatherzone.getNewRecordData();
	   },
	   _editZone: function(e){
			$M.showDialog(this, 'editzone', $M.localize('uitext','weatheradmin','EditWeatherZone', null), 'maximo-weather-add-zone', false, null, {'parentRecord':e.detail.record, 'isCard': false, 'updateMode':'Update', 'schema':this.schema});
	  },
	  
	  _handleNewRecord: function(e){
		  var parentRecord = e.detail;
		  $M.showDialog(this, 'addzone', $M.localize('uitext','weatheradmin','AddWeatherZone', null), 'maximo-weather-add-zone', false, null, {'schema':this.schema,'parentRecord':parentRecord, 'updateMode':'Add'});
	   },
	  _switch: function(e){
		  if (this.selected === 0){
			this.set('selected',1);
			this.set('switchLabel',this.localize('uitext','weatheradmin','Table'));
			this.set('switchIcon','Maximo:List');
		  }
		  else{
			this.set('selected',0);
			this.set('switchLabel',this.localize('uitext','weatheradmin','Card'));
			this.set('switchIcon','Maximo:Cards');
			this._loadTable();
		  }
			  
	   }
});
