/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-checkbox>` element. Behaves as normal checkbox plus a few more properties 

Example:
```html
	<maximo-checkbox label="My Checkbox Label" checked></maximo-checkbox>
```

@demo

### Accessibility
Tab into control. Use enter/space to toggle.	

*/ 

Polymer({
	is: 'maximo-checkbox',
  	behaviors: [BaseComponent,TableComponent,Polymer.IronCheckedElementBehavior],
	properties: {
		/** Label to show with checkbox. */
		label: {
			type: String,
			value: ''
		},
		labelFalse: {
			type: String,
			value: ''
		},
		triState: {
			type: Boolean,
			value: false,
			notify: true
		},
		/** Current checked value. */
		checked : {
			type: Boolean,
			value: false,
			observer: '_handleCheckedChange'
		},
		/** User editable. */
		readonly : {
			type: Boolean,
			value: false,
			observer: '_handleReadOnlyChange'
		},
		/** Display as slider */
		slider: {
			type: Boolean,
			value: false
		},
		_applied: {
			type: Boolean,
			value: false,
			observer: '_appliedChanged'
		},
		_pauseCheckChange: {
			type: Boolean,
			value: false
		},
		_checkedState: {
			type: String,
			value: ''
		}
	},
	
  	attached: function(){
  		$j(this._getCheckbox()).attr({'checked':this.checked});
  		$j(this._getCheckbox()).attr({'ws-swipe':'false'});
  		this._updateCheckedState();
  		//$j(this.$.label).find('label').attr({'for':this._getCheckbox().id});
  	},

  	_getCheckedString: function(){
  		return this.checked+'';
  	},
  	
  	/** Get current checked value. */
  	value : function(){
  		return this.checked;
  	},
  	
  	_getCheckbox: function(){
		this.checkbox = this.slider?$j(this.$.wrapper).find('.switch')[0]:$j(this.$.wrapper).find('.checkbox')[0];
  		return this.checkbox;
  	},

  	_getLabel: function(checked, label, labelFalse){
  		if(checked || !labelFalse){
  			return label?label:'';
  		}
  		return labelFalse?labelFalse:(label?label:'');
  	},
  	
  	_swipe: function(e){
  		if(!this.readonly && $j(this._getCheckbox()).attr('aria-disabled')!=='true'){
  			e.stopPropagation();
  			e.preventDefault();
  			if(e.detail.state==='end') {
  				this.checked = e.detail.dx > 5?true:false; 
  			}
  		}
  	},
  	
    _onKeyPress: function(e) {
    	if(!event.keyCode || event.keyCode === 13 || e.keyCode === 32){
    		this._onCheckTap();
    		e.stopPropagation();
    		e.preventDefault();
    	}
    },
  	
    _onCheckTap: function() {
    	if(!this.readonly && $j(this._getCheckbox()).attr('aria-disabled')!=='true'){
    		this.checked = !this.checked;
    	}
    },
    
    _handleCheckedChange: function(newValue, oldValue)
    {
    	if(this._getCheckbox()){
    		if(!this._pauseCheckChange){
		    	if(this.checked === true || (this.triState && this._applied === false)){
		    		if(this.triState){
			    		if(!this._applied){
				    		this._applied = true;
			    			$j(this._getCheckbox()).attr({'checked':true});
			    		}
			    		else {
			    			$j(this._getCheckbox()).removeAttr('checked');
				    		this._applied = false;
				    		this._pauseCheckChange = true;
				    		this.checked = false;
				    		this._pauseCheckChange = false;
			    		}
		    		}
		    		else {
		    			$j(this._getCheckbox()).attr({'checked':true});
		    		}
		    	}
		    	else {
	    			$j(this._getCheckbox()).removeAttr('checked');	
		    	}
    		}
	    	//this.async(function(){
    			this._updateCheckedState();
	    		this.fire('change', this.checked);
	    		this.fire('maximo-checkbox-changed', this);
	    	//});
    	}
    },
    _updateCheckedState: function(){
		if(this.triState && !this._applied){
    		this._checkedState = 'mixed';
    	}
    	else {
    		this._checkedState = this.checked.toString();
    	}
		var state = this._checkedState==='mixed'?'indeterminate':this._checkedState==='true'?'checked':'unchecked';
		var title = this.localize('uitext','mxapibase', state);
		if(this.labelFalse){
			title = this.checked?this.label:this.labelFalse;
		}
		$j(this.$.wrapper).attr('title', title);    	
    },
    _handleReadOnlyChange: function(){
   		$j(this._getCheckbox()).attr({'aria-disabled':this.readonly});
   		$j(this.$.wrapper).toggleClass('readonly',this.readonly);
    },
    getTableDataBindInfo: function(){
    	return {
			input : this,
			name : 'change',
			value : 'checked'
    	};
    },
    _triStateClass: function(triState){
    	return triState?' triState':'';
    },
    _appliedChanged: function(){
    	if(this.triState){
    		$j(this._getCheckbox()).toggleClass('applied',this._applied);
    	}
    },
    getChecked: function(){
    	return this._checkedState;
    }
});
