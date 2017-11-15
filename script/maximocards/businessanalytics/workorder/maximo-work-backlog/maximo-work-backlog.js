/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016,2017
*/
Polymer({
	is: 'maximo-work-backlog',
  	behaviors: [BaseComponent],
	properties : {
		woData : {
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
  		this.hovertemplates = [this.localize('uitext', 'mxapiwo', 'WorkType0'),this.localize('uitext', 'mxapiwo', 'BacklogLaborDays0')];  		
  	},
  	attached: function(){
  		
  	},
  	_handleWoDataRefreshed : function() {
  		this.$.wodata.fetchGroupByData();
  	},
  	_handleGroupByDataRefreshed : function() {
  		
  		this.groupByData.sort(function(a,b) {
  			return (b.count - a.count);
  		});
  		
  		this.chartdata = $M.createAttrArrayFromRecords(this.groupByData,'count');
  		this.labels = $M.createAttrArrayFromRecords(this.groupByData,'worktype');
  		for (var i = 0; i < this.labels.length;i++) {
  			if (!this.labels[i]) {
  				this.labels[i] = 'Blank';
  			}
  		}

  		this.chartoptions = {};  		
  		this.chartoptions.rmargin = 30;
  		this.chartoptions.tmargin = 0;
  		this.chartoptions.bmargin = 25;
  		this.chartoptions.lmargin = 50;  		
  		
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
