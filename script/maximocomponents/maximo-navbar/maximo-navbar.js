/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A navigation bar component.
 */
Polymer({
	is: 'maximo-navbar',
    /**
     * Fired when a menu is selected.
     *
     * @event selected
     */
    properties: {
    	resolvedItemCount : {
    		type:String,
    		notify : true,
    		value : '0'
    	},
    	height : {
    		type:String,
    		notify: true
    	},
    	mode : {
    		type: String,
    		notify:true
    	},
    	items : {
    		type : Array,
    		value: function(){return [];},
    		observer: '_mapItems'
    	},
    	selectedIndex : {
    		type : Number,
    		value : 0
    	},
    	screenMode : {
    		type : String,
    		value : 'desktop',
    		notify: true
    	},
    	subRoute: {
    		type: Boolean,
    		value: false
    	},
    	landscapeOnly : {
    		type: Boolean,
    		value: false
    	}
    	
	},
	resizeTimer: {},
	
	attached : function(){
		if(!this.subRoute){
			this._subRouteChanged(this.items[0].subRoute);
			return;
		}
		if(!this.lastRoute && $M.getSubRoute() === ''){
				$M.setSubRoute(this.items[0].subRoute);
		}
	},
    observers: [
        '_subRouteChanged(navbarData.route)'
    ],
	ready: function()
	{
		if(this.route && $M.getSubRoute().length===0){
			$M.setSubRoute(this.route);
		}
		$j(this.$.menudiv).attr({'hidden':true});
		$j(this.$.bottomnavbar).attr({'hidden':true});
	},
	_mapItems: function(items){
		var navbar = this;
		items.forEach(function(item, index){
			if(item.subRoute){
				navbar._itemMap[item.subRoute] = index;
			}
		});
	},
	created: function(){
		var navbar = this;
		this._itemMap = {};
		this.async(function(){
			$j('body').css({'overflow':'hidden'});
			navbar._onWindowResize();
		}, 100);
		 $j(window).on('resize', function(){
	         window.clearTimeout(this.resizeTimer);
	         this.resizeTimer = window.setTimeout(function(){
	        	 navbar._onWindowResize();
	         }, 250);
	     });

	},
	
	_onWindowResize : function(){
		var height;
		var orientation = $M.getOrientation();
		if($M.screenInfo.device === 'desktop'){ // for desktop mode -> fix side navbar
			height = parseInt(window.innerHeight)-50;  // 50 : header bar size
			this.setNavBarMode('side', '');
		}
		else if($M.screenInfo.device === 'tablet' ||$M.screenInfo.device === 'phone'){ // for tablet mode
			if(orientation === 'portrait'){
				height = parseInt(window.innerHeight)-122;	// 50 : headerbar + 72 : navbar
				if($M.screenInfo.device === 'tablet'){
					this.setNavBarMode('bottom', 'left');
				}
				else{
					this.setNavBarMode('bottom', 'even');
				}
			}
			else{
				height = parseInt(window.innerHeight)-30;
				this.setNavBarMode('side', '');
			}
		}
		height+='px';
		$j(this.$.mainpage).css({'height':height});
	},
		
	/* update badge count */
	updateBadge : function(index, count) {
		var paperNavItem = this.querySelector('.papernavitem[data-index="' + index + '"]');
		var tdNavItem = this.querySelector('.tdnavitem[data-index="' + index + '"]');
		
		paperNavItem.count = count;
		tdNavItem.count = count;
	},	
	_onSelectMenu : function(e)
	{
		var selectedItem = this.selectedIndex;
		var selectedElement = $j(this.$.menudiv).find('.selecteditem')[0];
		if(selectedElement){
			selectedElement.classList.remove('selecteditem');
		}
		selectedElement = $j(this.$.bottomnavbar).find('.selecteditem')[0];
		if(selectedElement){
			selectedElement.classList.remove('selecteditem');
		}
		var selectedPaperItem = this.querySelector('#paperitem'+selectedItem);
		var selectedTdItem = this.querySelector('#tditem'+selectedItem);
		
		if (selectedPaperItem) {
			selectedPaperItem.classList.add('selecteditem');
		}
		if (selectedTdItem) {
			selectedTdItem.classList.add('selecteditem');
		}
		this.$.cards.selected = selectedItem;
		
		this.fire('navbar-page-change');
	},
	/**
	 * set nav bar mode
	 * @Param orientation 
	 * @bottombar bottom
	 */
	setNavBarMode : function(orientation, bottombar){
		if(this.landscapeOnly || (orientation === 'side' && bottombar === '')){ // for desktop mode -> fix side navbar
			$j(this.$.menudiv).attr({'hidden':false});
 			$j(this.$.bottomnavbar).attr({'hidden':true});
 			$j(this.$.menudiv).height($M.workScape.getHeight());
 			$j(this.$.cards).height($M.workScape.getHeight());
 			$j(this.$.cards).children().height($M.workScape.getHeight());
		}
		else {
			if(orientation === 'bottom' && bottombar ==='left'){ // for tablet portrait mode
				this.screenMode = 'tablet';
				this.$.bottomtable.style.width='';
				$j('.bottomTd').css('width','90px');
				$j(this.$.menudiv).attr({'hidden':true});
	 			$j(this.$.bottomnavbar).attr({'hidden':false});
			}
			else if(orientation ==='bottom' && bottombar==='even'){ // for smartphones' portrait mode
				this.$.bottomtable.style.width='100%';
				$j('.bottomTd').css('width', 'calc(100%/'+this.items.length+')');
				$j(this.$.menudiv).attr({'hidden':true});
	 			$j(this.$.bottomnavbar).attr({'hidden':false});
			}
 			var height = $M.workScape.getHeight() - $j(this.$.bottomnavbar).height();
 			$j(this.$.cards).height(height);
 			$j(this.$.cards).children().height(height);
		}
	},
  	
  	_getRouteHref: function(subRoute){
  		if(this.subRoute && subRoute && subRoute.length>0){
  			return '#/'+$M.currentWorkscape+'/'+subRoute;
  		}
  		return '';
  	},

  	_setHash: function(hash){
  		window.location.hash = hash; 
  	},
  	
  	_subRouteChanged: function(route){
  		if(route !== undefined && route !== this.lastRoute){
  			var index = this._itemMap[route];
  			if(index === undefined){
  				return;
  			}
  			this.selectedIndex = index;
  			this._onSelectMenu();
  			this._onWindowResize();
  			this.lastRoute = route;
  		}
  	}

});