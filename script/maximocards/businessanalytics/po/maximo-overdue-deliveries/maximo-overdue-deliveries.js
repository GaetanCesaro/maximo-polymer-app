/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-overdue-deliveries',
  	behaviors: [BaseComponent],
	properties : {
		poData : {
			type: Object
		},
		groupByData : {
			type: Object
		},
		chartdata : {
			type:Array
		},
		labels : {
			type:Array
		},
		chartoptions: {
			type: Object,
			value: {}
		}
	},
  	created : function(){
  		
  	},
  	ready : function(){
  		this.hovertemplates = [this.localize('Supplier: {0}'),this.localize('Number of Overdue PO Deliveries: {0}'), this.localize('Percentage of Total Overdue PO Deliveries: {0}')];
  	},
  	attached: function(){
  		
  	},
  	_handlePoDataRefreshed : function() {
  		this.$.podata.fetchGroupByData();
  	},
  	_handleGroupByDataRefreshed : function() {
  		this.chartdata = $M.createAttrArrayFromRecords(this.groupByData,'count');
  		this.labels = $M.createAttrArrayFromRecords(this.groupByData,'vendor');
  		for (var i = 0; i < this.labels.length;i++) {
  			if (!this.labels[i]) {
  				this.labels[i] = 'Blank';
  			}
  		}
  		
  		this.chartoptions = {};  		
  		this.chartoptions.rmargin = 10;
  		this.chartoptions.tmargin = 0;
  		this.chartoptions.bmargin = 30;
  		this.chartoptions.lmargin = 50;  		
  		this.chartoptions.donutsize=.4;
  		
  		this.$.chart.showChart();
  	}
});