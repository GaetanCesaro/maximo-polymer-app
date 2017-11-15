/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A collapsible component.
 */
Polymer({
	is : 'maximo-collapsible',
	/**
	 * @polymerBehavior 
	 */
	behaviors : [ BaseComponent],
	properties : {
		label: {
			type: String,
			value: '',
			notify: true
		},
		height: {
			type: Number,
			value: 110,
			notify: true
		},	
		collapsed: { 
			type: Object,
			value: function(){
				return true;
			},
			notify: true,
			observer: 'toggleCollapse'
		},
		
		showActionButton: {
			type: Boolean,
			value: false,
			notify: true
		},
		actionFire: {
			type: String,
			notify: true,
			observer: '_toggleShowActionButton'
		},
		
		displayShowMore: {
			type: Boolean,
			value: true,
			notify: true
		},
	},
	created : function() {
		 this.showmore = $M.localize('uitext', 'mxapibase', 'Showmore');
		 this.showless = $M.localize('uitext', 'mxapibase', 'Showless');
	},
	
	ready : function() {
		
		var collapsible = this;
		var observer = new MutationObserver(function(mutations) {
			  mutations.forEach(function(mutation) {
				  if(collapsible.collapsed){
				    var scrollHeight = collapsible.$.collapsible.scrollHeight;
			    	if(scrollHeight<=collapsible.height || (scrollHeight-(collapsible.height*1.2))<=5){				    	
				    	$j(collapsible.$.collapse.$.button).css({'display':'none'});
				    	$j(collapsible.$.fadeout).css({'visibility':'hidden','height':'0px'});
				    	$j(collapsible.$.collapsible).css({'height':'auto'});
				    }
				    else{
				    	$j(collapsible.$.collapsible).height(collapsible.height);
				    	$j(collapsible.$.collapse.$.button).css({'display':''});
				    	$j(collapsible.$.fadeout).css({'visibility':'visible','height':'1em'});
				    	
				    }
				    
				    var ironlist = $M.findElementParent(collapsible.$.collapsible,'IRON-LIST');
			    	if(ironlist){
			    		ironlist.notifyResize();
					}
				  }
			  });    
		});
		
		// configuration of the observer:
		var config = {  childList: true, characterData: true, subtree: true };
		 
		
		observer.observe(this.$.collapsible, config);
	},
	
	toggleCollapse : function(collapse){
		
		this.fire('toggleCollapsible', {collapsed: this.collapsed});
		
		if(!this.ironlist){
			this.ironlist = $M.findElementParent(this.$.collapsible,'IRON-LIST');
		}
		var model ;
		if(this.ironlist){
			model = this.ironlist.modelForElement(this.$.collapsible);
		}
		
		this.label = collapse?this.showmore:this.showless;
		$j(this.$.fadeout).css({'display':collapse?'block':'none'});
		
		
		var setHeight = collapse?this.height:this.$.collapsible.scrollHeight;
		
		if(this.ironlist){
			 $j(this.ironlist).css({'overflow':'hidden'});
    	}
		
		//todo:  if all text is showing, don't show the showmore tag.  flip it to showless?
		
		
		//if(collapse){//otherwise the showless appears with no text
			$j(this.$.collapsible).height(setHeight);
		//}
		
		if(this.ironlist){
			var firstvisindex = this.ironlist.firstVisibleIndex;
			this.ironlist.updateSizeForItem(model.index);
			
			this.ironlist.notifyResize();
			
			//needed for ios
			this.ironlist.scrollToIndex(firstvisindex);
		} 

	},
	
	resizeCollapsible: function(height) {
		
		var collapse = this.collapsed;
		
		var setHeight;
		if (!height) {
			setHeight = collapse?this.height:this.$.collapsible.scrollHeight;
		}else{
			setHeight = height;
		}
		
		
		var model ;
		if(this.ironlist){
			model = this.ironlist.modelForElement(this.$.collapsible);
		}
		
		if(this.ironlist){
			 $j(this.ironlist).css({'overflow':'hidden'});
    	}
		
		$j(this.$.collapsible).height(setHeight);
		if(this.ironlist){
			this.ironlist.updateSizeForItem(model.index);
			
			this.ironlist.notifyResize();
//			this.ironlist.scrollToIndex(model.index);

		} 

	},
	
	toggleState : function(){
		this.collapsed = !this.collapsed;
	},
	
	fireAction: function(e) {
		console.log(this.actionFire);
		if (this.actionFire) {
    		this.fire(this.actionFire, e);
    	}
    },
    
    _toggleShowActionButton: function(newValue, oldValue) {
    	if (newValue && newValue.length > 0) {
    		this.showActionButton = true;
    	}else{
    		this.showActionButton = false;
    	}
    }
});
