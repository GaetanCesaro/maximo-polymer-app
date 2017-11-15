/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
    is: 'maximo-svgdonut',
    properties: {

    	/**
    	 * Color of the progress.
    	 * Defaults to green color.
    	 */
    	color: {
    		type: String,
    		value: '#8cd211',
    		notify: true
    	},

    	successColor: {
    		type: String,
    		value: '#4B8400', //green
    		notify: true
    	},
    	
    	cautionColor: {
    		type: String,
    		value: '#fdd600', //yellow
    		notify: true
    	},
    	
    	dangerColor: {
    		type: String,
    		value: '#e71d32', //red
    		notify: true
    	},
    	
    	dangerLimit: {
    		type: Number,
    		value: 0,
    		notify: true
    	},

    	cautionLimit: {
    		type: Number,
    		value: 0,
    		notify: true
    	},
    	
    	percentageTextSize: {
    		type: String,
    		value: '40%',
    		notify: true
    	},
    	
    	/**
    	 * String showed on mouse hover
    	 */
    	hoverText: {
    		type: String,
    		value: '',
    		notify: true
    	},
    	
    	/**
    	 * Percentage of the progress from 0 to 100.
    	 * Defaults to 0.
    	 */
    	percentage: {
    		type: Number,
    		value: 0,
    		notify: true,
    		observer: 'percentageChanged'
    	},

    	/**
    	 * Size of the circle. Defaults to 70.
    	 */
    	size: {
    		type: Number,
    		value: 70,
    		notify: true
    	}
    },

	percentageChanged: function()
	{
		this.update();
	},

	update: function()
	{
		var size = this.getAttribute('size');
		var color = this.getAttribute('color');
		var percentageTextSize = this.getAttribute('percentageTextSize');
		var successColor =  this.getAttribute('successColor') ? this.getAttribute('successColor') : this.successColor;
		var cautionColor =  this.getAttribute('cautionColor') ? this.getAttribute('cautionColor') : this.cautionColor;
		var dangerColor =  this.getAttribute('dangerColor') ? this.getAttribute('dangerColor') : this.dangerColor;
		var dangerLimit =  this.getAttribute('dangerLimit') ? this.getAttribute('dangerLimit') : this.dangerLimit;
		var cautionLimit =  this.getAttribute('cautionLimit') ? this.getAttribute('cautionLimit') : this.cautionLimit;
		var hoverText = this.getAttribute('hoverText') ? this.getAttribute('hoverText') : this.hoverText;
		
		var percentage = this.getAttribute('percentage');

		if (percentage === 'NaN'){
			this.percentage = 0;
		}
		
		if (!size) { return; }

	    var svgns = 'http://www.w3.org/2000/svg';
	    var chart = document.createElementNS(svgns, 'svg:svg');
	    chart.setAttribute('id', 'd1');
	    chart.setAttribute('width', size);
	    chart.setAttribute('height', size);
	    chart.setAttribute('viewBox', '0 0 ' + size + ' ' + size);

	    //Container
	    var container = document.createElementNS(svgns, 'g');
	    
	    //Tool tip / alt
	    var title = document.createElementNS(svgns, 'title');
   		title.textContent = hoverText + ' ' + this.percentage + '%.';
   		
   		container.appendChild(title);
	    
	    // Background circle
	    var back = document.createElementNS(svgns, 'circle');
	    back.setAttributeNS(null, 'cx', size / 2);
	    back.setAttributeNS(null, 'cy', size / 2);
	    back.setAttributeNS(null, 'r',  size / 2);

	    //stroke='black' stroke-width='10'
	    color = '#d0d0d0';
	    if (size > 50) {
	        color = '#ebebeb';
	    }

	    back.setAttributeNS(null, 'fill', color);
	    container.appendChild(back);

	    // primary wedge
	    var path = document.createElementNS(svgns, 'path');
	    var unit = (Math.PI *2) / 100;
	    var startangle = 0;
	    var endangle = this.percentage * unit - 0.001;
	    var x1 = (size / 2) + (size / 2) * Math.sin(startangle);
	    var y1 = (size / 2) - (size / 2) * Math.cos(startangle);
	    var x2 = (size / 2) + (size / 2) * Math.sin(endangle);
	    var y2 = (size / 2) - (size / 2) * Math.cos(endangle);

	    var big = 0;
	    if (endangle - startangle > Math.PI)
	    {
	        big = 1;
	    }
	    var d = 'M ' + (size / 2) + ',' + (size / 2) +  // Start at circle center
	        ' L ' + x1 + ',' + y1 +     // Draw line to (x1,y1)
	        ' A ' + (size / 2) + ',' + (size / 2) +       // Draw an arc of radius r
	        ' 0 ' + big + ' 1 ' +       // Arc details...
	        x2 + ',' + y2 +             // Arc goes to to (x2,y2)
	        ' Z';                       // Close path back to (cx,cy)

	    percentage = parseInt(this.percentage);
	    dangerLimit = parseInt(dangerLimit);
	    cautionLimit = parseInt(cautionLimit);
	    
		//controls which color should draw circle based on percentage level.
	    if (percentage <= dangerLimit) {
	        this.color = dangerColor;
	    } else if (percentage <= cautionLimit) {
	    	 this.color = cautionColor;
	    } else {
	    	this.color = successColor;
	    }
	    
	    path.setAttribute('d', d); // Set this path
	    path.setAttribute('fill', this.color);	// Fill of the progress
	    path.setAttribute('stroke-width', 1);
	    container.appendChild(path); // Add wedge to chart

	    // foreground circle
	    var front = document.createElementNS(svgns, 'circle');
	    front.setAttributeNS(null, 'cx', (size / 2));
	    front.setAttributeNS(null, 'cy', (size / 2));
	    front.setAttributeNS(null, 'r',  (size * 0.4));
	    front.setAttributeNS(null, 'fill', '#fff');	// CENTER FILL of the circle
	    container.appendChild(front);

	    var text = document.createElementNS(svgns, 'text');
	    text.setAttributeNS(null, 'x', (size / 2));
	    text.setAttributeNS(null, 'y', (size / 2) + (size*0.083));
	    text.setAttribute('text-anchor', 'middle');
	    text.setAttribute('font-size', percentageTextSize);
 	    var txtnode = document.createTextNode('' + this.percentage + '%');
//	    var txtnode = document.createTextNode('' + this.percentage);
   		text.appendChild(txtnode);

   		container.appendChild(text);
   		
   		chart.appendChild(container);

		this.chart = chart;

		var alreadyExistingChild = this.$.container.firstChild;
		if (alreadyExistingChild)
		{
			this.$.container.removeChild(alreadyExistingChild);
		}

		this.$.container.appendChild(chart);
	}


});