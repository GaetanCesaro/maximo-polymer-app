/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
`<maximo-chart>` element. Charts as a web component, allowing you to easily visualize data. From simple line charts to complex hierarchical tree maps, the chart element provides a number of ready-to-use chart types.


Example:
```html
	<maximo-chart id="chart" frameclass="cardborder" charttype="piechart" allowedtypes="barchart,linechart,piechart" abouttext="Some info about the chart" chartoptions="{{chartoptions}}" fulltitle="SupplierDeliveriesNotCompletedtoPlan" values="{{chartdata}}" labels="{{labels}}" width="540" height="200" hovertemplates="{{hovertemplates}}"></maximo-chart>	
```

@demo
 */

Polymer({
	is: 'maximo-chart',
  	behaviors: [BaseComponent],
	properties : {
		/**
		 * List of values to be charted.  If you are doing multiple chart types,
		 * this needs to be a matching array to the charttype.
		 */
		values : {
			type: Object
		},
		/**
		 * List of labels that correspond with the values; must match in size.  If you are doing multiple chart types,
		 * this needs to be a matching array to the charttype.
		 */
		labels : {
			type: Object
		},
		/**
		 * width of the chart itself, simple numeric
		 */
		width : {
			type: String,
			value: '300',
			notify: true
		},
		/**
		 * height of the chart itself, simple numeric
		 */
		height : {
			type: String,
			value: '300',
			notify: true
		},
		/**
		 * The title for the chart
		 */
		fulltitle : {
			type: String,
			value:''
		},
		/**
		 * The text to appear when clicking the 'about' button on the chart
		 */
		abouttext:{
			type: String			
		},
		/**
		 * internal use only, container for when the chart is opened full screen
		 */
		fullchart : {
			type : Object
		},
		/**
		 * The type of chart to show.  If you want an multiple chart type overlay, make this an array of the chart types.
		 */
		charttype : {
			type: String	
		},
		/**
		 * Object which contains chart options that can vary depending on the chart type.  If you are doing multiple chart types,
		 * this needs to be a matching array to the charttype.
		 * 
		 * Predefined Chart Options (not all options are valid with each chart type):
		 * 
		 * 	rmargin - The right margin
  		 *  tmargin - The top margin
  		 *  bmargin - The bottom margin
  		 *  lmargin - The left margin  
  		 *  markerColor - The RGB color for the marker.  It is a single color value  
		 *  lineColor - The RGB color for the line.  It is a single color value
		 *  colorArray - An array of RGB colors for the chart.  Used by charts that use multiple values per ploy, ie. pie.
		 *  mode - The chart mode, ex markers, lines, lines+markers
		 *  showLegend - Whether or not to show the legend
		 *  barMode - The mode for the barchart, i.e. group or stack
		 *  chartName - The name for the chart, i.e. chart 1
		 */
		chartoptions : {
			type: Object
		},
		/**
		 * Array of extended hover (tooltip) labels.  If you are doing multiple chart types,
		 * this needs to be a matching array to the charttype.  You can set to null to use no hover labels
		 */
		hovertemplates: {
			type:Array 
		},
		/**
		 * Multiplier to on the margins when opening the chart full screen
		 */
		fullMarginFactor: {
			type: Number,
			value: 1.5
		}, 
		/**
		 * Comma separated list of valid types to use on the chart type dialog.  If left blank, then all chart types will be allowed.
		 */
		allowedtypes : {
			type: String,
			notify: true
		},
		/**
		 * Class to be set on the frame around the entire chart.  Can be used for borders, spacing, etc.
		 */
		frameclass : {
			type: String,
			notify: true
		}			
	},
	listeners: {
		'dialogcreated' : 'dialogCreated',
		'openfull' : 'openFull',
		'showabout' : 'showAbout',
		'download' : 'downloadImage',
		'changetype' : 'changeType',
		'newttype' : 'newType',
		'changeprops' : 'changeProps',
		'updatesettings' : 'updateSettings',
		'updatecharttype' : 'updateChartType'
 	},
  	created : function(){
  	},
  	ready : function(){
  	},
  	attached: function(){		
  	},
  	_getChartHandler : function (type) {
  		var handler = window['MaximoChart_' + type];
  		if (!handler) {
  			console.log('unable to find handler for ' + type);
  			return null;	
  		}
  		return handler;
  	},  		  		
  	_showChart : function(container, width, height, marginFactor) {
  		if (Array.isArray(this.charttype)) {
  			var plotData = [];
  			var layout = null;
  			for (var ii=0; ii < this.charttype.length; ii++){
  		  		var chartHandler = this._getChartHandler(this.charttype[ii]);
  		  		if (chartHandler) {
  		  			var hoverTemps = (this.hovertemplates) ? this.hovertemplates[ii] : null;
  		  			var chartData = chartHandler.getChartStructures(this.values[ii], this.labels[ii], width, height, this.chartoptions[ii], hoverTemps, 1.0);
  		  			if (chartData) {
	  		  			layout = (layout===null) ? chartData[1] : layout;
	  		  			plotData.push(chartData[0][0]);
  		  			}
  		  		}
  			}
  			if (layout && plotData.length > 0) {
  				Plotly.newPlot(container, plotData, layout, {displayModeBar: false});
  			}
  			else {
	  			$j(container).empty();
	  		}
  		}
  		else {
	  		var chartHandler = this._getChartHandler(this.charttype);
	  		if (chartHandler) {  			
	  			var chartData = chartHandler.getChartStructures(this.values, this.labels, width, height, this.chartoptions, this.hovertemplates, 1.0);
	  			if (chartData) {
	  				Plotly.newPlot(container, chartData[0], chartData[1], {displayModeBar: false});  				
	  			} else {
	  				$j(container).empty();
	  			}
	  		} else {
	  			$j(container).empty();
	  		}
  		}
  	},
  	showChart: function () {
  		
  		this._showChart(this.$.chart, this.width, this.height, 1.0);
  	},
  	
  	dialogCreated : function(e){  			
  		var thedialog = e.detail;
  		var width = $j(thedialog.$.underlay).width() - 40; 
  		var height = $j(thedialog.$.underlay).height() - $j(thedialog.$.wrapper).height();  			  			
  		this._showChart (this.fullchart, width, height, this.fullMarginFactor); 	  		
  	},  	
  	openFull : function(e){
		e.stopPropagation();

	  	this.fullchart = this.$.chart.cloneNode(true);
	  	$M.showDialog(this, 'chartfullview', this.fulltitle, this.fullchart, 2, this,{'createdevent':'dialogcreated','placeInBody':true});
  	},
  	downloadImage : function(e){
		e.stopPropagation();
		
        var format = 'png';

//        if(Plotly.Lib.isIE()) {
//        	console.log('download is not supported for IE');
//            return;
//        }

        var gd=this.$.chart;
        
        if(gd._snapshotInProgress) {
        	console.log('download is still in progress');
            return;
        }

        gd._snapshotInProgress = true;

        var ev = Plotly.Snapshot.toImage(gd, {format: format});

        var filename = gd.fn || this.fulltitle;
        filename += '.' + format;

        ev.once('success', function(result) {
            gd._snapshotInProgress = false;

            var downloadLink = document.createElement('a');
            downloadLink.href = result;
            downloadLink.download = filename; // only supported by FF and Chrome

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            ev.clean();
        });

        ev.once('error', function(err) {
            gd._snapshotInProgress = false;           
            console.error(err);
            ev.clean();
        });
  	},
  	changeType: function(e){
		e.stopPropagation();
		$M.showDialog(this,'pickcharttype', this.localize('uitext', 'mxapibase', 'ChooseChartType'),'maximo-charttype-dialog', false, null, {allowedtypes: this.allowedtypes,'placeInBody':true});
  	},
  	changeProps : function(e) {
  		if (this.charttype && (this.charttype.length > 0)) {
  			var dialogid = 'maximo-chart-properties';
  	  		var chartHandler = this._getChartHandler(this.charttype);
  	  		var dialogtitle = chartHandler.getChartPropertiesLabel();
  			var opts = $M.cloneRecord(this.chartoptions);  			
  			$M.showDialog(this, opts, this.localize('uitext', 'mxapibase', 'ChartProperties'), dialogid, false, this,
  					{charttype: this.charttype, chartoptions: opts, dialogtitle: dialogtitle});
  		}
  	},
  	newType : function(e) {  		
  		if (e.detail) {
  	  		this.charttype = e.detail;
  	  		this.showChart();
  		}
  	},
  	updateSettings : function(e) {
  		if (e.detail) {
  	  		this.chartoptions = e.detail;
  	  		this.showChart();
  		}
  	},
  	updateChartType : function(e) {
  		if (e.detail) {
  			this.charttype = e.detail;
  		}	
  	},
  	/**
		 * Show info about the chart data.
		
		 */
  	showAbout : function(e){
		e.stopPropagation();
  		if(this.abouttext && this.abouttext.length > 0){
  			//$M.alert(this.abouttext,0);
  			$M.showTooltip(this.abouttext, e.detail.currentTarget);
  		}
  	}
  	
});
