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
  is: 'maximo-weather-group',
  behaviors: [BaseComponent],
	listeners: {
		/**
			Allows us to do another rest call with the appropriate sort type when the table header is clicked.
		**/
		'table-row-delete':'_tableRowDelete',
		'table-row-edit':'_editGroup'
	},

  properties: {
    schema:{
    	type: Object
    },
    columns: {
		type: Array,
		value: function(){
			return []
		}
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
						icon:'editor:mode-edit',
						action: 'groupedit',
						label:$M.localize('uitext','mxapibase','Edit')
					},
					{
						icon:'icons:delete',
						action: 'groupdelete',
						label:$M.localize('uitext','mxapibase','Delete')
					}
				]
			}
		}
	},
	collectionOrderBy:{
		type: String,
		value: "",
		observer: 'collectionOrderByChanged'
	}
  },


  ready: function(){
    this.$.weathergroup.refreshRecords();
  },
  _openAddWeatherGroupDialog: function(){
		$M.showDialog(this, 'addgroup', $M.localize('uitext','weatheradmin','AddWeatherGroup', null), 'maximo-weather-add-group', false, null, {'queryName':'allProducts'});
   },
   _editGroup: function(record){
		$M.showDialog(this, 'editgroup', $M.localize('uitext','weatheradmin','EditWeatherGroup', null), 'maximo-weather-add-group', false, null, {'parentRecord':record.detail.originator._tableInfo.tableRecord, 'queryName':'unusedProducts'});
  },
  _handleRecordDataRefreshed: function(e){
	  console.log(e.detail);
	  this.$.weatherGroupTable.fire('collection-data-refreshed', this.$.weathergroup);
  },
	_handleAvailableRecordsRefreshed: function(e){
		  console.log(e.detail);
		  console.log(this.avilableProducts);
	},
	collectionOrderByChanged: function(){
		if(this.recordData.record){
			this.$.weathergroup.refreshRecords();
		}
	},
	_handleDeleteCallback: function(callback)
	{
		if(callback === true)
		{
		      this.$.dataresource.deleteRecord(this.href)
              .then(function(result){
                 this.$.weathergroup.refreshPage(1);
              }.bind(this));
		}
	},
	_tableRowDelete: function(e){
		this.$.weatherGroupTable.fire('table-row-delete-allowed', {'originator':e.detail.originator});
	},
	_save: function(){
		var modified = this.$.weatherGroupTable.getDirtyRecords();
		this.$.weathergroup.createRecordBulk(modified);
        //.then(function(result){
        //   this.$.weathergroup.refreshPage(1);
        //}.bind(this));
    },
	//get schema information
	ready: function(){
		var self = this;
		this.$.weathergroup.refreshRecords().then(function(data){
			/*var newCols =
				[
					{'attribute':'groupname','title':self.schema.properties.groupname.title,'width':window.innerWidth/3 + "px",sortable:true},
					{'attribute':'description','title':self.schema.properties.description.title,'width':window.innerWidth/3+ "px",sortable:true},
				]
			self.set('columns', newCols);*/
		});
	}
  
});
