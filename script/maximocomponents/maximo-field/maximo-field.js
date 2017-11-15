/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
Maximo field element. Behaves as normal field plus a few more properties 

Example:
```html
				<maximo-field id="label1" label="Your favorite" datalabel="Field"></maximo-field>
```

### Label - The Localize function 
- Generally, when you set the label propertie for the field component, as we have a globalization process,
you should use a function called "localize", where you define a maximo object and a maximo attribute that will have
the static value for the label that you are applying which will have the value translated to the correct language that 
the client is accessing from.

Example:
```html
				<maximo-field id="label1" label="{{localize('uitext','objectname','fieldname (The attribute that has the static value)')}}" datalabel="Field"></maximo-field>
```

@demo
 */

Polymer({
	is: 'maximo-field',
  	behaviors: [BaseComponent],
	properties : {
		label: {
			type: String,
			value: '',
			notify:true,
			observer: '_labelChanged'
		},
		datalabel: {
			type: String,
			observer: 'evaluateNoData'
		},
		/**
		 * Optional string to show in case no datalabel present
		 */
		emptyValueString: {
			type: String,
			value: '',
			notify:true
		},
		hideData: {
			type: Boolean,
			value: false,
			notify: true
		},
		hideWhenEmpty: {
			type: Object,
			value: function(){
				return false;
			},
			notify: true
		},
		ellipsisSize : {
			type: Number,
			value: 0
		}
	},

	attached : function() {
		this._labelChanged(this.label);
		if (!this.datalabel && !this.hideWhenEmpty){
			
			if (this.emptyValueString.length > 0) {
				this.datalabel = this.emptyValueString;
			}else {
				this.datalabel = $M.getNoDataString();
			}
		}
	},
	
	_labelChanged : function(val) {
		var attributes = this.attributes;
		this.datalabel = $M.format(attributes.getNamedItem('format'), this.datalabel);
			if(this.hideWhenEmpty){
				$j(this.$.wrapper).css({'display': (this.datalabel ? 'initial': 'none')});
			}
		
		//apply styling class for Not Entered fields.
		$j(this.$.datalabel).toggleClass('notEnteredLabel',(this.datalabel === $M.getNoDataString() || this.datalabel === this.emptyValueString));
	},
	
	/**
	 * When No data exists for a field we display N/A
	 * Observer will always evaluate the field.
	 */
	evaluateNoData : function(){
		this.attached();
	}

});