/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
The `maximo-context` element provides access to context data associated with the current user,
current application and lot of utility methods. The maximo-context component is instantiated 
and stored in a global variable called `$M` that is accessible to all code and any component. 

*/
String.prototype.bool = function() {
    return (/^true$/i).test(this.toLowerCase());
};

/*
The `maximo-context` element provides access to context data associated with the current user,
current application and lot of utility methods. The maximo-context component is instantiated 
and stored in a global variable called `$M` that is accessible to all code and any component. 

*/

Polymer({
	is: 'maximo-context',
	dir: '',
	workScape: null,
	orientation : 'portrait',
	carouselMax : 6,
	scroll: true,
	bodyScroll: 0,
	behaviors: [Formatter],
	messageBundles: {},
	unloadedBundles : {},
	currentWorkscape: '',
	newWorkscape: '',
	allowedWorkscapes: null,
	history: {
		map: {},
		stack: []
	},
	keyCode: {
		'DELETE'	: 46,
		'DOWN'		: 40,
		'ENTER'		: 13,
		'ESCAPE'	: 27,
		'LEFT'		: 37,
		'RIGHT'		: 39,
		'SPACEBAR' 	: 32,
		'UP'		: 38
	},
	properties: {
		requiredResources: {
			type: Array,
			value: function() {
				return null;
			},
			observer: '_loadResources'
		},
		debug: {
			type: Boolean,
			value: false
		},
		demo: {
			type: Boolean,
			value: false
		},
 	  	notifications : {
	  		type: Object,
	  		value: function(){
	  			return {'map':{},'stack':[]};
	  		}
	  	},
	  	userInfo: {
	  		type: Object,
	  		value: function(){
	  			return {};
	  		}
	  	},
	  	_changedToWC: {
	  		type: String,
	  		value: ''
	  	}
	},
    observers: [
		'_workCenterChanged(routeData.workcenter)',
		'_subRouteChanged(subroute)'
	],
	hasPopupHash: function(){
		var hashArray = window.location.hash.split('/');
		var lastHashPart = parseInt(hashArray.pop());
		return !isNaN(lastHashPart);
	},
	getMaxauth: function(){
		return JSON.parse(sessionStorage.getItem('maxauth'));
	},
	setMaxauth: function(maxauth){
		sessionStorage.setItem('maxauth', JSON.stringify(maxauth));
		this.maxauth = maxauth;
	},
	addToMaxauth: function(key, object){
		if(key && object){
			var maxauth = this.getMaxauth();
			maxauth[key] = object;
			this.setMaxauth(maxauth);
		}
	},
	lastLogout: function(){
		return this.userInfo.user.logouttracking.attemptdate;
	},
	pushState: function(undoAction){
		this.history.stack.push(undoAction);
		undoAction.index = this.history.stack.length;
		this.history.map[undoAction.id] = undoAction;
		this.currentHash = undoAction.index;
		var hash = '';
		var hashArray = [];
		if(undoAction.index === 1 && !this.hasPopupHash()){
			this.setPopHash(0, true);
		}
		this.async(function(){
			if(!this.hashCheck){
				this.hashHandler = function(){
					var hashArray = window.location.hash.split('/');
					var lastHashPart = parseInt(hashArray.pop().replace(/#/,''));
					var newHash = lastHashPart; 
					if(!isNaN(lastHashPart)){
						if($M.lastHash>newHash){//back
							$M.popState();
							$M.currentHash--;
						}
						$M.lastHash = newHash;
					}
					$M.useHash = true;
				};
				this.hashCheck = window.addEventListener('hashchange', this.hashHandler, false);
			}
			this.setPopHash(undoAction.index);

		}, 100);
	},
	popState: function(){
		var undoAction = this.history.stack.pop();
		if(undoAction){
			delete this.history.map[undoAction.id];
			if(undoAction.element.closeMe){
				undoAction.element.closeMe(this);
			}
			else if(undoAction.element.popMe){
				undoAction.element.popMe();
			}
		}
		if(this.history.stack.length === 0){
			window.removeEventListener('hashchange',this.hashHandler);
			this.setPopHash(-1);
			this.hashCheck = null;
		}
	},
	setPopHash: function(index, force){
		var hash = '';
		var hashArray = window.location.hash.split('/');
		var lastHashPart = hashArray[hashArray.length-1];
		var lastHash = parseInt(lastHashPart.replace(/#/g,'')); 
		if(!isNaN(lastHash)){
			hashArray.pop();//remove previous numeric if there was one.
		}
		hashArray.forEach(function(hashPart){
			if(hashPart !== ''){
				hash += hashPart + '/';
			}
		});
		window.location.hash = hash + (force || index>=0?index:'');
	},
	_wasRefreshed: function(){
		if (window.performance) {
			return performance.navigation.type === 1;
		}
		return false;
	},
	_workCenterChanged: function(workCenter) {
		if(!this._wasRefreshed() && $M.getMaxauth() && $M.getMaxauth().whoami && (this.routeWorkCenter === undefined || workCenter !== this.routeWorkCenter)){
			if(workCenter && workCenter !== '' && workCenter !== this.currentWorkscape){
				this.routeWorkCenter = workCenter;
				$M.toggleWait(true);
				if($M.hasAccessToWorkscape(workCenter)){
					$M.loadWorkscape(workCenter);
				}
				else {
					$M.set('route.path', '/'+this.currentWorkscape);
					if(this.currentWorkscape !== ''){
						this.async(function(){
							$M.alert($M.localize('uitext','mxapibase','no_access'+this.currentWorkscape));	
						});
					}
				}
			}
		}
	},
	_subRouteChanged: function(subroute){
		if(subroute !== undefined && subroute !== this.subRoute && this.workScape){
			if(subroute !== this.workScape.get('subroute')){
				this.applySubRoute(subroute);
			}
			this.subRoute = subroute;
		}
	},
	getSubRoute: function(){
		var path = this.subroute.path;
		if(!path){
			path = '';
		}
		if(path.startsWith('/')){
			path = path.substring(1);
		}
		return path;
	},
	setSubRoute: function(path){
		if(path.startsWith('/')){
			path = path.substring(1);
		}
		window.location.hash = '#/'+$M.currentWorkscape+'/'+path;
	},
	applySubRoute: function(subroute){
		if(this.workScape && subroute !== this.workScape.get('subroute')){
			if(subroute !== this.workScape.get('subroute')){
				this.workScape.set('subroute', subroute);
			}
			if(this.workScape.domHost && subroute !== this.workScape.domHost.get('subroute')){
				this.workScape.domHost.set('subroute', subroute);	
			}
			//support subroute on all maximo-navbars
			$j('maximo-navbar').each(function(){
				if(this.subRoute === true){
					this.set('subroute', subroute);
				}
			});
		}
	},
	alerts : {
		info : 0,
		warn : 1,
		error : 2,
		question: 3
	},
	notificationPos : {
		x : 'center',
		y: 'top'
	},
	lang: 'en',
	country: 'US',
	screenInfo : {},
	notificationtimeout : 3,
	underlays : [],
	components: {},
	elementCounts: {},
	collections: {
		//each collection will register itself to send / listen for refresh events
	},
	listeners : {}, // will have map of events/objects that listen to that event
	overlayDialogs: [],
	dialogs: {
		map: {},
		stack: []
	},
	colorPalleteRGB : ['#5596E6','#7CC7FF','#5AA700','#B4E052','#00B4A0','#6EEDD8','#A6266E','#FF9EEE','#FF5003','#FFA573','#6D7777','#C7C7C7','#FDD600'],
	fixUnderlays: function(){
		var underlayLength = this.underlays.length;
		this.underlays.forEach(function(underlay, index){
			$j(underlay).css({'opacity':index+1 === underlayLength?'.2':'0'});
			$j(underlay.nextElementSibling).toggleClass('song2', false);
		});

	},
	registerCollection: function(id, events){
		var existing = $M.collections[id];
		if(!existing){
			$M.collections[id] = {events:[]};
		}
		events.forEach(function(event){
			$M.addCollectionListener(id, event);
		});
	},
	addCollectionListener : function(id, event){ // id is id of collection
		if(!$M.collections[id]){
			$M.registerCollection(id, [event]);
			return;
		}
		if(!this.arrayContains($M.collections[id].events, event)){
			$M.collections[id].events.push(event);
		}
	},
	removeCollectionListener : function(id, event){ // id is id of collection
		if($M.collections[id]){
			this.arrayRemove($M.collections[id].events, event);
		}
	},
	notifyCollections: function(id){
		var collection = $M.collections[id];
		var self = this;
		if(collection){
			var notified = [];
			var events = collection.events;
			events.forEach(function(event){
				Object.keys($M.collections).forEach(function(key){
					if(key !== id && !self.arrayContains(notified, key)){//don't refresh original collection or one that we have previously refreshed by this process
						var refresh = $M.collections[key];
						if(self.arrayContains(refresh.events, event)){
							var refreshCollection = window[key];
							notified.push(key);
							if(refreshCollection && refreshCollection.length){ //in case of duplicate IDs - TODO - this should come out after ID restrictions are resolved
								[].forEach.call(refreshCollection, function(child) {
									$j.proxy(child.refreshRecords(null,true), child);
								});
							}
							else {
								$j.proxy(refreshCollection.refreshRecords(null,true), refreshCollection);
							}
						}
					}
				});
			});
		}
	},
	addComponent: function(component){
		var nodeName = component.nodeName.toLowerCase();
		component.initialized=true;
		if(this.components[component.id] && component._templateInstance){
			component.id = component._templateInstance._rootDataHost.id + component.idSep +component.id;
			component.modifiedId = true;
		}
		var parentComponent = null;
		if(component.parentNode){
			if((component.parentNode !== component.parentElement && component.parentNode.host)){
				parentComponent = component.parentNode.host;
			}
			else if(this.elementCounts[component.parentNode.nodeName.toLowerCase()]){
				parentComponent = component.parentNode;
			}
		}
		try {
			if(this.debug || this.demo){
				if(!component.id || component.missingId){
					throw 'No id defined for ';
				}
			}
		}
		catch (error){
			var info = ' ';
			Object.keys(component.attributes).forEach(function(key){
				var attribute = component.attributes[key];
				if(attribute.name !== 'class'){
					info+= attribute.name+'="'+attribute.value+'" ';
				}
			});
			var errorString = '';
			switch(error){
				case 'missing':
					errorString = 'No id defined for ';
					break;
				case 'duplicate':
					break;
			}
			console.error(error +'<'+ nodeName + info +'>. ');// + host);
		}
		finally {
			this.components[component.id] = component;
			var nodeCount = parseInt(this.elementCounts[nodeName]);
			if(isNaN(nodeCount)){
				nodeCount = 0;
				this.elementCounts[nodeName] = ++nodeCount;
			}
		}
	},
	pre : function(){
		this._setLocale(navigator.language || navigator.browserLanguage);
		this.pageName = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
		if(window.$j){
			console.error('jQuery already initialized');
		}
		window.$j = jQuery.noConflict();
		if(window.$M){
			console.error('maximo-context is a singleton and has already been initialized.');
		}
		else {
			window.$M = this;
		}
		var context = this;
		this.async(function(){
			context.getOrientation();
		}, 100);

		$j(window).scroll(function(event) {
			if(context.scroll===false){
				$j(window).scrollTop(context.bodyScroll);
			}
		});
		
		$j('body').on('useractivity', function(){
			this.login._startInactivityTimer();
		});
	},
	created: function(){
		$.ajaxSetup({xhrFields: { withCredentials: true } });
		this.pre();
		if(!sessionStorage.getItem('resources')){
			sessionStorage.setItem('resources', JSON.stringify({'strings':{}}));
		}
		this.tooltip = $j('#ws_tooltip')[0];
		this.maximoProperties = JSON.parse(sessionStorage.getItem('maximoProperties'));
		this.touch = this.maximoProperties.touch;
		this.mock = this.maximoProperties.mock;
		this.debug = this.maximoProperties.debug;
		this.logLevel = this.maximoProperties.logLevel;
		this.markPolymerListeners = this.maximoProperties.markPolymerListeners;
		this.skin = this.maximoProperties.skin;
		if(this.dir===''){
			this.dir = this.maximoProperties.dir?this.maximoProperties.dir:'ltr';
		}
		this.carousel = this.maximoProperties.carousel;
		document.dir = this.dir;
		if(this.dir === 'rtl'){
			this.skin+=' rtl';
		}
		try{
			this.touch = ('ontouchstart' in window || navigator.msMaxTouchPoints);
			this.click = true;
			if(this.touch){ // todo - seems to now be broken in chrome desktop
				if(!document.documentElement.click){
					this.skin+=' touch';
				}
			}
			/* Make scrollbars visible on webkit
			 * Body will not show a scrollbar on mobile
			 * internal scrollable areas will
			 */ {
				var touchStyle = document.createElement('style');
				var cssLocation = 'css/touch.css';
				var pathDiff = location.pathname.length - location.pathname.replace(/\//g, '').length;
				if(pathDiff > 2){
					if($M.debug){
						console.info('Not loading from the webcontent root. Modifying touch css path.');
					}
					do{
						cssLocation = '../'+cssLocation;
						pathDiff--;
					}
					while(pathDiff > 2);
				}
			    $j.get(cssLocation, function(css){
			    	$M.scrollSize = $M.touch?'4':'8';
		    		css = css.replace(new RegExp('{scroll-size}', 'g'), $M.scrollSize);
		    		css = css.replace(new RegExp('{thumb-color}', 'g'), $M.touch?'rgba(0, 0, 0, .3)':'rgba(0, 0, 0, .08)');
		    		css = css.replace(new RegExp('{track-color}', 'g'), $M.touch?'rgba(0, 0, 0, .08)':'transparent');
		    		touchStyle.appendChild(document.createTextNode(css));
		    		document.head.appendChild(touchStyle);
			    });
			}

		}
		catch(e){
			//not touch!
		}
	},
	getDefaultBaseApplicationId: function(logical){
		return this.getDefaultApplicationId(logical, true);	
	},
	getDefaultApplicationId: function(logical, baseOnly){
		var defaultApp = '';
		var maxauth = this.getMaxauth();
		if(maxauth){
			var whoami = maxauth.whoami;
			if(whoami){
				if(whoami.defaultApplication && whoami.defaultApplication.length > 0){
					defaultApp = whoami.defaultApplication;
				}
				else if(logical){
					var length = Object.keys(whoami.workcenters).length;
					if(length > 3){
						defaultApp = 'welcome';
					}
					if(length === 3){
						Object.keys(whoami.workcenters).forEach(function(appId){
							if(appId !== 'test' && appId !== 'welcome'){
								defaultApp = appId;
							}
						});
					}
				}
			}
			if(baseOnly && !whoami.applications[defaultApp]){
				return 'startcntr';
			}
		}
		return defaultApp;
	},
	
	/**
	 * Get localized version of true/false
	 */
	getLocalizedBoolean : function(bool){
		var maxauth = this.getMaxauth();
		var whoami = maxauth.whoami;
		return (bool===true) ? whoami.displayyes : whoami.displayno;
	},
	
	getApplication: function(id){
		var maxauth = this.getMaxauth();
		if(maxauth){
			var whoami = maxauth.whoami;
			if(whoami){
				if(whoami.workcenters[id.toLowerCase()]){
					return whoami.workcenters[id.toLowerCase()];
				}
				if(whoami.applications[id]){
					return whoami.applications[id];
				}
			}
		}
		return null;
	},
	attached: function(){
		this.$.alert.className = this.$.alert.className +' '+this.dir;
	},
	showOverlay: function(owner){ //if over is passed in we place overlay over it in z-index, otherwise we place it at z-index 50. Dialogs start at 100.
		var layer = document.createElement('div');
		layer.className = 'maxWait';
		$j('body').append(layer);
		var zIndex = $j(owner).css('z-index');
		if(!zIndex){
			zIndex = 50;
		}
		layer.id = owner.id+'_underlay';
		$j(layer).css({'z-index':(zIndex-1)});
	},
	showTooltip : function(message, options){
		this.tooltip.show(message, options);
	},
	
	/**
	 * Shows an alert message dialog.
	 * 
	 * @param {String} message A message to be shown in the alert dialog.
	 * @param {Integer} type An alert type possible values are $M.alerts.info or $M.alerts.warn or $M.alerts.error or $M.alerts.question
	 * @return {Object} The alert dialog.
	 */
	alert: function(message, type){
		var typeTitle = $M.localize('uitext', 'mxapibase', 'SystemMessage');
		var content = this.$.alert.cloneNode(true);
		type = this.setupMessage(1, message, type, content);
		var count = 0;
		var id = '';
		do{
			id = 'Sys_'+type+count;
			count++;
		}
		while ($j('#'+id).length>0);
		var dialog = $M.showDialog(null, id, typeTitle, content, false);
		var footer = dialog.$.footer;
		if(footer && footer.firstElementChild){
			$j(footer.firstElementChild).empty();
			var ok = Polymer.Base.create('maximo-button',{'default':'true','id':dialog.id+'alert_footer_ok','label':this.localize('uitext', 'mxapibase', 'Ok')});
			ok.onTap = function(){
				dialog.close();
			};
			ok.listen(ok, 'tap', 'onTap');
			//ok.bindEvent(ok, 'tap', );
			$j(dialog.$.footerRow).css({'display':''});
			$j(dialog.$.footerRow).show();
			$j(dialog.$.dialog).css({'max-width':'500px'});
			$j(footer).css({'text-align':'center'});
			Polymer.dom(footer.firstElementChild).appendChild(ok);
		}
		window.setTimeout(function(){
			$j('#'+id+'_dialog').attr('role','alertdialog');
		},200);
		return dialog;
	},
	
	/**
	 * Shows a confirmation dialog.
	 * 
	 * @param {String} message A message to be shown in the confirmation dialog.
	 * @param {Object} callback A function to be called when the confirmation dialog is closed based on user selected option
	 * @param {Object} caller An object representing the caller on which the callback function need to be called.
	 * @param {Integer|String} defaultButton 0/yes,1/no,2/cancel can be passed to indicate which button should be set as the default button
	 * @param {Array} buttons An array of 0/yes,1/no,2/cancel values representing the buttons to be shown in the confirmation dialog.
	 * @param {Object} additional An additional information to be passed to the callback function
	 * @param {Integer} type An alert type possible values are $M.alerts.info or $M.alerts.warn or $M.alerts.error or $M.alerts.question
	 * @return {Object} A confimation dialog.
	 */
	confirm: function(message, callback, caller, defaultButton, buttons, additional, type){ //defaultButton is an integer 0:yes, 1:no, 2:cancel
		var dialog = this.alert(message, type?type:$M.alerts.question);
		this.systemDialog = dialog;
		var footer = dialog.$.footer;
		if(footer && footer.firstElementChild){
			switch(defaultButton){
				case 0:
				case 'yes':
					defaultButton = 'yes';
					break;
				case 1:
				case 'no':
					defaultButton = 'no';
					break;
				case 2:
				case 'cancel':
					defaultButton = 'cancel';
					break;
				default:
					defaultButton = 'none';
					break;
			}
			if(callback){
				$j(footer.firstElementChild).empty();
				$j(footer).css({'text-align':$M.dir !== 'rtl'?'right':'left'});
				var yes = Polymer.Base.create('maximo-button',{'default':(defaultButton==='yes'),'id':dialog.id+'_confirm_footer_yes','label':this.localize('uitext', 'mxapibase', 'Yes')});
				yes.onTap = function(){
					dialog.close();
					this.async(function(){
						callback.apply(caller, [true,additional]);	
					}, 100);
				};
				yes.listen(yes, 'tap', 'onTap');
				if(defaultButton==='yes'){
					dialog.focusElement = yes.$.button;
				}
				Polymer.dom(footer.firstElementChild).appendChild(yes);
				var no = Polymer.Base.create('maximo-button',{'default':(defaultButton==='no'),'id':dialog.id+'_confirm_footer_no','label':this.localize('uitext', 'mxapibase', 'No')});
				no.onTap = function(){
					dialog.close();
					this.async(function(){
						callback.apply(caller, [false, additional]);
					}, 100);
				};
				no.listen(no, 'tap', 'onTap');
				if(defaultButton==='no'){
					dialog.focusElement = no.$.button;
				}
				Polymer.dom(footer.firstElementChild).appendChild(no);
				var cancel = Polymer.Base.create('maximo-button',{'default':(defaultButton==='cancel'),'id':dialog.id+'_confirm_footer_cancel','label':this.localize('uitext', 'mxapibase', 'Cancel')});
				cancel.onTap = function(){ dialog.cancel() };
				cancel.listen(cancel, 'tap', 'onTap');
				Polymer.dom(footer.firstElementChild).appendChild(cancel);
				if(defaultButton==='cancel'){
					dialog.focusElement = cancel.$.button;
				}
				$j(footer.firstElementChild).find('button').each(function(){
					this.id = this.parentNode.id + '_' + this.id;
				});
				if(buttons){
					$j(yes.firstElementChild).attr({'display':buttons.includes('yes')||buttons.includes(0)?'initial':'none'});
					$j(no.firstElementChild).css({'display':buttons.includes('no')||buttons.includes(1)?'initial':'none'});
					$j(cancel.firstElementChild).css({'display':buttons.includes('cancel')||buttons.includes(2)?'initial':'none'});
				}
			}
		}
		return dialog;
	},
	
	/**
	 * Creates a component based on the content name that is passed and shows that in a dialog.
	 * In a mobile phone view, the dialog takes up the entire screen.
	 * 
	 * @param {Object} parent A parent object
	 * @param {Object|String} contextOrId An object that has id as an attribute or a string representing id for the dialog
	 * @param {String} title A title to be used for the dialog
	 * @param {Object|String} content A component to be used to fill inside the dialog or a string representing the maximo component 
	 *      name that will be created and shown inside the dialog
	 * @param {Boolean} fillSize A flag to indicate whether the dialog should take up the entire space or not.
	 * @param {Object} owner A owner object    
	 * @param {Object} contentprops An object that contains key value pairs that are used to set as the properties of the component 
	 *      that is created based on the content name passed.
     * @return {Object} Returns the dialog object.
	 */
	showDialog : function(parent, contextOrId, title, content, fullSize, owner, contentprops){
		this.toggleWait(true);
		var my = this;
		var id,context;
		if(typeof contextOrId === 'object'){
			id = contextOrId.id+'_dialog';
			context = contextOrId;
		}
		else {
			id = contextOrId;
		}
		if(my.dialogs.map[id]){
			console.warn('Already showing dialog with the id: '+id +'!');
			my.flashElement($j('#'+id));
			return;
		}
		my.toggleBlur(true);
		my.toggleScroll(false);
		var props = {'id': id,'title':title, 'fullSize': fullSize, 'owner' : owner};
		if(context){
			if(context._rowstamp){
				props.record = context;
			}
			else {
				props.recordData = context;
			}
		}
		if(typeof content === 'object'){
			props.contentObject = content;
		}
		else if(content.indexOf('maximo-') === 0){
			props.contentObject = Polymer.Base.create(content);
				//document.createElement(content);
			props.contentObject.id = id+'_content';
			props.contentObject.recordData = props.recordData;
			props.contentObject.recordIndex = props.recordIndex;
			props.contentObject.record = props.record;
			props.contentObject.parent = parent;
			props.contentObject.dynamic = true;
	        //Iterate thru all content props and assign them to the content if necessary.
	        if(contentprops){
	          var keys = Object.keys(contentprops);
	          var i = 0;
	          while (i < keys.length){
	            props.contentObject[keys[i]] = contentprops[keys[i]];
	            i += 1;
	          }
	        }
			if(!props.title){
				props.title = props.contentObject.label;
			}
		}
		else if(typeof document.getElementById(content)){
			props.contentObject = document.getElementById(content);
			if($j(props.contentObject).attr('hidden')){
				$j(props.contentObject).css({'display':'inherit'});
				$j(props.contentObject).attr({'hidden':false});
				$j(props.contentObject).attr({'data-hideme':'true'});
			}
		}
		else { //must be string content
			props.content = content;
		}
		if(props.contentObject){
			props.contentObject.parent = parent;
		}
		var dialog = Polymer.Base.create('maximo-dialog', props);
		//$j('body').append(dialog);
		if (!parent || (contentprops && contentprops.placeInBody)) {
			if(this.workScape && this.workScape.$.content) {
				$j(this.workScape.$.content).append(dialog);
			}
			else {
				$j('body').append(dialog);
			}
		}
		else {
			$j(parent).append(dialog);
		}
		
		if (contentprops && contentprops.createdevent) {
			parent.fire(contentprops.createdevent, dialog);
		}
		return dialog;
	},
	returnToLogin: function(messageKey){
		var message = localStorage.getItem('loginMessage');
    	sessionStorage.clear();
    	if(message && !messageKey){
    		messageKey = message;
    	}
    	var logoutLocation = 'index.html';
    	if(this.appserversecurity){
    		logoutLocation = 'logout.html';
        	if(typeof messageKey !== 'undefined'){
        		logoutLocation += '?messageKey='+messageKey;
        	}	
    	}
    	else {
    		localStorage.setItem('loginMessage',messageKey);
    	}
    	this.appserversecurity = null;
    	document.location = logoutLocation;
    },
    
	/**
	 * Shows a notification message.
	 * 
	 * @param {String} message A message to be shown in the alert dialog.
	 * @param {Integer} type An alert type possible values are $M.alerts.info or $M.alerts.warn or $M.alerts.error or $M.alerts.question
	 */
    notify : function(message, type){
    	if(!type){
    		type = $M.alerts.info;
    	}
    	if(type===$M.alerts.error){
			$M.alert(message, type);
			console.log($M.localize('messages', 'mxapibase', 'ToastwasconvertedtoanalertErrorscannotbed'));
			return;
    	}
		if(message.length>50){
			$M.alert(message, type);
			console.log($M.localize('messages', 'mxapibase', 'ToastwasconvertedtoanalertToastmessagessh'));
			return;
		}
		if(message.length>50){
			message = message.substring(0,30)+'...';
			console.log($M.localize('messages', 'mxapibase', 'ToastwastruncatedToastmessagesshouldbesho'));
		}
		var count = 0;
		var id = '';
		do{
			id = 'Notify_'+count;
			count++;
		}
		while ($j('#'+id).length>0);
		var notification = Polymer.Base.create('maximo-notification', {'id':id});
		var content = notification.$.notification;
		$j(content).attr({'id':id});
		type = this.setupMessage(0, message, type, content);
		this.notifications.map[id] = $j(content);
		this.notifications.stack.push(id);
		var offset ;
		var headerHeight = this.workScape && this.workScape.$.headerbar ? $j(this.workScape.$.headerbar).height() : 0;
		var footerHeight = this.workScape && this.workScape.$.footer ? $j(this.workScape.$.footer).height() : 0;
		if($M.overlayDialogs.length === 0){
			offset = $M.notificationPos.y==='top' ? headerHeight : footerHeight;
		}
		else {
			var dialog = $M.overlayDialogs[$M.overlayDialogs.length-1];
			offset = $M.notificationPos.y==='top'?$j(dialog.$.header).height() - ($j(dialog.$.divider).height()/2) + $j('body').scrollTop():footerHeight;
		}
		var yPos = ((this.notifications.stack.length - 1) * 38) + offset;
		var props = {};
		props[$M.notificationPos.y] = yPos;
		if($M.notificationPos.x==='center'){
			props.position = 'fixed';
			$j(content).hide();
			$j('body').append(notification);
			$j(notification).remove();
			$j(content).show();
		}
		else {
			props[$M.notificationPos.x] = '0px';
		}
		props.transform = 'scale(0)';
		$j(content).css(props);
		$j(content).attr({'hidden':false});
		$j(content).toggleClass('notification'+type, true);
		$j(content).css({'transition':'all .3s'});
		var my = this;
		$j('body').append(notification);		
		this.async(function(){
			$j(content).css({'transform':'scale(1)'});
			if($M.notificationtimeout !== 0){
				this.async(function(){
					my.removeNotification(content);
				}, $M.notificationtimeout*1000);
			}
		}, 10);
		if(navigator.vibrate){
			navigator.vibrate(500);
		}
    },
    removeNotification : function(notificationToRemove) {
		if(!notificationToRemove){
			return;
		}
		
		var my = this;
		$j(notificationToRemove).css({'transform':'scale(0)', 'opacity':'0'});
		var notificationIndex = my.notifications.stack.indexOf(notificationToRemove.id);
		my.notifications.stack.forEach(function(notificationId, index){
			var notification = my.notifications.map[notificationId];
			if(index>notificationIndex){
				var yPos = $M.notificationPos.y;
				notification.css(yPos, parseInt(notification.css(yPos)) - 38+'px');
				delete my.notifications.map[notificationToRemove.id];
			}
		});
		$M.arrayRemove(my.notifications.stack, notificationToRemove.id);
		delete my.notifications.map[notificationToRemove.id];
		this.async(function(){
			$j(notificationToRemove).remove();
		}, 300);

    },
    
    
	setupMessage : function(type, message, level, element){
		//type: 1 - alert, 0 - toast
		var icon, className;
		switch(level){
			case $M.alerts.info:
				
				if(type===1){
					className = 'svgAlertBlue';
					icon = 'info';
				}
				else {
					className = 'svgAlertGreen';
					icon = 'maximo-based:complete';
				}
				level= 'info';
				break;
			case $M.alerts.warn:
				className = 'svgAlertOrange';
				icon = 'maximo-based:warn';
				level= 'warn';
				break;
			case $M.alerts.error:
				className = 'svgAlertRed';
				icon = 'error';
				level= 'error';
				break;
			case $M.alerts.question:
				className = 'svgAlertYellow';
				icon = 'help';
				level= 'question';
				break;
			default:
				className = '';
				icon = '';
				level= '';
				break;
		}
		var internal = $j(element);
		switch(type){
			case 0:
				internal.find('.notificationCell').html(message);
				internal.find('.notificationCell').attr({'title':message});
				internal.find('.messageIcon').toggleClass('notification'+level, true);
				break;
			case 1:
				internal.find('.alertMessageCell').html(message);
				break;	
		}
		
		internal.attr({'hidden':false});
		var iconElement = internal.find('iron-icon.messageIcon');
		if(icon!==''){
			iconElement.attr({'icon':icon});
			iconElement.toggleClass(className, true);
			iconElement.attr('class', iconElement.attr('class')+' maximo-dialog');
		}
		else {
			iconElement.hide();
			internal.find('.alertMessageCell').css({'padding':'0px'});
		}
		return level;
	},
	
	/**
	 * Closes the currently active dialog.
	 */
	closeDialog: function(){
		var dialogCount = this.dialogCount();
		var currentDialog = $j('#'+this.dialogs.stack[dialogCount-1]);
		if(currentDialog && currentDialog[0]){
			currentDialog[0].close();
		}
	},
	
	/**
	 * Toggles the blur state on/off.
	 * @param {Boolean} state Pass true to turn the blur on, otherwise pass false.
	 */
	toggleBlur: function(state){
		if(typeof state !== 'boolean'){
			state = true;
		}
		var target = $j('.maximo-workscape.wrapper');
		if(target.length===0){
			target = $j('.loginpanel');
		}
		var dialogCount = this.dialogCount();
		if(dialogCount>0){
			target = $j('#'+this.dialogs.stack[dialogCount-1]).find('.dialog');
		}
		
		target.toggleClass('song2',state);
		
		return target;
	},
	
	toggleScroll : function(scroll){
		this.scroll = scroll;
		this.bodyScroll = $j('body').scrollTop();
	},
	
	/**
	 * Returns the number of dialogs that are currently open.
     * @return {Integer} Returns the number of dialogs currently open.
   	 */
	dialogCount: function(){
		return this.dialogs.stack.length;
	},
	flashElement: function(element, strength){
		$M.highlightElement(element, strength);
		window.setTimeout(function(){
			$M.highlightElement(element, strength);
		}, 500);
	},
	highlightElement: function(element, strength){
		if(!strength){
			strength = 1.05;
		}
		var transition = element.css('transition');
		element.css({'transition':'all .3s'});
		element.css({'transform':'scale('+strength+')'});
		window.setTimeout(function(){
			element.css({'transform':'scale(1)'});
			if(transition){
				window.setTimeout(function(){
					element.css({'transition':transition});
				}, 500);
			}
		}, 300);
	},
	toggleWait: function(state){
		if(!this.wait){
			return;
		}
		if(typeof state !== 'boolean'){
			state = true;
		}
		var zIndexTarget = this.toggleBlur(state);
		var zIndex = parseInt(zIndexTarget.css('z-index'));
		if(isNaN(zIndex)){
			zIndex = 1;
		}
		zIndex = zIndex+1;
		this.wait.zIndex = zIndex;
		if(state===true && this.login){
			this.login.toggleLoading(false);
		}
		if(this.wait){
			this.wait.toggle(state);
		}
	},
	/**
	 *	Generates a Maximo link that points to a specific record in an application.
	 */
	_getMaximoRecordLink: function(appName,uniqueId,additionalEvent,additionalEventValue){
		var maximoLocation = this.getMaxauth().baseUri+'/ui/?event=loadapp&value='+appName.toLowerCase();
		if(uniqueId){
			maximoLocation +='&uniqueid='+uniqueId;	
		}
		if(additionalEvent){
			maximoLocation +='&additionalevent='+additionalEvent;
		}
		if(additionalEventValue){
			maximoLocation +='&additionaleventvalue='+additionalEventValue;
		}
		maximoLocation+='&forcereload=true';
		return maximoLocation;
	},
	/**
	 * Does current user have access to a base application.
	 */
	hasAccessToBaseApp: function(appName){
		try {
			return this.getMaxauth().whoami.applications[appName.toUpperCase()] !== undefined;
		}
		catch(error){
			return false;
		}
	},
	/**
	 *	Opens Maximo and brings up the selected record.
	 */
	openMaximoRecord: function(appName,uniqueId,additionalEvent,additionalEventValue) {
		if(this.hasAccessToBaseApp(appName)){
			var link = this._getMaximoRecordLink(appName,uniqueId,additionalEvent,additionalEventValue);
			window.open(link,'maximo');
		}
		else {
			this.alert($M.localize('uitext','mxapibase','no_access'));
		}
	},
	checkLicenses: function(licenses){
		// Options are ORed; if any is true the user has access
		var checkLicenses = licenses.split(',');
		for (var j=0; j<checkLicenses.length; j++){
			if (this.licenseGranted(checkLicenses[j]) === true) {
				return true;
			}
		}
		return false;
	},
	licenseGranted: function(license){
		var licenses = this.getLicenses();
		if (licenses === undefined){  //Should not have gotten this far
			console.log('licenses is undefined');
			return false;
		}
		if (licenses['INTERNALONLY']){
			//console.log('license authorized for ' + license + ' due to INTERNALONLY');
			return true;
		}
		if (licenses[license]){
			//console.log('license authorized for ' + license);
			return true;
		
		}
		console.log('license denied for ' + license);
		return false;
	},
	checkSigoptions: function(sigoptions){
		// Options are ORed; if any is true the user has access
		var checkOptions = sigoptions.split(',');
		for (var j=0; j<checkOptions.length; j++){
			if (this.sigoptionGranted(checkOptions[j]) === true) {
				return true;
			}
		}
		return false;
	},
	sigoptionGranted: function(sigoption){
		var options = this.getSigoptions();
		if (options === undefined){  //Should not have gotten this far
			console.log('options is undefined');
			return false;
		}

		// Option may be in the format WORKCENTEROPTION or OSNAME:OSOPTION
		var segments = sigoption.split(':'),
		firstPart = segments[0],
		secondPart = segments[1];

		if(options[firstPart] === undefined || (secondPart && options[firstPart][secondPart] === undefined)){
			//console.log('access denied on ' + sigoption);
			return false;
		}
		
		if((options[firstPart] && !secondPart) || (secondPart && options[firstPart][secondPart])){
			//console.log('access granted on ' + sigoption);
			return true;
		}
		return false;
	},
	
	/**
	 * Returns a localized message based on the information provided.
	 * 
	 * @param {String} type Either uitext or messages depending on wherther the message 
	 *      to be localized is for labels or for messages to be shown to the user.
	 * @param {String} group An Object Structure Name for Labels or a Message Group name for Messages
	 * @param {String} key A label or message key.
	 * @param {Array} params List of parameters that can be substituted in the message.
	 */
	localize: function(type, group, key, params){ // need to change to this once files are updated
		var message = key;
		/* stub for resolving labels */
		var strings = this.resources.strings;
		var bundle = strings[type];
		if(bundle){
			var bundleGroup = bundle[group];
			if(bundleGroup !== undefined){
				var bundleMessage = bundleGroup[key];
				if(bundleMessage !== undefined){
					message = bundleMessage;
				}
			}
		}
		if(params){
			message = this.replaceParams(message, params);
		}
		if (message !== undefined){
			message = message.replace(/\&quot;/g, '\'').replace(/\&nbsp;/g, ' ');
		}
		//Helps in testing UI strings with mocked values.
		//Data from server is not mocked unless a full mocked language is installed.
		switch (this.mock){ 
			case 'ja':
				message = '[(\')一構ソチ‐ '+message+']';
				break;
			case 'de':
				message = '[(\')~~~~~~~~~~ '+message+']';
		}
		return message;
	},
	replaceParams: function(message, params){
		if(message && params){
			params.forEach(function(param,index){
				message = message.replace('{'+index+'}',param);
			});
		}
		return message;
	},
	cloneRecord: function(record){
		return $j.extend(true, {}, record);
	},
	addListener: function(eventName, object){
		var listeners = this.listeners[eventName];
		if (!listeners){
			listeners = this.listeners[eventName]=[];
		}
		listeners.push(object);
	},
	fireEvent: function(eventName, object){
		var listeners = this.listeners[eventName];
		if (listeners){
			listeners.forEach(function(listener){
				try{
					listener[eventName](object);
				}catch(err){
					console.warn('invalid listener ' + eventName + ' - ' + err);
				}
			},this);
		}
	},
	_getErrorResponse: function (error) {
		if (error) {
			if (error.request) {
				if (error.request.xhr) {
					if (error.request.xhr.response) {
						if (error.request.xhr.response.Error) {
							return error.request.xhr.response.Error;
						}
					}
				}
			}
		}
		return null;
	},
	showResponseError: function (error) {
		var e = this._getErrorResponse(error);
		if (e) {
			var type ='';
			var t = e.reasonCode ? e.reasonCode[e.reasonCode.length - 1] : '';
			switch(t) {
				case 'I':
					type = this.alerts.info;
					break;
				case 'W':
					type = this.alerts.warn;
					break;
				case 'E':
					type = this.alerts.error;
					break;
				default:
					type = this.alerts.info;
					break;
			}

			this.alert(e.message, type);
		}
	},
	getPixelsPerInch: function() {
		if(!this.screenInfo.ppi){ //this will not change
			var div = document.createElement('div');
			div.id = 'div_screensize';
			div.innerHTML = '.';
			document.body.appendChild(div);
			$j(div).css({'width':'1in'});
			this.screenInfo.ppi = parseFloat($j(div).width());
			$j(div).remove();
		}
		return this.screenInfo.ppi;
	},
	getOrientation : function() {
		this.getPhysicalSize();
		if (window.screen && window.screen.orientation && window.screen.orientation.type) {
			if (window.screen.orientation.type.indexOf('landscape') !== -1) {
				this.screenInfo.orientation = 'landscape';
			}
			else {
				this.screenInfo.orientation = 'portrait';
			}
		}
		else {
			this.screenInfo.orientation = parseInt(this.deviceSize.width)<parseInt(this.deviceSize.height)?'portrait':'landscape';			
		}
		$j('body').attr({
	    	'data-orientation' : this.screenInfo.orientation
	    });
		
		return this.screenInfo.orientation;
	},
	getPhysicalSize: function(){
		$j(window).on('resize', function(){
			if($M.resizeTimer){
				window.clearTimeout($M.resizeTimer);
			}
			$M.resizeTimer = setTimeout(function(){
				$M.getOrientation();
				if($M.workScape){
					$M.workScape.fire('maximo-screen-resize');
				}
			}, 250);
		});
		var ppi = this.getPixelsPerInch();
		this.screenInfo.ppi = ppi;
		this.screenInfo.width = ($j(window).width() / ppi).toFixed(2);
		this.screenInfo.height = ($j(window).height() / ppi).toFixed(2);
		this.screenInfo.size = this.screenInfo.width<this.carouselMax||this.screenInfo.height<this.carouselMax?'small':'large';
		this.deviceSize = {
			'width' : this.screenInfo.width,
		    'height' : this.screenInfo.height
		};
		$j('body').attr({
			'data-ppi' : this.screenInfo.ppi,
	    	'data-width' : this.screenInfo.width,
	    	'data-height' : this.screenInfo.height,
	    	'data-size' : this.screenInfo.size
	    });
		
		this.getUserDevice();
		
		return this.deviceSize;
	},
	getUserDevice : function(){
		var ua,device;
		ua = navigator.userAgent;
		$M.browser_product = navigator.product;
		$M.browser_vendor = navigator.vendor;
		if(ua.indexOf('iPhone') !== -1){
			device = 'phone';
		}
		else if(ua.indexOf('iPad') !== -1){
			device = 'tablet';
		}
		else if(ua.indexOf('Android') !== -1){
			if(this.screenInfo.size === 'small'){
				device = 'phone';
			}
			else{
				if(this.screenInfo.orientation === 'landscape'){
					if(this.screenInfo.width < (this.carouselMax*2)){
						device = 'phone';
					}
					else{
						device = 'tablet';
					}
				}
				else{
					device = 'tablet';
				}
			}
		}
		else{
			device = 'desktop';
		}
		this.screenInfo.device = device;
	},
	uniqueAttributeSource : '_id',
	uniqueAttributeTarget : 'id',
	templates : {},
	templateUpdated: function(object){
		// method to indicate a template has been refreshed
		if (object){
			var templateId = object.id;
			if (templateId){
				this.templates[templateId] = object;
				// do any automation code here (i.e. fix)
				this._updateTemplateInstanceIds(object);
			}
		}
	},
	/** 
	 * Walks iron-list elements and applies a key from the record across child IDs
	 */
	_updateListInstanceIds: function(component, div){ //coming in with DIV containing repeated elements
		var list = div.parentNode;
		if (list){
			var collection = list._collection;
			if(collection){
				var instances = $j(div).children('div');
				for(var i=0; i<instances.length; i++){
					var instance = list.modelForElement(instances[i]);
					if(!instance || (typeof instance.index === 'undefined')){
						continue;
					}
					// use a uniqueAttribute from the template(or collection) that specifies what
					// the attribute will be it will default to href
					var idSuffix = '';
					if(this.uniqueAttributeSource === '_id'){
						var uniqueKey = collection.userArray[instance.index][this.uniqueAttributeSource];
						if (uniqueKey){
							uniqueKey = this.makeSafeId(uniqueKey);
							idSuffix = uniqueKey.substring(uniqueKey.lastIndexOf('/')+1, uniqueKey.length);
						}
					}
					else {
						// it's a comma separated list of attributes
						var attrs = this.uniqueAttributeSource.split(',');
						var sep = '';
						for (var j=0; j<attrs.length; j++){
							idSuffix = idSuffix + sep + collection.userArray[instance.index][attrs[j]];
							sep = '_';
						}
					}
					component.listMutationObserver.disconnect();
					instance._children.forEach(function(child){
						if (child.nodeType === 1){	// element
							this._addIdSuffix(child, idSuffix, true);
						}
					}, this);
					component.startListMutationObserver();
				}
			}
		}
	},
	/** 
	 * Walks template elements and applies a key from the record across child IDs
	 */
	_updateTemplateInstanceIds: function(template){
		if (template && template._instances && template._instances.length){
			for(var i=0; i<template._instances.length; i++){
				var instance = template._instances[i];
				// use a uniqueAttribute from the template(or collection) that specifies what
				// the attribute will be it will default to href
				var idSuffix = '';
				if(this.uniqueAttributeSource === '_id'){
					var arrayElement = instance.dataHost.collection.userArray[i];
					if(arrayElement){
						var uniqueKey = instance.dataHost.collection.userArray[i][this.uniqueAttributeSource];
						if (uniqueKey){
							uniqueKey = this.makeSafeId(uniqueKey);
							idSuffix = uniqueKey.substring(uniqueKey.lastIndexOf('/')+1, uniqueKey.length);
						}
					}
				}
				else {
					// it's a comma separated list of attributes
					var attrs = this.uniqueAttributeSource.split(',');
					var sep = '';
					for (var j=0; j<attrs.length; j++){
						idSuffix = idSuffix + sep + instance.dataHost.collection.userArray[i][attrs[j]];
						sep = '_';
					}
				}
				instance._children.forEach(function(child){
					if (child.nodeType === 1){	// element
						this._addIdSuffix(child, idSuffix,true);
					}
				}, this);
			}
		}
	},
	_addIdSuffix: function(element, suffix, reset, pre){
		if(typeof reset === undefined){
			reset = false;
		}
		if(reset || !element.hasAttribute('data-uniqueid')){
			if(element.hasAttribute('id')){
				if(!element.hasAttribute('original-id')){
					element.setAttribute('original-id', element.getAttribute('id'));
				}
				
				if($j(element).hasClass('cardborder')){
					if(element.hasAttribute('data-index') && element.getAttribute('data-index')==='0'){
						element.setAttribute('tabIndex', '0');
					}
					$j(element).toggleClass('rtl',this.dir==='rtl');
					$j(element).on('keydown', function(e){
						switch(e.keyCode){
							case $M.keyCode.ENTER:
							case $M.keyCode.SPACEBAR:
								$j(e.currentTarget).trigger('click');
								break;
							case $M.keyCode.LEFT:
								if($j(e.currentTarget).prev().hasClass('cardborder')){
									e.currentTarget.removeAttribute('tabIndex');
									$j(e.currentTarget).prev().attr('tabIndex', '0');
									$j(e.currentTarget).prev().focus();
								}
								break;
							case $M.keyCode.UP:
								break;
							case $M.keyCode.RIGHT: //right
								if($j(e.currentTarget).next().hasClass('cardborder')){
									e.currentTarget.removeAttribute('tabIndex');
									$j(e.currentTarget).next().attr('tabIndex', '0');
									$j(e.currentTarget).next().focus();
								}
								break;
							case $M.keyCode.DOWN:
								break;
						}
					});

				}
				if(pre){
					element.setAttribute(this.uniqueAttributeTarget, suffix + element.getAttribute('original-id'));	
				}
				else {
					element.setAttribute(this.uniqueAttributeTarget, element.getAttribute('original-id') + suffix);	
				}
				element.setAttribute('data-uniqueid', true);
			}
			// now do it's children
			if(element.children){
				for (var i=0; i<element.children.length; i++){
					var child = element.children[i];
					if (child.nodeType === 1){	// element
						this._addIdSuffix(child, suffix, reset, pre);
					}
				}
			}
		}
	},
	getGlobalResource: function(id){
		return window[id];
	},
	format: function(method, value){
  		if(!method || typeof method === 'undefined' || method === ''){
  			return value;
  		}
		var formatter = this[method.value];
		if(!formatter){
			console.error($M.localize('messages', 'mxapibase', 'Invalidformatdefinedfor0', [this.id]));
			return value;
		}
		return formatter(value);
	},
	createAttrArrayFromRecords : function(array,attribute,formatFunction) {
		var returnArray = [];
		if (array !== null) {
			for (var i = 0; i < array.length;i++) {
				var val = array[i][attribute];
				if (formatFunction) {
					val = formatFunction(val);
				}
				returnArray.push(val);
			}
		}
		return returnArray;
	},
	/**
	 * Hide Card based on passed in element.
	 * Card will hide, but will reload if necessary when refreshed and refetched from server.
	 */
	hideCard : function(context, e, dataSetId){
		var target = '';
		if(e.currentTarget!==null){
			target = e.currentTarget;
		} else {
			target = e.target;
		}
		var card = this.findCard(target);
		if(card){
			var originalHeight = $j(card).height();
			$j(card).css({'height':originalHeight+'px'});
			this.async(function(){
				$j(card).css({'transition':'.5s ease'});
				$j(card).css({'height':'0px','transform':'scale(.01)'});
				var ironlist = $M.findElementParent(card,'IRON-LIST');
				this.async(function(){
					if(e.model){
						$j(card).css({'transition':'none'});
						$j(card).css({'height':originalHeight+'px','transform':'scale(1)'});
						//context.splice(dataSetId, e.model.index, 1);
						if(ironlist){
							ironlist.notifyResize();
						}
					}
					else {
						$j(card).css({'display':'none'});
						if(ironlist){
							ironlist.notifyResize();
						}
					}
				},300);	
			}, 10);

		}
	},
	/**
	 * Find card based on passed in child element.
	 * Traverses up the card to find cardborder, which is the parent level of the card.
	 */
	findCard : function(element){
		var parent = element.parentNode;
		while (parent!==null && !$j(parent).hasClass('cardborder')){
			parent = parent.parentNode;
		}
		return parent;
	},
	/**
	 * Find parent of element based on passed in searchType
	 * Traverses up the card to find element of type searchType.
	 */
	findElementParent : function(element, searchType){
  		var parent = element.parentNode;
  		var typeArray = searchType.split('||');
  		while (parent!==null && !this.arrayContains(typeArray, parent.tagName)){
			parent = parent.parentNode;
		}
		return parent;
	},
	/**
	 * Display common Not Available (N/A) localized label.
	 */
	getNoDataString : function(){
		return this.noDataString;
	},
	hideKeyboard: function(focusElement) {
          document.body.focus();
	},
	loadResources: function(){
		var context = this;
		this.login.toggleLoading(true);
		if(this.requiredBundles.messages === 'login'){ //login page
			this.unloadedBundles.login = this.resolveUrl('..')+'maximo-login/resources.js';
		}
		else if (!this.requiredBundles || this.requiredBundles.length === 0){
			//do nothing
			this.login.showMe();
			this.login.toggleLoading(false);
			this.toggleWait(false);
		}
		else {
			Object.keys(this.requiredBundles).forEach(function(type){
				var messageGroups = context.requiredBundles[type].join(',');
				context.unloadedBundles[type] = $M.getMaxauth().baseUri+'/oslc/'+type+'?groups='+messageGroups;	
			});
		}
		Object.keys(this.unloadedBundles).forEach(function(key){
			var url = context.unloadedBundles[key];
			$j.ajax({
				url: url,
				resourceType: key,
				headers: {
				    'Accept-Language': context.lang
				},
				data: {
					format: 'text'
				},
				error: function(jqXHR, textStatus, errorThrown ) {
					sessionStorage.removeItem('workScapeConfiguration');
					context.unloadedBundles = {};
					console.log(errorThrown);
					context.login._clearForm();
					context.login.showMe();
					context.login.toggleLoading(false);
					context.toggleWait(false);
					if(jqXHR.status !== 401){
						context.login.showMessage('resource_error');	
					}
					context.login.toggleLoading(false);
				},
				dataType: 'json',
				success: function(data, textStatus, jqXHR) {
					//if(data[$M.lang] && data[$M.lang][this.groupNames]){
						//data = data[$M.lang][this.groupNames];
					//}
					var req = this;
					Object.keys(data).forEach(function(groupName){
						if(groupName && data[groupName]){
							data[groupName]._fetchDate = (new Date()).getTime();
							var storeData = data[groupName];
							if(storeData.label && Object.keys(storeData).length === 2){
								storeData = storeData.label;
							}
							context._storeResources(req.resourceType, groupName, storeData);						
						}
					});
					delete context.unloadedBundles[this.resourceType];
					if(context.bundlesLoaded()){
						context.login.toggleLoading(false);
						context._loadLicenses();
					}
				},
				type: 'GET'
			});
		});
	},
	bundlesLoaded: function(){
		return !this.unloadedBundles || Object.keys(this.unloadedBundles).length === 0;
	},
	_loadLicenses(){
		var context = this;
		$j.ajax({
			url: $M.maxauth.baseUri+'/oslc/licenseinfo',
			headers: {
			    'Accept-Language': context.lang
			},
			data: {
				format: 'text'
			},
			error: function(jqXHR, textStatus, errorThrown ) {
				sessionStorage.removeItem('licenses');
				console.log(errorThrown);
				context.login._clearForm();
				context.login.showMe();
				context.login.toggleLoading(false);
				context.toggleWait(false);
				if(jqXHR.status !== 401){
					// TODO: Create message
					context.login.showMessage(context.localize('uitext', 'mxapibase', 'license_error'));	
				}
			},
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				context._storeLicenses(data);
				context._loadSigoptions();
			},
			type: 'GET'
		});
	},
	_loadSigoptions(){
		var context = this;
		$j.ajax({
			url: $M.maxauth.baseUri+'/oslc/permission/allowedappoptions?workcenter='+context.newWorkscape,
			headers: {
			    'Accept-Language': context.lang
			},
			data: {
				format: 'text'
			},
			error: function(jqXHR, textStatus, errorThrown ) {
				sessionStorage.removeItem('options');
				console.log(errorThrown);
				context.login._clearForm();
				context.login.showMe();
				context.login.toggleLoading(false);
				context.toggleWait(false);
				if(jqXHR.status !== 401){
					// TODO: Create message
					context.login.showMessage(context.localize('uitext', 'mxapibase', 'sigoptions_error'));	
				}
			},
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				context._storeSigoptions(data);
				context._loadWorkscape();
			},
			type: 'GET'
		});
	},
	_loadWorkscape: function(){
		var context = this;
		this.requestedWorkCenter = context.newWorkscape;
		context.noDataString = context.localize('uitext', 'mxapibase', 'NotEntered');
		this.async(function(){
			Polymer.Base.importHref('script/workscape/workscape-'+context.newWorkscape+context.vulcanizedExtension+'.html', function(e) {
				if(context.login){
					context.login.toggleLoading(false);
				}
				context.toggleWait(true);
				$j('workscape-'+context.currentWorkscape).remove();
				context.currentWorkscape = context.newWorkscape;
				context.collections = {};
				context.components = {};
				context.elementCounts = {};
				context.listeners = {};
				var ws = Polymer.Base.create('workscape-'+context.newWorkscape, {'id':context.newWorkscape});
				Polymer.dom($j('body')[0]).appendChild(ws);
				if(context.login){
					context.login.hideMe();
				}
				context.async(function(){
					this.applySubRoute(this.subroute);
					context.toggleWait(false);
				});
			}, function(e) {
				if(context.login){
					context.login.toggleLoading(false);
					context.login.showMe();
				}
				context.toggleWait(false);
			});
		});
	},
	_storeResources: function(type, groupName, data){
		var resources = JSON.parse(sessionStorage.getItem('resources'));
		if(!resources.strings[type]){
			resources.strings[type] = {};
		}
		resources.strings[type][groupName] = data;
		sessionStorage.setItem('resources', JSON.stringify(resources));
		if(!this.resources.strings[type]){
			this.resources.strings[type] = {};
		}
		this.resources.strings[type][groupName] = data;
	},
	_storeLicenses: function(data){
		sessionStorage.setItem('licenses', JSON.stringify(data));
	},
	_storeSigoptions: function(data){
		sessionStorage.setItem('options', JSON.stringify(data));
	},
	_setLocale: function(locale){
		this.locale = locale.toLowerCase();
		var split = locale.includes('_')?locale.split('_'):locale.split('-');
		var lang = split[0];
		if(lang === 'ar' || lang === 'he'){
			this.dir = 'rtl';
			this.skin+=' rtl';
			document.dir = 'rtl';
		}
		this.locale = locale;
		this.lang = lang;
		document.getElementsByTagName('html')[0].setAttribute('lang',lang);
	},
	_loadResources: function(newValue){
		if(newValue!==null){
			if(this.demo){
				this._loadWorkscape();
				return;
			}
			this.requiredBundles = newValue;
			if(!this.requiredBundles){
				this.requiredBundles = {};
			}
			if(!this.requiredBundles.uitext){
				this.requiredBundles.uitext = [];
			}
			if(this.requiredBundles.uitext.indexOf('mxapibase')===-1){
				this.requiredBundles.uitext.push('mxapibase');
			}
			if(this.requiredBundles.uitext.indexOf('mxapiwelcome')===-1){
				this.requiredBundles.uitext.push('mxapiwelcome');
			}
			if(this.requiredBundles){
				var loaded = true;
				var resources = JSON.parse(sessionStorage.getItem('resources'));
				var context = this;
				if(resources){
					Object.keys(context.requiredBundles).forEach(function(key){
						context.requiredBundles[key].forEach(function(bundle){
							if(!resources.strings[key] || !resources.strings[key][bundle]){
								loaded = false;
							}
						});
					});
				}
				if(loaded){
					$M.resources = resources;
					this._loadWorkscape();
				}
				else {
					this.loadResources();
				}
			}
			else {
				this._loadWorkscape();
			}
		}
	},
	resources: { //filled in by loadResources
		strings : {
		}
	},
	checkSession: function(error){
		var errorCodes = [401,403];
		for (var i = 0; i < errorCodes.length; i++){
			if(error.detail.request.status === errorCodes[i]){
				$M.workScape.returnToLogin();
				return false;
			}
		}
		return true;
	},
	_changeWorkCenter: function(workcenter, properties){
		this.toggleWait(true);
		var workscapeConfiguration = sessionStorage.getItem('workScapeConfiguration');
		sessionStorage.removeItem('workScapeConfiguration');
		if(!this.loadWorkscape(workcenter, properties)){
			sessionStorage.setItem('workScapeConfiguration', workscapeConfiguration);
			this.toggleWait(false);
		}
	},
	loadWorkscape: function(workscape, properties){
		if(!this.demo && !this.hasAccessToWorkscape(workscape)){
			return false;
		}
		var workscapeConfiguration = JSON.parse(sessionStorage.getItem('workScapeConfiguration'));
		this.setNewWorkscape(workscape);
		var requiredResources;
		if (properties){
			sessionStorage.setItem('workScapeProperties', JSON.stringify(properties));
		}
		if(workscapeConfiguration && workscapeConfiguration.workscapeId === workscape){
			requiredResources = workscapeConfiguration.requiredResources;
			if(!requiredResources){
				requiredResources = [];
			}
			this.vulcanizedExtension = workscapeConfiguration.vulcanizedExtension?workscapeConfiguration.vulcanizedExtension:'';
			if(!this.requiredResources){
				this.requiredResources = requiredResources;
			}
			if(requiredResources.length!==0){
				return true;
			}
		}
		if(!this.initallyLoaded){
			this.toggleWait(false);
		}
		this.initallyLoaded = true;
		if(this.login){
			this.login.hideMe();
		}
		var context = this;
		var login = this.login;
		var configURL = this.resolveUrl('../../workscape/configuration/'+workscape+'.json');
		$j.ajax({
			url: configURL,
			data: {
				format: 'text'
			},
			error: function(jqXHR, textStatus, errorThrown ) {
				if(jqXHR.error().status===404){
					context.setConfiguration();
				}
				else {
					if(login){
						login.showMe();
						login.toggleLoading(false);
						console.error(errorThrown.message);
						login.showMessage('unknown_error');
					}
				}
			},
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				context.setConfiguration(data);
			},
			type: 'GET'
		});
		return true;
	},
	/** Get all common defined actions. These contain icon, event, label */
	getCommonActions: function(){
		var actions = this.workScape.commonActions;
		if(actions.localized===false){
			for (var key in actions) {
				if (actions.hasOwnProperty(key)) {
					var action = actions[key];
					if(action.label){
						action.label = this.localize('uitext', 'mxapibase', action.label);
					}
				}
			}
			actions.localized = true;
		}
		return actions;
	},
	setNewWorkscape: function(workscape){
		this.currentWorkscape = this.newWorkscape;
		this.newWorkscape = workscape;
	},
	setConfiguration: function(configData){
		if(!configData){
			configData = {'requiredResources':{}};
		}
		this.vulcanizedExtension = configData.vulcanizedExtension?configData.vulcanizedExtension:'';
		configData.vulcanizedExtension = this.vulcanizedExtension;
		configData.workscapeId = this.newWorkscape;
		sessionStorage.setItem('workScapeConfiguration', JSON.stringify(configData));
		var login = this.login;
		var context = this;
		var maxauth = this.getMaxauth();
		if(maxauth && maxauth.baseUri && !$M.demoMode){
			var configURL = maxauth.baseUri + '/oslc/appcfg/'+this.newWorkscape;
			$j.ajax({
				url: configURL,
				data: {
					format: 'text'
				},
				error: function(jqXHR, textStatus, errorThrown ) {
					if(login){
						login.showMe();
						login.toggleLoading(false);
						console.error(errorThrown.message);
						login.showMessage('unknown_error');
					}
				},
				dataType: 'json',
				success: function(data, textStatus, jqXHR) {
					context._setApplicationProperties(data);
					context.requiredResources = configData.requiredResources;
				},
				type: 'GET'
			});
		}
		else {
			context.requiredResources = configData.requiredResources;
		}
	},
	_setApplicationProperties: function(applicationProperties){
		$M.addToMaxauth('applicationProperties',applicationProperties);
	},
	
	/**
	 * Get an application property or undefined if not found
	 */
	getApplicationProperty: function(propertyName){
		var props = this.getApplicationProperties();
		if(props){
			return props[propertyName];
		}
		return undefined;
	},
	
	/**
	 * Get all system properties
	 */
	getSystemProperties: function(){
		var maxauth = $M.getMaxauth();
		if(maxauth){
			var whoami = maxauth.whoami;
			if(whoami && whoami.wcsyscfg){
				return whoami.wcsyscfg;
			}
		}
		return undefined;
	},
	
	/**
	 * Get a system property or undefined if not found
	 */
	getSystemProperty: function(propertyName){
		var sysProps = this.getSystemProperties();
		if(sysProps){
			return sysProps[propertyName];
		}
		return undefined;
	},
	
	/**
	 * Get all application properties
	 */
	getApplicationProperties: function(){
		var maxauth = $M.getMaxauth();
		if(maxauth && maxauth.applicationProperties){
			return maxauth.applicationProperties;
		}
		return undefined;
	},
	/**
	 * Get all sigoptions
	 */
	getSigoptions: function(){
		return JSON.parse(sessionStorage.options);
	},
	/**
	 * Get licenses
	 */
	getLicenses: function(){
		return JSON.parse(sessionStorage.licenses);
	},	
	hasAccessToWorkscape : function(workscape) {
		return this.getAllowedWorkscapes()[workscape] !== undefined;
	},
	getAllowedWorkscapes : function() {
		var maxauth = $M.getMaxauth();
		if(maxauth){
			var whoami = maxauth.whoami;
			if(whoami && whoami.workcenters){
				return whoami.workcenters;
			}
		}
		return {};
	},
	arrayContains: function(arr, object){
		for (var i in arr) {
			if (arr[i] === object){
				return true;
			}
		}
		return false;
	},
	arrayRemove: function(arr, object){
		var index = -1;
		while((index = arr.indexOf(object)) >=0 ){
			arr.splice(index,1);
		}
	},	
	/*
	 * Create Undo overlay
	 */
	createOverlay : function(toOverlay, message, completeCallback, undoCallback, timer, scroller, actions, noBR) {
		var id = '';
		var completeTimer; 
		
		if (toOverlay.id) {
			id = toOverlay.id;
		}

		var css, attributes, remove;
		if(typeof timer === 'object' && timer !== null){
			scroller = timer.scroller;
			actions = timer.actions;
			noBR = timer.noBR;
			css = timer.css;
			attributes = timer.attributes;
			remove = timer.remove
			timer = timer.timer;
		}
		
		if(!scroller){
			scroller = window;
		}
		
		var overlay = Polymer.Base.create('div', {'id':'overlay'+id, 'align': 'center'});
		overlay.style.background = '#FFFFFF';
		overlay.style.opacity = 0.93;
		overlay.style.position = 'absolute';
		overlay.style.zIndex = 999;
		
		var overlayChild = Polymer.Base.create('div', {'id':'overlayChild'+id});
		overlayChild.style.position = 'relative';
		overlayChild.style.paddingRight = '28px';
		overlayChild.style.paddingLeft = '28px';
		overlayChild.style.top = '50%';
		overlayChild.style.transform = 'translateY(-50%)';

		var overlayMessage = Polymer.Base.create('MAXIMO-LABEL', {'label':message, 'style':'font-size:22px;'});
		var overlayButton = Polymer.Base.create('MAXIMO-LABEL', {'label':this.localize('uitext', 'mxapibase', 'Undo'), 'style':'color:#5696e2;font-size:20px;'});

		overlayChild.appendChild(overlayMessage);
		if (noBR === undefined || noBR === false){
			overlayChild.appendChild(Polymer.Base.create('br', {}));
		}
		
		if(actions){
			overlayChild.appendChild(actions); //custom actions provided by the caller
			actions.addEventListener('click', function(e) {
				if(remove === undefined || remove === true){
					overlay.remove();
					toOverlay.overlay  = null;
				}
				if (completeTimer) {
					window.clearTimeout(completeTimer);
				}
				if (undoCallback) {
					undoCallback();
				}
			});
		}
		else {
			var overlayButtonIcon = Polymer.Base.create('IRON-ICON', {'icon':'maximo-based:undocard'});
			overlayButtonIcon.style.marginBottom = '6px';
			overlayButtonIcon.style.paddingLeft = '10px';

			// button
			var overlayButtonDiv = Polymer.Base.create('div', {'id':'overlaybuttondiv'+id,'class':'overlaydiv','align': 'center'});
			overlayButtonDiv.style.paddingTop = '10px';
			overlayButtonDiv.style.cursor = 'pointer';
			if (noBR){
				overlayButtonDiv.style.display = 'inline-block';
			}
			
			overlayButtonDiv.appendChild(overlayButtonIcon);
			overlayButtonDiv.appendChild(overlayButton);

			overlayButtonDiv.addEventListener('click', function(e) {
				if(remove === undefined || remove === true){
					overlay.remove();
					toOverlay.overlay  = null;
				}
				if (completeTimer) {
					window.clearTimeout(completeTimer);
				}
				if (undoCallback) {
					undoCallback();
				}
			});
			overlayChild.appendChild(overlayButtonDiv);
		}
			
		overlay.appendChild(overlayChild);
		
		if (toOverlay) {
			overlay.style.top = parseInt(toOverlay.offsetTop)+'px';
			overlay.style.left = parseInt(toOverlay.offsetLeft)+'px';

			overlay.style.height = parseInt(toOverlay.clientHeight)+'px';
			overlay.style.width = parseInt(toOverlay.clientWidth)+'px';
			
			if (toOverlay.children[0] && toOverlay.tagName !== 'TR'){
				toOverlay.insertBefore(overlay, toOverlay.children[0]);
			} 
			else {
				toOverlay.appendChild(overlay);
			}
			toOverlay.overlay  = overlay;
		}

		$j(overlay).css({'z-index':1});
		if(scroller){
			$j(overlay).css({'margin-top':'-'+scroller.scrollTop+'px','margin-left':'-'+scroller.scrollLeft+'px'});
			overlay.scrollHandler = $j(scroller).on('scroll', function(){
				$j(overlay).css({'margin-top':'-'+scroller.scrollTop+'px','margin-left':'-'+scroller.scrollLeft+'px'});	
			});
		}
		overlay.resizeHandler = $j(window).on('resize', function(){
			window.setTimeout(function(){
				overlay.style.height = parseInt(toOverlay.clientHeight)+'px';
				overlay.style.width= parseInt(toOverlay.clientWidth)+'px';
			}, 300);
		});
		
		if (timer) {
			completeTimer = window.setTimeout(function() {
				overlay.remove();
				overlay.scrollHandler.off();
				overlay.resizeHandler.off();
				if (completeCallback) {
					completeCallback(toOverlay);
				}
			}, timer * 1000);
		}
		
		if(css){
			Object.keys(css).forEach(function(key){
				$j(overlay).css(key,css[key]);
			});
		}
		if(attributes){
			Object.keys(attributes).forEach(function(key){
				if(key === 'hidden'){
					$j(overlay).hide();
				}
				else {
					$j(overlay).attr(key,css[key]);
				}
			});
		}
		return overlay;
	},
	removeTextSelection: function(){
		if (window.getSelection) {
			if (window.getSelection().empty) {  // Chrome
				window.getSelection().empty();
			} 
			else if (window.getSelection().removeAllRanges) {  // Firefox
			    window.getSelection().removeAllRanges();
			}
		}
		else if (document.selection) {  // IE?
			document.selection.empty();
		}
	},
	getCSRFToken : function(){
		var csrftoken = sessionStorage.getItem('csrftoken');
		if(csrftoken === undefined || csrftoken === null){
			csrftoken = '';
		}
		return csrftoken;
	},
	openStartCenter: function(){
		//do this since we are re-using the same window and user could logout and back in with a different language from base.
		sessionStorage.removeItem('resources'); 
		document.location = this._getMaximoRecordLink('startcntr');
	},
	objectToArray: function(obj){
		return Object.keys(obj).map(x => obj[x]);
	},
	newQbe: function(qbewhere) {
		return new MaximoQbe(qbewhere);
	},
	makeSafeId: function(id){
		return id.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '_');
	},
	/**
	 * Redirects user to its default work center or welcome page
	 */
	showDefaultWorkCenter: function() {
		var defaultApp = this.getDefaultApplicationId(true);
		this._changeWorkCenter(defaultApp.toLowerCase());
	},
    /* jshint ignore:start */
	hexToRgb: function(hex) {
	    var bigint = parseInt(hex, 16);
	    var r = (bigint >> 16) & 255;
	    var g = (bigint >> 8) & 255;
	    var b = bigint & 255;
	    return r + "," + g + "," + b;
	}
    /* jshint ignore:end */
});
