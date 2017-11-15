/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-wizard-step>` creates a step within a wizard bar.

Must be used within `<maximo-wizard>`

 */
Polymer({
	is: 'maximo-wizard-step',
	properties: {
		/** Label to show for step. Will also be used by helpTitle if one is not provided. Override helpTitle by setting it to ''. */
		label: {
			type: String,
			observer: '_evaluateLabel'
		},
		/** Help section title. */
		helpTitle: {
			type: String,
			value: ''
		},
		/** Help section text. */
		helpText: {
			type: String,
			value: ''
		},
		/** Help section actions. Can be an array of action objects {'event':xxx','icon':'xxx','label':'xxx'} */
		actions: {
			type: Array,
			value: ''
		},
		_initial: {
			type: Object,
			value: function(){
				return true;
			}
		},
		_complete: {
			type: Object,
			value: function(){
				return false;
			}
		}
	},
  	behaviors: [BaseComponent],
  	ready: function() {
  		$j(this).attr('disabled', true);
  		
  		if(this.event !== ''){
  			$j(this.$.label).attr({'role':'button','title':this.label});
  		}
 		
  		$j(this.$.label).css({'display':this.block?'block':'inline'});
  		
  		if(this.fontsize!==''){
  			$j(this.$.label).css({'font-size':this.fontsize});
  		}
  		if(this.fontweight!==''){
  			$j(this.$.label).css({'font-weight':this.fontweight});
  		}
  		
		if(!this.icon){
			$j(this.$.labelicon).css({'display':'none'});
		} else {
			$j(this.$.labelicon).css({'color':'#5aaafa','vertical-align':'bottom'});
		}
		
		this._updateLabel();
  	},
	_evaluateLabel: function() {
		var attributes = this.attributes;
		this.label = $M.format(attributes.getNamedItem('format'), this.label);
		this._updateLabel();
	},
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