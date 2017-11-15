/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A section component.
 */
Polymer({
	is: 'maximo-section',
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
		alternateLabel: {
			type: String,
			value: '',
        	notify:true
		},
		noIcon: {
			type: Boolean,
			value: false,
			notify: true
		},
		showAlternateLabel: {
			type: Boolean,
			value: false,
			notify: true
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
			notify: true
		},
		width: {
        	type: String,
        	notify:true
		},
		customstyle: {
			type: String,
			notify: true,
			observer: '_toggleStyle'
		},
		showBottomToggler: {
			type: Boolean,
			value: false,
			notify: true
		},
		
		dedicatedAction: {
			type: Boolean,
			value: false,
			notify: true
		}					
	},
  	created : function(){
  		
  	},
  	ready : function(){
  		
  		if(this.dedicatedAction) {
  	  		this.set('collapseIcon','');
  		}
  		else {
  			this.set('collapseIcon','icons:chevron-right');
  		}
  		
  		if(typeof this.collapsed==='undefined'){
  			$j(this.$.sectionCollapseIcon).css({'display':'none'});
  		} 
  		else {
  			if(this.collapsed==='true'){
  				this.$.maximoSectionIronCollapse.toggle();
				$j(this.$.maximoSectionLabel).toggleClass('styleLabelasLink', true);
				$j(this.$.maximoSectionLabelAlternate).toggleClass('styleLabelasLink', true);
				$j(this.$.maximoSectionLabelAlternateFooter).toggleClass('styleLabelasLink', true);
  			}
  			
  			//this.$.sectionCollapseIcon.icon = this.$.maximoSectionIronCollapse.opened?'icons:expand-more':'icons:chevron-right';
  			$j(this.$.sectionCollapseIcon).toggleClass('expanded',this.$.maximoSectionIronCollapse.opened);
  		}
  		if (this.width){
  	  		$j(this.$.maximoContentSection).css({'width':this.width});  			
  		}
  	},
  	attached: function(){
  		if (!this.label){
  			$j(this.$.title).css({'display':'none'});  
  		}
  	},
  	
  	_toggleStyle: function(newvalue, oldvalue) {
  		
  		if (newvalue === 'raw') {
			$j(this.$.maximoSectionLabel).toggleClass('raw', true);
			$j(this.$.maximoSectionLabelAlternate).toggleClass('raw', true);
			$j(this.$.summaryLabel).toggleClass('raw', true);
			$j(this.$.sectionCollapseIcon).toggleClass('raw', true);
			$j(this.$.maximoContentSection).toggleClass('raw', true);
			$j(this.$.maximoContentInnerSection).toggleClass('raw', true);
			$j(this.$.title).toggleClass('raw', true);
  		}
  		
  		if (newvalue === 'modest'){
  			$j(this.$.defautrow).hide();
  			$j(this.$.modestrow).show();
  			
  			$j(this.$.maximoSectionLabel2).toggleClass('modest', true);
  			$j(this.$.sectionCollapseIcon2).toggleClass('modest', true);
  			$j(this.$.title).toggleClass('modest', true);
  			$j(this.$.maximoContentInnerSection).toggleClass('modest', true);
  		}
  	},
  	
	haveIcon : function (icon){
		return Boolean(icon && (icon.length > 0));
	},
	
	toggleCollapse: function(){
		
//		if (this.collapsed !== 'true'){
//			return;
//		}
		
		this.$.maximoSectionIronCollapse.toggle();
		//this.$.sectionCollapseIcon.icon = this.$.maximoSectionIronCollapse.opened?'icons:expand-more':'icons:chevron-right';
		$j(this.$.sectionCollapseIcon).toggleClass('expanded',this.$.maximoSectionIronCollapse.opened);
		$j(this.$.sectionCollapseIcon2).toggleClass('expanded',this.$.maximoSectionIronCollapse.opened);
		
		if (this.alternateLabel && this.alternateLabel.length > 0){
			this.showAlternateLabel = !this.showAlternateLabel;
		}
		
		$j(this.$.maximoContentSection).toggleClass('cold', this.$.maximoSectionIronCollapse.opened);
		$j(this.$.title).toggleClass('cold', this.$.maximoSectionIronCollapse.opened);
		
		this.fire('toggle', {opened: this.$.maximoSectionIronCollapse.opened});
			
		if(!this.ironlist){
			this.ironlist = $M.findElementParent(this.$.maximoSectionIronCollapse,'IRON-LIST');
		}
		var model ;
		if(this.ironlist){
			model = this.ironlist.modelForElement(this.$.maximoSectionIronCollapse);
		}
		this.collapsed = this.collapsed === 'true'?'false':'true';
		this.async(function(){
  			var panel = $M.findElementParent(this,'MAXIMO-PANEL');
  			var lists = $j(panel).find('iron-list');
  			lists.each(function(index){
  				//lists[index].notifyResize();
  				lists[index].updateSizeForItem(model.index);
  			});		
		},350); 
	}
});