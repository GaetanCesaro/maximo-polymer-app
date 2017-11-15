/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicemanager-overview-card',
  	behaviors: [BaseComponent],
    properties: {
    	createSRURL : {
			type: Object,
			value: ''    		
    	},
    	selectedRecord: {
			type: Object,
			notify: true
		},
		hasAttachmentFiles : {
			type: Boolean,
			notify: true,
			value: false
		},
		reportedpriority: {
			type: Number,
			notify: true,
		},
		
		groupBystatusData : {
			type: Object
		},
		groupBycommodityData : {
			type: Object
		},
		chartstatusdata : {
			type:Array
		},
		chartcommoditydata : {
			type:Array
		},
		statuslabels : {
			type:Array
		},
		commoditylabels : {
			type:Array
		},
		statuschartoptions: {
			type: Object,
			value: {}
		},
		commoditychartoptions: {
			type: Object,
			value: {}
		},
		srstatusDataForChart : {
			type: Object
		},
		srcommodityDataForChart : {
			type: Object
		}
	},
	ready: function()
	{
	},
	
	_handlesrstatusDataRefreshed : function() {
  		this.$.srstatusdata.fetchGroupByData();
  	},
  	_handleGroupBystatusDataRefreshed : function() {
  		this.chartstatusdata = $M.createAttrArrayFromRecords(this.groupBystatusData,'count');
  		this.statuslabels = $M.createAttrArrayFromRecords(this.groupBystatusData,'status');
  		for (var i = 0; i < this.statuslabels.length;i++) {
  			if (!this.statuslabels[i]) {
  				this.statuslabels[i] = 'Blank';
  			}
  		}
  		this.statuschartoptions = {};  		
  		this.statuschartoptions.rmargin = 30;
  		this.statuschartoptions.tmargin = 0;
  		this.statuschartoptions.bmargin = 25;
  		this.statuschartoptions.lmargin = 30;  
  		this.statuschartoptions.donutsize=.4;
  		this.$.srstatuschart.showChart();
  	},
  	
  	_handlesrpriorityDataRefreshed : function() {
  		this.$.srprioritydata.fetchGroupByData();
  	},
  	_handleGroupBycommodityDataRefreshed : function() {
  		this.chartcommoditydata = $M.createAttrArrayFromRecords(this.groupBycommodityData,'count');
  		this.commoditylabels = $M.createAttrArrayFromRecords(this.groupBycommodityData,'commodity');
  		for (var i = 0; i < this.commoditylabels.length;i++) {
  			if (!this.commoditylabels[i]) {
  				this.commoditylabels[i] = 'Blank';
  			}
  		}
  		this.commoditychartoptions = {};  		
  		this.commoditychartoptions.rmargin = 30;
  		this.commoditychartoptions.tmargin = 0;
  		this.commoditychartoptions.bmargin = 50;
  		this.commoditychartoptions.lmargin = 30;  
  		this.commoditychartoptions.donutsize=.4;
  		this.$.srcommoditychart.showChart();
  	},
  	togglestatus : function() {
  		this.$.statuscollapse.toggle();
  	},
  	togglelocation : function() {
  		this.$.locationcollapse.toggle();
  	},
  	togglecommodity : function() {
  		this.$.commoditycollapse.toggle();
  	}
  	
});
