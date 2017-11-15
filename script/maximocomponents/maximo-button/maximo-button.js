/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 *
 */
/*
`<maximo-button>` element. Behaves as normal button plus a few more properties

Example:
```html
	<maximo-button label="My Button Label"></maximo-button>
```

@demo
 */

Polymer({
	is : 'maximo-button',
	properties : {
		
		/**
		 * Defines the type of the button.
		 * Ex. radio, submit
		 */
		'default' : {
			type : Boolean,
			value : false
		},
		
		'disabled' : {
			type : Boolean,
			value : false,
			notify: true,
			observer: '_setDisabled'
		},
		/**
		 * Set icon to show on the button
		 */
		icon : {
			type : String
		},
		/**
		 * Set icon to show on the right of the button
		 */
		easticon : {
			type : String
		},
		label: {
			type: String,
			value : ''
		},
		type: {
			type: String,
			value: 'button'
		},
		action: {
			type: Boolean,
			value: false,
			observer: '_toggleActionClass'
		},
		synchronous: {
			type: Boolean,
			value : false
		},
		/** Number of second to show spinner after click */
		waitTimer: {
			type: Number,
			value: 1 
		},
		title: {
			type: String,
			value: ''
		}
	},
	/**
	 * @polymerBehavior 
	 */
	behaviors : [ BaseComponent, LoadingComponent, TableComponent ],
	ready : function() {
		$j(this.$.button).toggleClass('action',this.action);
		if(this.label) {
			$j(this.$.button).attr({'value':this.label});
		}
		
		if(!this.buttonTap){
			this.buttonTap = true;
			this.listen(this, 'tap', 'onTap');
		}
	},
	attached: function(){
		if(this.icon){
			$j(this.$.icon).css({'margin':'0px 5px'});
		}
		else {
			$j(this.$.icon).remove();
		}
		
		if(this.easticon){
			$j(this.$.easticon).css({'margin':'0px 0px 0px 5px'});
		}
		else {
			$j(this.$.easticon).remove();
		}
		$j(this.$.button).attr('title', this.title);
	},
	myToggleLoading: function(loading){
		if(this.disabled && loading === true){
			return true;
		}
		if (!this.icon && !this.easticon){
			return true;
		}
		$j(this.$.button).toggleClass('rotating',loading);
		var icon = this.$.icon;
		icon.icon = loading ? 'action-based:loading-spinner': this.icon;
		if(this.easticon){
			icon = this.$.easticon;
			icon.icon = loading ? 'action-based:loading-spinner': this.easticon;
		}
		if (loading && this.waitTimer > 0){
			var button = this;
			this.async(function(){
				button.myToggleLoading(false);
			}, this.waitTimer*1000);
		}
		return true;
	},
	_toggleActionClass: function(newvalue, oldvalue) {
		$j(this.$.button).toggleClass('action', newvalue);
	},
	_pointerEvents: function(disabled){
		return 'pointer-events:'+ (disabled?'none':'all');
	},
	keyed: function(e){
		if(e.keyCode === 13 || e.keyCode === 32){
			if(this.disabled){
				e.preventDefault();
				e.stopPropagation();
				return;
			}
			$j(this.$.button).trigger('tap');
		}
	},
	onTap: function(e){
		if(!this.synchronous){
			this.toggleLoading(true);
		}
		this.fire('tapped',{'message':'tapped'});
	},
	_setDisabled: function(){
		if(this.disabled){
			$j(this).attr({'disabled':'true','aria-disabled':'true'});
			$j(this.$.button).attr({'disabled':'true','aria-disabled':'true'});
			return;
		}
		$j(this).removeAttr('disabled');
		$j(this).removeAttr('aria-disabled');
		$j(this.$.button).removeAttr('disabled');
		$j(this.$.button).removeAttr('aria-disabled');
	},
    getTableDataBindInfo: function(){
    	return {
			input : $j(this),
			name : 'change',
			value : 'checked'
    	};
    }
});