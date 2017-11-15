/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datasets-card',
  	behaviors: [BaseComponent, MaxExport],
    properties: {
		recordData: {
			type: Object,
			notify: true
		},
		selectedRecord: {
			type: Object,
			notify: true
		},
		selectedQueryDefaultLabel: {
			type: String,
			notify: true
		},
		selectedQueryName: {
			type: String,
			value: 'MYDATASETS',
			notify: true,
			observer: '_selectedQueryNameChanged'
		},
		dynamicAttributeNames: {
			type: Array,
			value: [],
			notify: true
		},
		recordCount: {
			type: String,
			value: 0,
			notify: true
		},
		cookieName: {
			type: String,
			notify: true
		},
	},
	
	attached: function(){
		this.$.datasets.toggleLoading(true);
		if($M.hasAccessToWorkscape('datasetdesigner')){
			var newButton = Polymer.Base.create('maximo-button', {'id':this.id+'_newButton', 'synchronous':true,'icon':'action-based:add-new', 'action':'action', 'label':$M.localize('uitext','mxapisr','New')});
			$j(newButton).on('click', function(e){
				$M.toggleWait(true);
				this.async(function(){
					window.location.hash = '#/'+'datasetdesigner';
				},50);
			});
			$j(this.$.datasets.$.headingInfo).empty();
			$j(this.$.datasets.$.headingInfo).append(newButton);
			$j(this.$.datasets.$.headingInfo).css({'float':$M.dir==='rtl'?'left':'right'});
		}
	},

	_handleRecordDataRefreshed: function()
	{
		this.recordCount = this._getRecordCount();
		this.$.datasets.toggleLoading(false);		
	},
	
	_selectedQueryNameChanged : function()
	{
		
	},
	
	_getRecordCount : function(){
		return this.$.datasetcollection.totalCount;
	},
	
	refreshContainerRecords: function () {
		this.$.datasetcollection.refreshRecords();
	},

	datasetStopSpinner: function(e){
		if (this.cookieExists(this.cookieName)){
			console.log('cookie exists');
		}
	},
	cookieExists: function(name) {
		return (typeof $j.cookie(name) !== 'undefined');
	},
	
	getDate: function(reportdate)
	{
		return moment(reportdate).format('l') + ' ' + moment(reportdate).format('LT');
	},
	
	getStatusStyle: function(dataset){
		if (dataset && dataset.wosexport && dataset.wosexport.iscomplete && dataset.wosexport.uploadstatus === 'ERROR'){
			return 'color: var(--Primary-orange50);';
		}
		return '';
	},
	
	getStatusLabel: function(dataset){
		if (!dataset || !dataset.wosexport){
			return;
		}
		var statusmessage = '';
		if (dataset.wosexport.iscomplete){
			// it's complete, so export was submitted and exported, check for errors
			if (dataset.wosexport.uploadstatus === 'ERROR'){
				statusmessage = this.localize('uitext', 'mxapiwosdataset', 'ERROR');
			}else{
				statusmessage = this.localize('uitext', 'mxapiwosdataset', 'Exportedon');
			}
		} else if (dataset.wosexport.reqdatetime){
			// not complete but has a reqdate, so export was submitted
			statusmessage = this.localize('uitext', 'mxapiwosdataset', 'Submittedon');
		}
		return statusmessage;
	},
	
	getStatusField: function(dataset){
		if (!dataset || !dataset.wosexport){
			return;
		}
		if (dataset.wosexport.iscomplete){
			return this.getDate(dataset.wosexport.recdatetime);
		} else if (dataset.wosexport.reqdatetime){
			return this.getDate(dataset.wosexport.reqdatetime);
		}
	},
	
	_handleEndPointDataRefreshed: function()
	{
		this.$.datasetcollection.refreshRecords();
	},
	_editSet: function(e){
		$M.toggleWait(true);
		this.async(function(){
			var record = this.$.datasetTemplate.itemForElement(e.target);
			var properties = { 'analyticdatasetnum': record.analyticdatasetnum, 'href': record.href };
			sessionStorage.setItem('workScapeProperties', JSON.stringify(properties));
			$M.set('route.path', '/datasetdesigner');
		},100);
	},
	_deleteSet: function(e){
		var record = this.$.datasetTemplate.itemForElement(e.target);
		var message = $M.localize('messages','mxapiwosdataset','deletedataset',['\''+record.description+'\'']);
		var dataSetsCard = this;
		var completeCallback = function(toOverlay) {
			$j(toOverlay).toggleClass('song2',true);
			$j(toOverlay).find('*').each(function(){
				$j(this).css({'pointer-events':'none'});
			});
			dataSetsCard.$.datasetResource.deleteRecord(record.href).then(function() {
				dataSetsCard.$.datasetcollection.refreshRecords();
				$j(toOverlay).toggleClass('song2',false);
				$j(toOverlay).find('*').each(function(){
					$j(this).css({'pointer-events':'all'});
				});

			});
		};
		var card = $j(this).find('div[original-id=dataset_record]')[this.$.datasetTemplate.indexForElement(e.target)];
		if(card){
			$M.createOverlay(card, message, completeCallback, null, 5, this.$.datasets.$.internal, null);
		}
	},
    
    _watsonExport: function(e){
    	this.watsonExport(this.$.datasetTemplate.itemForElement(e.target));
    },
    
    /**
     * Used to hide/show actions allowed only to dataset owner
     */
    _hideActions: function(dataset) {
    	
    	//console.log(dataset);
    	var currentUser = $M.getMaxauth().whoami.personId;
    	var owner = dataset.owner;
    	if (currentUser === owner) {
    		return false;
    	}else {
    		return true;
    	}
    }
	
});
