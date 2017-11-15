/*
* @license
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-srworkcenter',
	properties: {
		show: {
			type: Object,
			value: true,
			notify: true
		},
	  	pages :{
	  		type:Array,
	  		value: function(){return [];}
	  	},
		currentPage : {
			type:Number,
			value: 0
		},
		currentTab: {
			type: Object,
			notify: true
		}
	},
  	behaviors: [BaseComponent, Polymer.IronResizableBehavior, NotificationForwarder, WorkCenterBehavior],
  	notifications : {
  		map: {},
  		stack: []
  	},
    observers: [
        '_subRouteChanged(subrouteData.route)'
    ],
  	listeners: {
        'show-navbar' : '_showNavBar',
        'hide-navbar' : '_hideNavBar',
        'refresh-pages': 'onNewNotification',
        'select-page' : '_selectPage',
        'show-wait-spinner' : '_showWaitSpinner',
        'on-new-notf' : '_onNewNotification',
        'highlight-card':'highlightcard'
  	},

	ready: function(){
		this.loadPersonInfo();
		$j(document.body).css({'display': 'inline-block'});
		var items = this.$.cards.children;
		var that = this;
		
		var newPages = [];
		
		for(var i=0; i<items.length; i++){
			var newPage = {
					label: '',
					icon: '',
					count : 0
			};
			
			if(items[i].attributes['sub-route']){
				newPage.subRoute = items[i].attributes['sub-route'].value;
			}
			
			if (items[i].attributes.label) {
				newPage.label = $M.localize('uitext','mxapisr', items[i].attributes.label.value);
			}
			if (items[i].attributes.icon) {
				newPage.icon = items[i].attributes.icon.value;
			}
			if (items[i].attributes.count) {
				newPage.count = items[i].attributes.count.value;
			}
			newPages.push(newPage);	
			this.pages.push(newPage);
			items[i].pageIndex = i;
			items[i].addEventListener('updatecount', function(e) {
				that.$.navbar.updateBadge(e.detail.index, e.detail.count);
			});			
		}
		this.pages = newPages;
		
		this.async(function(){
			$j('body').css({'overflow':'hidden'});
			$M.workScape._onWindowResize();
		}, 100);
		 $j(window).on('resize', function(){
	         window.clearTimeout(this.resizeTimer);
	         this.resizeTimer = window.setTimeout(function(){
	        	 that._onWindowResize();
	         }, 350);
	     });

		// listen to new notifications
	    this.$.usernotification.addOnNewNotification(this.onNewNotification, this);
	},
	attached: function() {
		if(this.show){
			$j(document.body).css({'background-color': $j(this.$.content).css('background-color')});
		}
		else {
			$j(this.$.content).css({'background-color':'transparent','padding':'0px'});
		}
	},
    getHeight: function(){
		return window.innerHeight - $j(this.$.headerbar).height();
	},
	_onWindowResize : function(){
		var height;
		var orientation = $M.getOrientation();
		if($M.screenInfo.device === 'desktop'){ // for desktop mode -> fix side navbar
			height = parseInt(window.innerHeight)-50;  // 50 : header bar size
			this.$.navbar.setNavBarMode('side', '');
		}
		else if($M.screenInfo.device === 'tablet' ||$M.screenInfo.device === 'phone'){ // for tablet mode
			if(orientation === 'portrait'){
				height = parseInt(window.innerHeight)-122;	// 50 : headerbar + 72 : navbar
				if($M.screenInfo.device === 'tablet'){
					this.$.navbar.setNavBarMode('bottom', 'left');
				}
				else{
					this.$.navbar.setNavBarMode('bottom', 'even');
				}
			}
			else{
				height = parseInt(window.innerHeight)-30;
				this.$.navbar.setNavBarMode('side', '');
			}
		}
		/*else{ // for smartphones
			if(orientation === 'portrait'){
				height = parseInt(window.innerHeight)-100;
			}
			else{
				height = parseInt(window.innerHeight)-30;
			}
		}*/
		height+='px';
		$j(this.$.mainpage).css({'height':height});
		//this.$.cards.children[this.currentPage].fire('resizelist');
	},
	_onSelectMenu : function (e) {
		this.currentPage = e.detail;
		this.$.cards.select(e.detail);
		this.currentTab = this.$.cards.selectedItem;
		if (this.currentTab.pageSelected) {
			this.currentTab.pageSelected();
		}
	},
	// whenever a maximo-remote-notification receives a new notification
	onNewNotification: function(e) {
		var cards = this.$.cards.items;
		var type;
		if (e && e.detail) {
			type = e.detail;
		}
		for (var i = cards.length - 1; i >= 0; i--) {
			if (cards[i].refreshContainerRecords) {
				// refresh records to sync with notification
				cards[i].refreshContainerRecords(type);
			}
		}
	},
	highlightcard : function(e){
		var cards = this.$.cards.items;
		for (var i = cards.length - 1; i >= 0; i--) {
			if (cards[i].highlightCard) {
				// highlight card
				cards[i].highlightCard(e.detail);
			}
		}
	},
    _showNavBar: function() {
    	this.$.navbar.hidden = false;
    },
    _hideNavBar: function() {
    	this.$.navbar.hidden = true;
    },
    _selectPage: function(e) {
    	var index = e.detail;
    	if (index < 0 || index >= this.$.cards.length) {
    		return;
    	}
    	
    	this.$.navbar.selectedIndex = index;
    	this.$.cards.select(index);
    },
    _showWaitSpinner: function(e) {
    	if (e && e.detail) {
    		$M.toggleWait(true);
    	}
    	else {
    		$M.toggleWait(false);
    	}
    },
	_subRouteChanged(subRoute) {
		if(subRoute !== undefined && subRoute !== this.lastSub){
			var index = 0;
			switch(subRoute.toLowerCase()){
				case 'new':
					index = 1;
					break;
				case 'history':
					index = 2;
					break;
				case 'active':
					index = 0;
					break;
				default:
					index = 0;
					break;
			}
			this.fire('select-page', index);
			this.lastSub = subRoute;
		}
	}
});