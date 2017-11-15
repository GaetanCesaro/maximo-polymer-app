/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-inspector-tile',
	
  	behaviors: [BaseComponent],
  	
  	listeners: {},
  	
    properties: {
    	
    	/**
    	 * inspection form record
    	 */
    	record: {
    		type: Object,
    		observer: '_objChanged'
    	},
    	
    	/**
    	 * Current Page
    	 */
    	page: {
    		type: String
    	},
    	
    	/**
    	 * Revision number
    	 */
    	_revision: {
    		type: String
    	},
    	
    	/**
    	 * Synonym domain of 
    	 * current status
    	 */
    	state: {
    		type: Object,
    		notify: true
    	},
    	
    	/**
    	 * Translation of current status
    	 */
    	booleanState: {
    		type: Boolean,
    		observer: '_boolStateChange'
    	},
    	
    	/**
    	 * Synonym domain collection
    	 */
    	formStatusSet: {
    		type: Array,
    		observer: '_domainStatusChange'
    	},
    	
    	/**
    	 * Flag to hide revision option
    	 */
    	hideRevision: {
    		type: Boolean,
    		value: false
    	},
    	
    	/**
    	 * Flag to hide delete option
    	 */
    	hideDelete: {
    		type: Boolean,
    		value: false
    	},
    	
    	/**
    	 * Flag to hide edit option
    	 */
    	hideEdit: {
    		type: Boolean,
    		value: false
    	},
    	
    	/**
    	 * Interval in seconds to 
    	 * undo delete operation
    	 */
    	undoIntervalSecs: {
    		Type: Number,
    		value: 7,
    		readOnly: true
    	},
    	
    	/**
    	 * Flag to hide Result List Tile
    	 */
    	hideResultTile: {
    		type: Boolean,
    		value: true
    	},
    	
    	/**
    	 * Flag to hide Create Tile
    	 */
    	hideCreateTile: {
    		type: Boolean,
    		value: true
    	},
    	
    	/**
    	 * Flag to hide Asset Description
    	 */
    	hideAsset: {
    		type: Boolean,
    		value: true
    	}, 
    	
    	/**
    	 * Flag to hide Location Description
    	 */
    	hideLocation: {
    		type: Boolean,
    		value: true
    	} 
    	
	},
	
	ready : function(e){
		if(this.page==='createInspection'){
			this.hideCreateTile=false;
			this.hideResultTile=true;
		} else {
			//inspResultList page
			this.hideCreateTile=true;
			this.hideResultTile=false;
		}		
	},
		
	_setUndoIntervalSecs: function(secs){
		this.undoIntervalSecs = secs;
	},
	
	_domainStatusChange: function(){
		//console.info('domain status is ');
		//console.log(this.formStatusSet);
	},
	
	_objChanged: function (newVal) {
		//this.fillTooltip(newVal);
		this.fillFormOptions(newVal);
		this.mountRevision(newVal);
		this.hideLocation = ((!this.record.locations) || 'description' in this.record.locations)?false:true;
	},
	
	updateState: function(obj) {
		
		var statusEntry;
		if (this.formStatusSet) {
			statusEntry = this.getStatusEntry(obj.status_maxvalue);
		}else if (obj) {
			statusEntry = {'maxvalue':obj.status_maxvalue,
				'description':obj.status_description};
		}
		
		if (statusEntry !== null) {
			this.state = statusEntry;
			this.setBoolStatus(statusEntry);
		}
		
		if(this.record.status_maxvalue=='REVISED'){
			this.$.checkbox.readonly=true;
		}
    },
    
    _boolStateChange: function(newV, oldV) {
    	
    	if (oldV === undefined){
    		return;
    	}
    	
    	//make sure tooltip is closed 
    	if($M.currentTooltip){
    		$M.tooltip.hide();
    	}
    	
    	if (this.skipBoolObserver){
    		return;
    	}
    	
    	var statusEntry;
    	if (newV && newV === true) {
    		statusEntry = this.getStatusEntry('active');
    	}else {
    		statusEntry = this.getStatusEntry('inactive');
    	}
    	
    	if (statusEntry) {
    		this.state = statusEntry;
    	}
    	
    	if (this.record.status !== this.state.maxvalue) {    		
    		var detail = {};
    		detail.object = {'status': this.state.value};
    		detail.props = 'status';
    		detail.href = this.record.href;
    		detail.originalStatus = this.record.status_maxvalue;
    		detail.name = this.record.name;
    		
    		$M.toggleWait(true);
    		this.fire('changeStatus',detail);
    	}

    },
    
    setBoolStatus: function (domainEntry) {
    	this.skipBoolObserver = true;
    	if (domainEntry.maxvalue === 'ACTIVE') {
    		this.booleanState = true;
    	}else {
    		this.booleanState = false;
    	}
    	this.skipBoolObserver = false;
    },
	
	getStatusEntry: function (/*String*/ maxval) {
    	
    	if (!maxval || maxval.length === 0) {
    		console.error('Undefined maxval.');
    		return null;
    	}
    	
    	if (!this.formStatusSet){
    		//console.error('No inspection form status domain set.');
    		return null;
    	}
    	
    	maxval = maxval.toUpperCase();
    	var filterRes = this.formStatusSet.filter(function(o){return o.maxvalue === maxval;} );
    	
    	if (!filterRes){
    		console.error('Problems to filter.');
    		return null;
    	}
    	
    	if (filterRes.length < 1){
    		console.error('No values filtered with ' + maxval);
    		return null;
    	}
    	
    	return filterRes? filterRes[0] : null;
    },
	
	_preventPopup: function (ev) {
		ev.stopPropagation();
	},
	
	/**
	 * Checks if mouse hovers for more than 350 milisecs
	 */
	_showInfoHover: function(e) {
		
		var icon = e.currentTarget;
		var card = this;
		if(icon.hoverTimer){
			window.clearTimeout(icon.hoverTimer);
		}
		
		$j(icon).one('mouseleave', function(){
			if(icon.hoverTimer){
				window.clearTimeout(icon.hoverTimer);
			}
			$M.tooltip.hide();
		});
		
		icon.hoverTimer = setTimeout(function(){
			card._showInfo(e);
		}, 350);
		
	},

    mountRevision: function(record) {
		this._revision = $M.localize('uitext', 'mxapiinspection', 'revision_0',[record.revision]);
	},
	
	
	fillTooltip: function (record){
	},
	
	fillFormOptions: function (record){		
	},
	
	_showInfo: function(e) {		
		e.stopPropagation();
		var tooltip = this.$.info;
		$M.showTooltip(tooltip, e.target);
	},
		
	showRevisionAction: function(record) {
		if (record.status_maxvalue!=='ACTIVE' || (record.status_maxvalue==='ACTIVE' && record.hasrevision===true)){
			this.hideRevision=true;
		} else if((record.status_maxvalue=='ACTIVE' && record.originalformnum!=null)){
			this.hideRevision=false;
		} else {
			this.hideRevision=false;
		}
	},
	
	showDeleteAction: function(record) {
		if(record.originalformnum!=null && (record.status_maxvalue==='ACTIVE' || record.status_maxvalue==='INACTIVE')){
			this.hideDelete=true;
		} else if(record.hasrevision===false || record.status_maxvalue==='PNDREV'){
			this.hideDelete=false;
		} else {
			this.hideDelete=true;
		}
	},
	
	showEditAction: function(record) {
		if(record.status_maxvalue==='DRAFT' || record.status_maxvalue==='PNDREV'){
			this.hideEdit=false;
		} else {
			this.hideEdit=true;
		}
	},
	
	_showFormOptions: function (e) {

		e.stopPropagation();
		console.info('show options');
		
		this.showRevisionAction(this.record);
		this.showDeleteAction(this.record);
		this.showEditAction(this.record);
		
		var tooltipContent = this.$.formOptions;

//		$M.showTooltip(tooltipContent, e.target);
		this.$.tooltipInspection.show(tooltipContent, {'element':e.target,'stopMouseDown':true});
	},
	
	_preview: function (e) {
		console.log('Open preview of ' + this.record.name);
		$M.notify('Under construction.', $M.alerts.warn);
		$M.tooltip.hide();
	},
	
	_revise: function (e) {
		console.log('Open edition of ' + this.record.name);
		this.fire('createRevision',this.record);
		$M.tooltip.hide();
	},
	
	_edit: function (e) {
		console.log('Open edition of ' + this.record.name);
		this.fire('editForm',this.record);
		$M.tooltip.hide();
	},
		
	highlight: function() {
		
		var card = this.$.inspectorListTile;
		
		card.classList.add('highlight');
		this.scrollIntoView(false);
		setTimeout(function() {
			card.classList.remove('highlight');
		}, 4000);
		
		
	},

	_duplicate: function (e) {
		this.fire('duplicate', this.record);
		$M.tooltip.hide();
	},

	_delete: function (e) {		
		var message = $M.localize('uitext','mxapiinspection','inspectionform_deleted');
		
		var self = this;
		var performDeleteOperation = function(overlayNode) {
			console.log('Perform delete');
			self.fire('delete', self.record);
		};
		
		$M.createOverlay(this.$.tileContainer, message, performDeleteOperation, this._revertDeleteOperation, this.undoIntervalSecs, null, null);
		
		//this.fire('delete',this.record);
		$M.tooltip.hide();
	},
	
	_performDeleteOperation: function(e){
		this.fire('delete',this.record);
	},
	
	_revertDeleteOperation: function () {
	},

	_config: function (e) {
		$M.tooltip.hide();
	},
	
	
	_formSelect : function(e){
		var record = this.record;
		record.page = 'start';
		this.fire('processFormSelection',record);
	}
	
});
