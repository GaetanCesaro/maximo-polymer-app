/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A Chart header component.
 */
Polymer({
	is: 'maximo-chartheader',
  	behaviors: [BaseComponent],
	properties : {
  		block: {
  			type: Boolean,
  			value: false
  		},
		icon: {
			type: String,
			notify: true
		},
		label: {
        	type: String,
        	notify:true
		},
		fontweight: {
			type: String,
			value: '',
			notify: true
		},
		fontsize : {
			type: String,
			value: '150%',
			notify: true
		},
		collapsed : {
			type: String,
			notify:true
		},
		width: {
        	type: String,
        	notify:true
		},
		showicons: {
			type: Boolean,
			value: false,
			notify: true
		}			
	},
  	created : function(){
  		
  	},
  	ready : function(){
  		if (this.width){
  	  		$j(this.$.maximoContentSection).css({'width':this.width});  			
  		}  		
  	},
  	attached: function(){
  		if(this.showicons){
  			$j(this.$.iconsection).fadeIn();	
  		}
  	},
  	showIcons : function (showicon) {
  		return showicon;
  	}, 
	toggleSwitch: function(){
		this.showicons = !this.showicons;	
		//this.$.moreicons.icon = this.showicons ? 'more-horiz' : 'more-vert';
		var method = this.showicons?'fadeIn':'fadeOut';
		$j(this.$.iconsection)[method]('fast');
		$j(this.$.moreicons).toggleClass('rotate',this.showicons);
		this.$$('.moreicons').setAttribute('title', this.showicons ? this.localize('uitext', 'mxapibase', 'HideChartOptions') : this.localize('uitext', 'mxapibase', 'ShowChartOptions'));
	},
	openFull: function (e) {
		this.fire('openfull', e);
	},
	download: function (e) {
		this.fire('download', e);
	},
	changetype: function (e) {
		this.fire('changetype', e);
	},
	changeprops: function (e) {
		this.fire('changeprops', e);
	},
	showabout : function(e){
		this.fire('showabout', e);
	}
});
