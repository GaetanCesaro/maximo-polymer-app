/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A Chart properties component.
 */
Polymer({
	is: 'maximo-chart-properties',
  	behaviors: [BaseComponent],
	properties : {
		charttype : {
			type : String,
			value: '',
			notify: true
		},
		chartoptions : {
			type : Object,
			value : {},
			notify : true
		},
		dialogtitle : {
			type : String,
			value : 'this space for rent',
			notify : true
		},
		chartTypes :  {
			type: String
		}
	},
  	ready : function(){  		
  	},
  	attached: function(){
  		this.chartTypes =	'piechart:' + this.localize('uitext', 'mxapibase', 'PieChart') +   			
			',barchart:'+ this.localize('uitext', 'mxapibase', 'BarChart') +
			',linechart:'+ this.localize('uitext', 'mxapibase', 'LineChart') +
			',heatmap:'+ this.localize('uitext', 'mxapibase', 'HeatMap') +
			',mapchart:'+ this.localize('uitext', 'mxapibase', 'MapChart');
  	},
  	handleChange : function() {
  		
  	},
  	isPie : function (type) {
  		return type === 'piechart';
  	},
  	isBar : function (type) {
  		return type === 'barchart';
  	},
  	isLine : function (type) {
  		return type === 'linechart';
  	},
  	isHeatmap : function (type) {
  		return type === 'heatmap';
  	},
  	isMapchart : function (type) {
  		return type === 'mapchart';
  	},
	_handleApply : function (e) {
		this.parent.fire('updatecharttype', this.charttype);
		this.parent.fire('updatesettings', this.chartoptions);
	},  
	_handleClose: function (e) {
  		this.closeDialog();
	},
	chartTypeChanged : function (e) {
		this.charttype = e.target.value;
	}
});
