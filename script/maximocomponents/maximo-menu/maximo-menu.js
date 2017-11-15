/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

Polymer({

    is: 'maximo-menu',
    
    properties: {
    	
    	labelList : {
    		type : Array,
			value: [],
			notify: true
    	},
    	
    	isMenuVisible : {
    		type: Boolean,
    		value: false,
    		notify: true
    	}
    },
    
    ready: function() {
    },

    attached: function(){
    },

    //      Polymer.IronOverlayBehavior,Polymer.IronResizableBehavior
    behaviors: [],
    
    toggleMenuVisibility: function () {

    	if (!this.isMenuVisible) {
    		this._layOutComponent();
    	}
    	
    	this.isMenuVisible = !this.isMenuVisible;
    	this.toggleClass('opened', this.isMenuVisible);
    	
    },
    
    _layOutComponent: function() {
    	
    	
//    	var parentRec = this.domHost.getBoundingClientRect();
//    	var iconRec = this.$.menuiconcol.getBoundingClientRect();
    	
//    	this.$.iconframe.style.height = iconRec.height + 'px';
//    	this.$.iconframe.style.display = 'block';
    	
    	this.$.maindiv.style.marginLeft = '-32px';
    	this.$.maindiv.style.marginTop = '-32px';
    	
//    	this.$.maindiv.style.top = iconRec.bottom + iconRec.height + 'px';
//    	this.$.maindiv.style.right = iconRec.left + 'px';
    	
    	//this.domHost.getBoundingClientRect()
    	//console.log(this.domHost);
    },
    
    /**
     * trigger custom function hosted in parent
     */
    fireEvent: function (e) {
    	if (e.model.menuitem.func) {
    		this.fire(e.model.menuitem.func, e);
    	}
    },
    
    /**
     * ARCHIVED
     */
    _buildContent: function (list, parentNode) {
    	
    	if (!list || list.length < 1){
    		return;
    	}
    	
    	if (parentNode.childElementCount > 0) {
    		return;
    	}
    	
    	for(var i=0; i<list.length; i++){
		
    		var props = {'action':true, 'label':list[i].label};
    		props.style = 'display: block';
    		if (!list[i].clickable){
    			props.disabled = true;
    		}
    		
			var button = Polymer.Base.create('maximo-button', props);
    		
    		if (list[i].func){
    			var fn = this.domHost[list[i].func];
    			//no more jquery 'tap' event, following code will need to be changed
    			$j(button).bind('tap', function(e){
    				console.log(e);
    				fn();
    			});
    		}
    		
    		parentNode.appendChild(button);
    		
    		if (list[i].children && list[i].children.length > 0){
    			var div = Polymer.Base.create('div');
    			parentNode.appendChild(div);
    			this._buildContent(list[i].children, div);
    		}
    		
    	}
    	
    }

});