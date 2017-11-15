/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
`<maximo-select>` element. Behave as a simple select box, to select data inside an array/collection

Example:
```html
  <maximo-select id="demo" values='[1,2,3,4,5,6,7,8,9]' collection="{{data}}" label="Select:"></maximo-searchbar>
```
### Setting values - Which propertie should i use?
Generally, the "collection" propertie is used to pass to the maximo-select some binded data from you card.The "values" propertie is used to set static data.
@demo
 */

Polymer({
	is: 'maximo-select',
  	behaviors: [BaseComponent, TableComponent],
	properties : {
    /**
     * Set the label value
     */
		label: {
			type : String,
			value : ''
		},
		recordData: {
			type: Array,
			value : function() {
				return [];
			}
		},
		value : {
			type: String,
			value : '',
			notify: true,
			observer: '_valueChanged'
		},
		/**
	     * hint that describes that the expected value is empty
	     */
	    readonlyEmptyPlaceholder: {
	    	type: String,
	        value: function(){
	        	return this.localize('uitext','mxapibase','NotEntered'); 
	        }
	    },
	    /**
	     * short hint that describes the expected value of an input field
	     */
	    placeholder: {
	    	type: String,
	        value: function(){
	        	return '';  
	        }
	    },		    
    /**
     * Set the values that will work as an option tag from html, you can pass thru an array.
     */
		values : {
			type: String,
			value : '',
			observer: '_updateOptions'
		},
     /**
     * Set the checkbox as a Read only component
     */
		readonly : {
			type: Boolean,
			value: false,
			notify: true
		},
		internalLabel: {
			type: Boolean,
			value: false
		},
	    required: {
	         type: Boolean,
	         value: false,
	         notify: true
	    }
	},
  	created : function(){
  		
  	},
    /**
     * Load the variables and prepare the component
     */
  	ready : function(){
  		var labelDisplay = this.internalLabel?'none':'block';
  		$j(this.$.label).attr({'for':this.$.select.id});
  		$j(this.$.label).css({'display':labelDisplay});
    	$j(this.$.select).attr({'name':this.$.select.id});
    	if(this.width){
    		$j(this.$.select).css({'width':this.width});
    	}
    	$j(this.$.select).val(this.value);

    	this.initialized = true;
    	this._updateOptions();
  	},
  	attached: function(){
  		
  	},
  	_valueChanged: function(){

  	},
    /**
     * Work as an observer for the options, changing the value on the fly
     */
  	_updateOptions : function(){
  		if(!this.initialized || !this.values||this.values.length==0){
  			return;
  		}
  		this.options = this.values.split(',');
  		$j(this.$.select).empty();
  		var my = this;
  		if(this.internalLabel){
  			var optionElement = $j(document.createElement('option'));
  			optionElement.attr({'disabled':'true','selected':'true','hidden':'true'});
  			optionElement.toggleClass('placeholder',true);
  			optionElement.toggleClass('required',this.required);
  	  		optionElement.text(this.label);
  	  		$j(my.$.select).append(optionElement);
  		}
  		
  		if(this.placeholder){
  			var optionElement = $j(document.createElement('option'));
  			optionElement.attr({'id':my.id+'header','value':''});
  			optionElement.attr({'selected':''});
  			if(this.$.select.disabled===true){
  				optionElement[0].innerHTML=this.readonlyEmptyPlaceholder;	
  			} else {
  				optionElement[0].innerHTML=this.placeholder;
  			}
  			optionElement.attr('style','font-style: italic; color:#464646;');
  			$j(my.$.select).append(optionElement);
  		}
  		
  		this.options.forEach(function(option){
  			if(!my.required || option !== ''){
	  			var optionElement = $j(document.createElement('option'));
	  			var optionValueDisplay = option.split(':');
	  			optionElement.attr({'id':my.id+option,'value':optionValueDisplay[0]});
	  			if (optionValueDisplay[0] === my.value) {
	  				optionElement.attr({'selected':'selected'});
	  			}
	  			optionElement.text(optionValueDisplay[1]?optionValueDisplay[1]:optionValueDisplay[0]);
	  			$j(my.$.select).append(optionElement);
  			}
  		});
  	},
    getTableDataBindInfo: function(){
    	return {
			input : this,
			name : 'input',
			value : 'value'
    	};
    }
});