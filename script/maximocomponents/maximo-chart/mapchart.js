/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

var MaximoChart_mapchart = MaximoChart_mapchart || {};
MaximoChart_mapchart = {

	getChartStructures : function (values, labels, width, height, chartoptions, hovertemplates, marginFactor) {

  		var labels = $M.createAttrArrayFromRecords(values,'label');
  		var lat = $M.createAttrArrayFromRecords(values,'lat');
  		var lon = $M.createAttrArrayFromRecords(values,'lng');
  		var mapvalues = $M.createAttrArrayFromRecords(values,'value');
  		
  		var temp = this.unpack(values,'label');
  		  		
		var hoverlabels=this.getHoverLabels(mapvalues, labels, hovertemplates);
  		
  		var scale = 1;
  		if (chartoptions) {
  			if (chartoptions.scale) {
  				scale = chartoptions.scale;
  			}
  		} 
  		
  		for (var ii = 0; ii < mapvalues.length; ii++) {
  			mapvalues[ii] = mapvalues[ii] * scale;
  		}
  		
  		var rm = chartoptions.rmargin ? chartoptions.rmargin : 0;
  		var tm = chartoptions.tmargin ? chartoptions.tmargin : 0;
  		var bm = chartoptions.bmargin ? chartoptions.bmargin : 0;
  		var lm = chartoptions.lmargin ? chartoptions.lmargin : 0;  		
  		
  		var markerColor = chartoptions.markerColor ? chartoptions.markerColor : $M.colorPalleteRGB[1];  
		var lineColor = chartoptions.lineColor ? chartoptions.lineColor : 'black';
		var showlegend = chartoptions.showLegend ? chartoptions.showLegend : false;
  		
  		var layout = { 
  			showlegend:showlegend,  	  	
  	  	  	geo: {
  	  	  		scope: 'usa',
  	  	  		projection: {
  	  	  			type:'albers usa'
  	  	  		},
  	  	  		showland:true,
  	  	  		landcolor: 'rgb(255,255,255)',
  	  	  		subunitwidth:1,
  	  	  		countrywidth:1,
  	  	  		subunitcolor:'rgb(0,0,0)',
  	  	  		countrycolor:'rgb(0,0,0)'   	  	  			
  	  	  	},
	  		width: width,
  	  		height: height,
  	  		margin: {
	  			r: rm * marginFactor,
	  			t: tm * marginFactor,
	  			b: bm * marginFactor,
	  			l: lm * marginFactor,
	  		},
  	  	};
  		
  	  	var plotdata = [];
  	  	plotdata.push({
  	  		type: 'scattergeo',
  	  		locationmode: 'USA-states',
  	  		lat: lat,
  	  		lon: lon,
  	  		hoverinfo: 'text',
  	  		text: hoverlabels,
  	  		marker : {
  	  			size: mapvalues,
  	  			line: {
  	  				color : lineColor,
  	  				width: 1
  	  			},
  	  			color: markerColor
  	  		}
  	  	});
		
		var rtnval = [];
	   	rtnval.push(plotdata);
	   	rtnval.push(layout);
	   	return rtnval;
	},
    unpack: function(rows, key) {
        return rows.map(function(row) { return row[key]; });
    },
	getChartPropertiesLabel : function() {
		return $M.localize('uitext', 'mxapibase', 'ConfigureMapChart');
	},
	
	/**
	 * Map Chart needs two templates, the first is for the label and the second is for the value (factor)
	 */
	getHoverLabels : function(values, labels, hovertemplates) {
		if (hovertemplates && hovertemplates.length > 1) {
			var xtemplate = hovertemplates[0];
			var ytemplate = hovertemplates[1];
			var rtnvals = [];
			for (var ii = 0; ii < values.length; ii++) {
				rtnvals.push($M.replaceParams(xtemplate,[labels[ii]]) + '<br>' + $M.replaceParams(ytemplate,[values[ii]]));
			}
			return rtnvals;
		}
		else {
			return values;
		}		
	}	
};

