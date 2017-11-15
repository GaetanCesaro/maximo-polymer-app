/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A wait component.
 */
Polymer({
	is: 'maximo-wait',
  	behaviors: [BaseComponent],
	properties : {
		show: {
			type: Boolean,
			value: false,
			observer: '_toggleShow'
		},
		zIndex: {
			type: String,
			value: ''
		}
	},
	toggle: function(show){
		this.show = show;
	},
	created: function(){
		if(!$M.wait){
			$M.wait = this;
		}
	},
	_zIndexStyle: function(zIndex){
		if(zIndex && zIndex.length>0){
			return 'style$="z-index:'+zIndex+'"';
		}
		return '';
	},
	_toggleShow: function(){
		$j(this.$.wait).css({'display':this.show?'initial':'none'});
	}
});