/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

var MaximoChart_piechart = MaximoChart_piechart || {};
MaximoChart_piechart = {

	getChartStructures : function (values, labels, width, height, chartoptions, hovertemplates, marginFactor) {

  		var rm = chartoptions.rmargin ? chartoptions.rmargin : 0;
  		var tm = chartoptions.tmargin ? chartoptions.tmargin : 0;
  		var bm = chartoptions.bmargin ? chartoptions.bmargin : 0;
  		var lm = chartoptions.lmargin ? chartoptions.lmargin : 0;  		
  		
  		var fontsize = marginFactor > 1 ? 14 : 12;
		var showlegend = chartoptions.showLegend ? chartoptions.showLegend : true;  	
  		
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
  	  		
  		var donutsize = 0;
  		if (chartoptions) {
  			if (chartoptions.donutsize) {
  				donutsize = chartoptions.donutsize;
  			}
  		} 
  		
  		var hoverlabels=this.getHoverLabels(values, labels, hovertemplates);  	  	
  		var colorarray = chartoptions.colorArray ? chartoptions.colorArray : $M.colorPalleteRGB;  	  		
  		
  	  	var plotdata = [];
  	  	plotdata.push({
  	  		values: values,
  	  		labels: labels,
  	  		type: 'pie',
  	  		hole: donutsize,
  	  		textinfo: 'percent',
  	  		hoverinfo: 'text',
  	  		textposition: 'outside',
  	  		text : hoverlabels,
  	  		marker: {
  	  			colors : colorarray
  	  		}
  	  	});
		
		var rtnval = [];
	   	rtnval.push(plotdata);
	   	rtnval.push(layout);
	   	return rtnval;
	},
	getChartPropertiesLabel : function() {
		return $M.localize('uitext', 'mxapibase', 'ConfigurePieChart');
	},
	
	/**
	 * Pie Chart needs three templates, the first is for the label and the second is for the value, the third for the percentage label
	 */
	getHoverLabels : function(values, labels, hovertemplates) {
		if (hovertemplates && hovertemplates.length > 2) {
			var xtemplate = hovertemplates[0];
			var ytemplate = hovertemplates[1];
			var pertemplate = hovertemplates[2];
			
			var totalVal = jStat.sum(values);
			
			var rtnvals = [];
			for (var ii = 0; ii < values.length; ii++) {
				var perc = this.formatPiePercent(values[ii] / totalVal);
				rtnvals.push($M.replaceParams(xtemplate,[labels[ii]]) + '<br>' + $M.replaceParams(ytemplate,[values[ii]]) + '<br>' + $M.replaceParams(pertemplate,[perc]));
			}
			return rtnvals;
		}
		else {
			return values;
		}		
	},	

	// use the same code as plotly to format the precision so the values match
	formatPiePercent : function (v) {
	    var vRounded = (v * 100).toPrecision(3);
	    if(vRounded.indexOf('.') !== -1) return vRounded.replace(/[.]?0+$/,'') + '%';
	    return vRounded + '%';
	}
};

