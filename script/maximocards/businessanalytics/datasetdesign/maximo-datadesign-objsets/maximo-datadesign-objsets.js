/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datadesign-objsets',
  	behaviors: [BaseComponent],
  	listeners: {
		'changetab' : '_changeTab',
		'showinfo' : '_showInfo'
  	},
    properties: {
    	dataset : {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	/**
		 * The current selected Card
		 */
    	selectedCard : {
    		type: Object,
    		value: null
    	},
    	_results: {
    		type: String,
    		value: ''
    	},
    	_editDatasetHref : {
    		type: String,
    	}

	},
	attached: function(){
		// check to see if a dataset for us to edit is set in workscapeProperties
		var wsProps = JSON.parse(sessionStorage.getItem('workScapeProperties'));
		if (wsProps && wsProps.href){
			sessionStorage.removeItem('workScapeProperties');
			// get dataset record
			var this2 = this;
			this.async(function(){
				this.$.editDatasetResource.resourceUri = wsProps.href;
				this.$.editDatasetResource.loadRecord().then(function(){
					// fire select set event
					this2.fire('_selectset', { 'card':this2,'record':this2.$.editDatasetResource.resourceData,'editmode':true } );
				});
			}, 100);
		}
	},
	_changeTab: function(e){
	},
	_handleRecordDataRefreshed : function() {
		this._results = $M.localize('uitext', 'mxapiwosdataset', '0Results',[this.$.datasetcollection.totalCount]);
	},
	selectset : function(e) {
		this.fire('_selectset', {'card':e.currentTarget,'record':this.$.datasetTemplate.itemForElement(e.currentTarget)});
	},
	_showInfoHover: function(e){
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
	/**
	 * Show an info card that presents a brief information about the DataSet
	 */
	_showInfo : function(e){
		e.stopPropagation();
		var tooltip = document.createElement('div');
		var record=this.$.datasetTemplate.itemForElement(e.target);
		var desc=document.createElement('maximo-field');
		var lngdesc=document.createElement('maximo-htmlfield');
		var changedate=document.createElement('maximo-field');
		var changeby=document.createElement('maximo-field');
		var obj=document.createElement('maximo-field');
		var days = ["January","February","March","April","May","June","July","August","September","October","November","December"];
		var d = new Date(Date.parse(record.changedate));
		changedatestr=days[d.getMonth()]+" "+d.getDay()+", "+d.getFullYear();
		$j(desc).attr({'label':'Description','datalabel':record.description});
		$j(lngdesc).attr({'label':'Additional Details','max-height':'145px','datalabel':record.description_longdescription});
		$j(obj).attr({'label':'Object Name','datalabel':record.intobjectname});
		$j(changedate).attr({'label':'Last Change Date','datalabel':changedatestr});
		$j(changeby).attr({'label':'Last Changed By','datalabel':record.changeby});
		$j(tooltip).append(desc,lngdesc,obj,changedate,changeby);
		$M.showTooltip(tooltip,e.target);
  	}
});
