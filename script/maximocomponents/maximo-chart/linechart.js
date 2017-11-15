/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
var MaximoChart_linechart = MaximoChart_linechart || {};
MaximoChart_linechart = {
    getChartStructures: function(values, labels, width, height, chartoptions, hovertemplates, marginFactor) {
        var rm = chartoptions.rmargin ? chartoptions.rmargin : 0;
        var tm = chartoptions.tmargin ? chartoptions.tmargin : 0;
        var bm = chartoptions.bmargin ? chartoptions.bmargin : 0;
        var lm = chartoptions.lmargin ? chartoptions.lmargin : 0;
        var xaxisValue = chartoptions.xaxis ? chartoptions.xaxis : {
            title: "",
            titlefont: {
                family: 'HelveticaNeue,sans-serif',
                size: 12,
                color: '#6d7777'
            }
        };
        var yaxisValue = chartoptions.yaxis ? chartoptions.yaxis : {
            title: "",
            titlefont: {
                family: 'HelveticaNeue,sans-serif',
                size: 12,
                color: '#6d7777'
            }
        };
        var fontsize = marginFactor > 1 ? 14 : 12;
        var showlegend = chartoptions.showLegend ? chartoptions.showLegend : false;
        var layout = {
            showlegend: showlegend,
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
            },
            xaxis: xaxisValue,
            yaxis: yaxisValue
        };
        var hoverlabels = this.getHoverLabels(values, labels, hovertemplates);
        var markerColor = chartoptions.markerColor ? chartoptions.markerColor : $M.colorPalleteRGB[0];
        var lineColor = chartoptions.lineColor ? chartoptions.lineColor : $M.colorPalleteRGB[0];
        var mode = chartoptions.mode ? chartoptions.mode : 'lines';
        var chartName = chartoptions.chartName ? chartoptions.chartName : null ;
        var plotdata = [];
        plotdata.push({
            y: values,
            x: labels,
            type: 'scatter',
            mode: mode,
            hoverinfo: 'text',
            text: hoverlabels,
            marker: {
                color: markerColor
            },
            line: {
                color: lineColor
            },
            name: chartName
        });
        var rtnval = [];
        rtnval.push(plotdata);
        rtnval.push(layout);
        return rtnval;
    },
    getChartPropertiesLabel: function() {
        return $M.localize('uitext', 'mxapibase', 'ConfigureLineChart');
    },
    /**
	 * Line Chart needs two templates, the first is for the label and the second is for the value
	 */
    getHoverLabels: function(values, labels, hovertemplates) {
        if (hovertemplates && hovertemplates.length > 1) {
            var xtemplate = hovertemplates[0];
            var ytemplate = hovertemplates[1];
            var rtnvals = [];
            for (var ii = 0; ii < values.length; ii++) {
                rtnvals.push($M.replaceParams(xtemplate, [labels[ii]]) + '<br>' + $M.replaceParams(ytemplate, [values[ii]]));
            }
            return rtnvals;
        } else {
            return values;
        }
    }
};
