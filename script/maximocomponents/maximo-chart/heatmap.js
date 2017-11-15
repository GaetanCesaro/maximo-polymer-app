/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
var MaximoChart_heatmap = MaximoChart_heatmap || {};
MaximoChart_heatmap = {

	getChartStructures : function (values, labels, width, height, chartoptions, hovertemplates, marginFactor) {

  		var rm = chartoptions.rmargin ? chartoptions.rmargin : 0;
  		var tm = chartoptions.tmargin ? chartoptions.tmargin : 0;
  		var bm = chartoptions.bmargin ? chartoptions.bmargin : 0;
  		var lm = chartoptions.lmargin ? chartoptions.lmargin : 0;  		
		
  		var fontsize = marginFactor > 1 ? 14 : 12;
  		var showlegend = chartoptions.showLegend ? chartoptions.showLegend : false;
  		
  		var layout = { 
  			showlegend:showlegend,
  	  	  	margin: {
  	  	  		r: rm * marginFactor,
  	  	  		t: tm * marginFactor,
  	  	  		b: bm * marginFactor,
  	  	  		l: lm * marginFactor,
  	  	  	},
  	  	  	width: width,
  	  	  	height: height,
  	  	  	font: {
  	  	  		family: 'HelveticaNeue,sans-serif',
  	  	  		size: fontsize,
  	  	  		color: '#6d7777'
  	  	  	}
  	  	};
  		  		
  		var colorscalevals = [
          [0,'#ffffff'],[.5,'#fdd600'],[1,'#d74108']  				              
  		];
  	  	  		
  		var zmax = (chartoptions && chartoptions.zmax) ? chartoptions.zmax : -1; 
  		var zmin = (chartoptions && chartoptions.zmin) ? chartoptions.zmin : 0;
  		
  		var xdata = labels[0] ? labels[0] : [];
  		var ydata = labels[1] ? labels[1] : [];  		  		
  		
  		var hoverlabels=this.getHoverLabels(values, xdata, ydata, hovertemplates);
  		
  		  	
  	  	var plotdata = [];
  	  	if (zmax > -1) {
	  	  	plotdata.push({
	  	  	  	x: xdata,
	  	  	  	y: ydata,
	  	  	  	z: values,
	  	  		type: 'heatmap',
	  	  		colorscale : colorscalevals,
	  	  		hoverinfo: 'text',
  	  			text : hoverlabels,
	  	  		zmax : zmax,
	  	  		zmin : zmin
	  	  	});
  	  	} else {
	  	  	plotdata.push({
	  	  	  	x: xdata,
	  	  	  	y: ydata,
	  	  	  	z: values,
	  	  		type: 'heatmap',
	  	  		hoverinfo: 'text',
	  	  		text : hoverlabels,
	  	  		colorscale : colorscalevals,
	  	  	});  	  		
  	  	}  		  	  			
		
	   	var rtnval = [];
	   	rtnval.push(plotdata);
	   	rtnval.push(layout);
	   	return rtnval;
	},
	getChartPropertiesLabel : function() {
		return $M.localize('uitext', 'mxapibase', 'ConfigureHeatMap');
	},
	/**
	 * Heatmap needs three templates, the first is for the X label and the second is for the Y label, the third for the value
	 */
	getHoverLabels : function(values, xlabels, ylabels, hovertemplates) {
		if (hovertemplates && hovertemplates.length > 2) {
			var xtemplate = hovertemplates[0];
			var ytemplate = hovertemplates[1];
			var valtemplate = hovertemplates[2];			
			
			var rtnvals = [];
			
			for (var jj=0; jj < ylabels.length; jj++ ) { 
				var valarr = values[jj];
				var ylabelarr = ylabels[jj];
				var xrow = [];
				for (var kk=0; kk < xlabels.length; kk++) {					
					xrow.push($M.replaceParams(xtemplate,[xlabels[kk]]) + '<br>' + $M.replaceParams(ytemplate,[ylabels[jj]]) + '<br>' + $M.replaceParams(valtemplate,[valarr[kk]]));					
				}
				rtnvals.push(xrow);
			}						

			return rtnvals;
		}
		else {
			return values;
		}		
	},	


};

