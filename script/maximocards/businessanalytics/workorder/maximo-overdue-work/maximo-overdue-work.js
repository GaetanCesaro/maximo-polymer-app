/*
 * @license
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016,2017
*/
Polymer({
	is: 'maximo-overdue-work',
  	behaviors: [BaseComponent,HandlerChartUtils],
	properties : {
		woData : {
			type: Object
		},
		groupByData : {
			type: Object
		},
		chartdata : {
			type: Object
		},
		labels : {
			type:Object
		},
		priority: {
			type: String,
			notify: true,
			observer: 'priorityChanged'
		},
		searchTerms: {
			type: String,
			value: '',
			notify: true		
		},
		chartoptions: {
			type: Object,
			value: {}
		},
		hovertemplates: {
			type: Array
		}
	},
  	created : function(){
  		
  	},
  	ready : function(){
  		this.hovertemplates = [this.localize('uitext', 'mxapiwo', 'WorkStatus0'),this.localize('uitext', 'mxapiwo', 'Supervisor0'), this.localize('uitext', 'mxapiwo', 'OverdueWorkRecords0')];
  	},
  	attached: function(){
  		
  	},
  	_handleWoDataRefreshed : function() {
  		this.$.wodata.fetchGroupByData();
  	},
  	_handleGroupByDataRefreshed : function() {
  		
  		this._replaceNullsForAttribute(this.groupByData,'Blank','status');
  		this._replaceNullsForAttribute(this.groupByData,'Blank','supervisor');  		

  		var xdata = this._createUniqueAttrArrayFromRecords(this.groupByData,'status');
  		var ydata = this._createUniqueAttrArrayFromRecords(this.groupByData,'supervisor');
  		
  		var countdata = $M.createAttrArrayFromRecords(this.groupByData,'count');
  		
  		this.chartoptions = {};
  		this.chartoptions.zmin=0;  		  	
  		if (countdata.length > 0) {
  			this.chartoptions.zmax = jStat.stdev(countdata);
  		} else {
  			this.chartoptions.zmax = 0;
  		}
  		
  		this.chartoptions.rmargin = 10;
  		this.chartoptions.tmargin = 0;
  		this.chartoptions.bmargin = 25;
  		this.chartoptions.lmargin = 100;  		
  		
  		this.chartdata = [];
		for (var jj=0; jj < ydata.length; jj++ ) { 
			var values = [];
			for (var ii = 0; ii < xdata.length; ii++){
				values.push(0);
			}
  			this.chartdata.push(values);
		}
  		  	
  		for (var jj=0; jj < ydata.length; jj++ ) {  		
  	  		for (var ii = 0; ii < xdata.length; ii++) {  			
  				for (var zz=0; zz < this.groupByData.length;zz++) {
  	  				if ((this.groupByData[zz]['status'] === xdata[ii]) && (this.groupByData[zz]['supervisor'] === ydata[jj])) {
  	  					this.chartdata[jj][ii] = this.groupByData[zz]['count'];
  	  					break;
  	  				}  					
  				}
  			}
  		}
  		  		
  		this.labels = [];
  		this.labels.push(xdata);
  		this.labels.push(ydata);
  		
  		this.$.chart.showChart();
  	},
  	priorityChanged : function () {
  		if (this.priority === 'all') {
  			this.searchTerms = '';
  		} else {
  			this.searchTerms = this.priority;
  		}
  		this.$.wodata.fetchGroupByData();
  	}
});
