/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A select filter component.
 */
Polymer({
	is: 'maximo-selectfilter',
  	behaviors: [BaseComponent],
	properties : {
		labels: {
			type: String,
			value: null,
			notify: true,
			observer: 'addItems'
		},
		intvalues: {
			type: String,
			value: null,
			notify: true,
			observer: 'addItems'
		}
	},
  	created : function(){
  		
  	},
  	ready : function(){
  		
  	},
  	attached: function(){
  		
  	},
  	addItems: function() {
  		if ((this.labels) && (this.intvalues)) {
	  		var items = this.labels.split(',');
	  		var intvals = this.intvalues.split(',');
	  		for (var i = 0; i < items.length; i++) {
		  		var selection = document.createElement('div');
		  		selection.id = this.id + '_sel_' + i;
		  		selection.classList.add('horizontal');
		  		selection.intval = intvals[i];
		  		selection.textContent = items[i];
				Polymer.dom(this.$.selector).appendChild(selection);
	  		}
	  		this.$.selector.selected = intvals[0];
  		}
  	},
  	newSelection : function(e) {
  		this.fire('filter-selection-changed', e.detail.item.intval);
  	}
});