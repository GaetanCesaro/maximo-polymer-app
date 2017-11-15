/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
Maximo label element. Behaves as normal label plus a few more properties 

Example:
```html
		<maximo-label id="labelName" on-tap="callFunc" label="Your label's name" block="true" bold></maximo-label>
```

### Label - The Localize function 
- Generally, when you set the label propertie for the label component, as we have a globalization process,
you should use a function called "localize", where you define a maximo object and a maximo attribute that will have
the static value for the label that you are applying which will have the value translated to the correct language that 
the client is accessing from.

Example:
```html
	<maximo-label class="labelName" label="{{localize('uitext','objectname','labelname (The attribute that has the static value)')}}" block="true"></maximo-label>
```

@demo
 */

Polymer({
	is: 'maximo-label',
	properties: {
		label: {
			type: String,
			observer: 'evaluateLabel'
		},
		event: {
			type: String,
			value: ''
		},
				/** Boolean value, same as block on CSS, alows to display a object side-by-side */

  		block: {
  			type: Boolean,
  			value: false
  		},
  		fontsize: {
  			type: String,
  			value: '',
  			notify: true
  		},
  		fontweight: {
  			type: String,
  			value: '',
  			notify: true
  		},
  				/** String values for wordwrap are: normal, break-word (use when no white spaces are found for very large text) */		
		wordwrap: {
  			type: String,
  			value: ''
  		},
  				/** Boolean value, same as blod on CSS, display the value bolded */
  		bold: {
  			type: Boolean,
  			value: false
  		},
  		
  		icon:{
  			type: String,
  			value:'',
  			notify:true
  		},
		ellipsisSize : {
			type: Number,
			value: 0,
			observer: '_updateLabel'
		}
	},
  	behaviors: [BaseComponent, TableComponent],
  	
  	ready: function() {
  		if(this.event !== ''){
  			this.toggleClass('event',true,this.$.label);
  			$j(this.$.label).attr({'role':'button','title':this.label});
  		}
 		
  		$j(this.$.label).css({'display':this.block?'block':'inline'});
  		
  		if(this.fontsize!==''){
  			$j(this.$.label).css({'font-size':this.fontsize});
  		}
  		if(this.fontweight!==''){
  			$j(this.$.label).css({'font-weight':this.fontweight});
  		}
  		
  		if(this.wordwrap!==''){
  			$j(this.$.label).css({'word-wrap':this.wordwrap});
  		}
  		
		if(!this.icon){
			$j(this.$.labelicon).css({'display':'none'});
		} else {
			$j(this.$.labelicon).css({'color':'#5aaafa','vertical-align':'bottom'});
		}
		
		this._updateLabel();
  	},
  	attached: function(){
  		
  	 	if(this.event && !this.synchronous && !this.labelTap){
			this.labelTap = true;
			this.listen(this, 'tap', 'onTap');
		}	
  	},
  	/*
  	You can use it to call a function for you.
  	*/
	onTap: function(e){
		if(this.event && !this.synchronous && !this.labelTap){
			if(this.asynchronous){
				$M.toggleWait(true);
			}
		}
	},
	evaluateLabel: function() {
		var attributes = this.attributes;
		this.label = $M.format(attributes.getNamedItem('format'), this.label);
		this._updateLabel();
	},
	/**
	 * When setting ellipsisSize,  ellipsis the part of Label's contents 
	 */
	_updateLabel : function() {
		var labelString = '';
		
		if (this.ellipsisSize > 0 && this.label) {
			if (this.label.length > this.ellipsisSize) {
				labelString = this.label.substring(0, this.ellipsisSize);
				labelString += '...';
				this.label = labelString;
			}
		}
	}
});