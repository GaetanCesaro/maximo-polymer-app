/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

Polymer({
    is: 'maximo-login',
    resourceComments: ['\/\/START NON-TRANSLATABLE','\/\/END NON-TRANSLATABLE'],
    properties: {

    	username: {
    		type: String,
    		value: ''
    	},

    	password: {
    		type: String,
    		value: ''
    	},
    	signInError: {
    		type: Boolean,
    		value: false
    	},
    	error: {
    		type: Boolean,
    		value: false
    	},
    	phoneScreen: {
    		type: Boolean,
    		value: false,
    		observer: 'phoneScreenChanged'
    	},

    	loginMaterialPanelClass: {
    		type: String
    	},
		personData: {
			type: Object,
			notify: true					
		},
		keyval: {
      		type: String,
      		notify: true
      	},		      
      	keyname: {
      		type: String,
      		notify: true
      	},
      	maxauth: {
      		type: Object
      	},
      	resources: {
      		type: Boolean,
      		value: false
      	},
      	showing: {
      		type: Boolean,
      		value: false
      	},
      	_inactivityTimeoutStart: { //in seconds
      		type: Number
      	},
      	_userActive: {
      		type: Boolean,
      		value: false
      	},
      	_userActivityThreshold: {
      		type: Number,
      		value: 60
      	},
      	_lastPing: {
      		type: Number,
      		value: 0
      	},
      	_showing: {
      		type: Boolean,
      		value: true
      	}
    },
    behaviors: [BaseComponent],
    ready: function(){

    },
	attached: function(){
		$M.login = this;
		this.loadResources();
	},
    loadResources: function(lang, retry){
		if(this.resources){
			this.handleLogin();
			return;
		}
   		var findLang = lang;
   		if(!findLang) {
   			findLang = lang==='en'? '': $M.lang==='en'?'':($M.lang.toLowerCase()==='en-us'?'':'/'+$M.lang);
   		}
    	var maximoLoginProp = this.resolveUrl('..')+'maximo-login/translation'+findLang.toLowerCase()+'/resources.json';
    	var login = this;
    	$j.ajax({
			url: maximoLoginProp,
			headers: {
			    'Accept-Language': lang
			},
			lang: findLang,
			data: {
				format: 'text'
			},
			error: function(jqXHR, textStatus, errorThrown ) {
				if(retry){
					console.log('An error has occured while loading the login resources for '+this.lang+'. Reverting to English.');	
					login.loadResources('en');
				}
				else {
					login.loadResources('/'+this.lang.substring(1).split('-')[0], true);
				}
			},
			dataType: 'text',
			success: function(data, textStatus, jqXHR) {
				login.resourceComments.forEach(function(comment){
					data = data.replace(new RegExp(comment, 'g'),'');
				});
				data = JSON.parse(data);
	    		$M._storeResources('uitext','login', data);
				login.saasAndFederal();
				login.resources = true;
				login.handleLogin(true);
			},
			type: 'GET'
		});
    },
    
    saasAndFederal: function(){
    	var maximoLoginProp = this.resolveUrl('..')+'maximo-login/maximo-login-properties.json';
    	var login = this;
    	$j.ajax({
			url: maximoLoginProp,
			headers: {
			    'Accept-Language': login.lang
			},
			data: {
				format: 'text'
			},
			error: function(jqXHR, textStatus, errorThrown ) {
				login.setSaasAndFederal(false,false);
			},
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				login.setSaasAndFederal(data.isSaas,data.isFederal);
			},
			type: 'GET'
		});

    },
    
    /**
     * Check if customer is SAAS and federal 
     */
    setSaasAndFederal: function(isSaas,isFederal) {
    	if(isSaas){
    		if(isFederal){
    			$j(this).find('#saasLabel').$.label.innerHTML = this.localize('uitext','login','federal'); 
    		} else {
    			$j(this).find('#saasLabel').$.label.innerHTML = this.localize('uitext','login','nonfederal'); 
    		}
    	} else {
    		$j(this).find('#saasNotice').css({'display':'none'});
    	}
    },
	handleChange: function(e){
		if(e.keyCode===13){
			this.handleLogin(false);
		}
	},
	handleLogin: function(silent){
		this.silent = silent===true;
		if(!silent){
			$M.toggleWait(true);
		}
		var params = false;
		var username = $j(this).find('#uname_input').val();
		var password = $j(this).find('#pwd_input').val();
		if(window.urlParams.username && window.urlParams.password) {
			params = true;
			username = window.urlParams.username;
			password = window.urlParams.password;
		}
		$M.addToMaxauth('username', username);
		$j(this).find('#message').attr('hidden','true');
		this.signInError = false;
		sessionStorage.setItem('lastLoginAttempt', (new Date()).getTime());
		this.$.authenticator.login(username, password);
	},
	handleLoginError: function(e){
		$j(this).find('#message').attr('hidden','true');
		if(!this.silent){
			this.signInError = true;
		}
		this.silent = false;
		this.showMe();
		this.showMessage(localStorage.getItem('loginMessage'));
		localStorage.removeItem('loginMessage');
		$M.toggleWait(false);
	},
	handleLoginSuccess: function(e){
		this.toggleLoading(true);
		this.silent = false;

		var login = this;
		var maxauth = $M.getMaxauth();
		
		this._userActivityThreshold = ((maxauth.sessiontimeout - maxauth.inactivetimeout)/3);
		if(this._userActivityThreshold > 60){ //ping server at least every minute
			this._userActivityThreshold = 60;
		}
		
		this._lastPing = this._getCurrentTimeInSeconds();
		this._startInactivityTimer();

		this.keyname = 'user.userid';
		this.keyval = $M.getMaxauth().username;
		
		this.$.userInfoResource.resourceUri = maxauth.baseUri + '/oslc/whoami?addapps=1&wcsyscfg=1';
		this.$.userInfoResource.loadRecord().then(function(result){
			var whoami = result;
			var temp = {};
			Object.keys(whoami.workcenters).forEach(function(wcId, idx) {
				whoami.workcenters[wcId].hidden = false;
				var lowerCaseId = wcId.toLowerCase(); 
				if($M.screenInfo.size==='small' && (lowerCaseId==='datasetdesigner' || lowerCaseId==='inspectorsup' || lowerCaseId === 'weatheradmin')){ //do not allow DsD on small devices.
					whoami.workcenters[wcId].hidden = true;
				}
				temp[wcId.toLowerCase()] = whoami.workcenters[wcId];
			});
			//a few hard coded WorkCenters
			temp.test = {apptype:'APP',description:'',hidden:true}; //used to allow a test WS
			temp.welcome = {apptype:'APP',description:'',hidden:true}; //default landing page when no default WC is defined
			
			whoami.workcenters = temp;
			var maxauth = $M.getMaxauth();
			maxauth.whoami = whoami;
			if(!maxauth.whoami.defaultLcale || maxauth.whoami.defaultLcale === ''){
				var locale = navigator.language.replace('-','_');
				maxauth.whoami.defaultLcale = locale;
				if(locale.indexOf('_')===-1){
					maxauth.whoami.defaultLcale += '_US'; 
				}
				var langLocation = maxauth.whoami.defaultLcale.split('_');
				maxauth._lang = langLocation[0];
				maxauth._country = langLocation[1];
				if(maxauth.whoami.defaultLanguage && maxauth.whoami.defaultLanguage.length>0){
					maxauth._lang = maxauth.whoami.defaultLanguage.toLowerCase();
				}
				if(maxauth.whoami.langcode && maxauth.whoami.langcode.length>0){
					maxauth._lang = maxauth.whoami.langcode.toLowerCase();
				}
				maxauth.whoami.defaultLcale = maxauth._lang + '_' + maxauth._country;  
				maxauth.username = maxauth.whoami.userName;
				$M._setLocale(maxauth.whoami.defaultLcale);
				document.documentElement.lang = maxauth._lang;
			}
			$M.setMaxauth(maxauth);
	    	login.personId = maxauth.whoami.personId;
	    	login.$.personcollection.refreshRecords();
		}, 
		function(error, response) {
			console.warn('Could not fetch user information.');
			console.error(login.localize('uitext','login','unknown_error',[]));
		});
	},
	loadResourcesAndWorkscape: function(){
		var requestedWorkCenter = $M.$.contextAppRouter.data.workcenter;
		if(requestedWorkCenter){
			if($M.hasAccessToWorkscape(requestedWorkCenter.toLowerCase())){
				$M.toggleWait(true);
				$M.loadWorkscape(requestedWorkCenter);
				return;
			}
			else if(Object.keys($M.getAllowedWorkscapes()).length > 2) { //not test and not welcome
				this._offerBaseRedirect();
				return;
			}
		}
		var defwork = $M.getDefaultApplicationId(true);
		if(defwork){
			this.changeToApp(defwork);
		}
		else {
			if(requestedWorkCenter){
				this._offerBaseRedirect();
			}
			else {
				window.location = $M.getMaxauth().baseUri;
			}
		}
	},
	_offerBaseRedirect: function(){
    	this.toggleLoading(false);
		var message = $M.localize('uitext','login','no_access_default');
		$M.confirm(message, function(response, e){
			if(response === true){
				this.changeToApp($M.getDefaultBaseApplicationId(true));
			}
			else {
				this._cancelLogin();
			}
		}, this, 1, [0,1]);
	},
	_noAllowedWorkScapes: function(defaultApp){
		var message = $M.localize('uitext','login','noworkscape');
		$M.confirm(message, function(response, e){
			if(response === true){
				window.location = $M.getMaxauth().baseUri;
			}
			else {
				this._cancelLogin();
			}
		}, this, 1, [0,1]);

	},
	_cancelLogin: function(){
		$M.toggleWait(true);
    	this._clearForm();
    	this.$.authenticator.logout();
	},
	/**
	 * Determines workcenter or application in maximo an changes to it.
	 */
	changeToApp: function(id){
		this.toggleLoading(true);
		if(id==='startcntr'){
			$M.openStartCenter();
			return;
		}
		var application = $M.getApplication(id);
		var type = application && application.apptype?application.apptype:'RUN';
		switch (type){
			case 'RUN':
				var location = $M.getMaxauth().baseUri; 
				if(id && id.length>0){
					location += '/ui/?event=loadapp&value='+id;
				}
				window.location = location;
				break;
			default:
				$M.currentWorkscape = 'login';
				$M.set('route.path', '/'+id.toLowerCase());
				break;
		}
	},
	showMessage: function(key){
		if(!key || key === undefined){
			return;
		}
		this.signInError = false;
		this.error = true;
		var param = this.localize('uitext', 'login', 'contact_admin');
		var string = this.localize('uitext', 'login', key, [param]);
		if(string.length>30 && window.innerHeight<=400){
			string = string.substring(0,85)+'...';
		}
		if(string !== undefined && string !== 'undefined'){
			this.$$('#message').label = string;
			this.$$('#message').removeAttribute('hidden');
		}
	},
	
	phoneScreenChanged: function()
	{
		if (this.phoneScreen === true)
		{
			this.loginMaterialPanelClass = 'loginMaterialPanelPhoneScreen';
		}
		else
		{
			this.loginMaterialPanelClass = 'loginMaterialPanel';
		}
	},
	toggleLoading: function(on){
		if(on){
			$j('#WAIT_wait').css({'display':'none'});
		}
		$j(this).find('.signinbutton').css({'visibility':on?'hidden':'visible'});
		$j(this).find('#loading').css({'opacity':on?1:0,'display':on?'initial':'none'});
	},
	hideMe: function(){
		$j(this).find('.loginpanel').css({'opacity':'0'});
		$j(this).find('.loginpanel').css({'display':'none'});
		if($M.workScape){
			$M.workScape.hidden=false;
		}
	},
	showMe: function(){
		if($M.workScape){
			$M.workScape.hidden=true;
		}
		var login = this;
		this.async(function(){
			$j(login).find('.loginpanel').css({'display':'inherit'});
			$j(login).find('.loginpanel').css({'opacity':'1'});				
		});
	},
  	listeners: {
        'login-success': 'handleLoginSuccess',
        'login-error': 'handleLoginError',
        'login-user-activity': '_userActivity'
    },
    _clearForm: function(){
    	$j(this).find('input').val('');
    },
    _getCurrentTimeInSeconds: function(){
    	return Math.floor(new Date().getTime() / 1000);
    },
    _checkInactivityTimer: function(){
    	var maxauth = $M.getMaxauth();
    	if(!maxauth){
    		return;
    	}
    	var elapsed = (this._getCurrentTimeInSeconds() - this._inactivityTimeoutStart ) + 1;
    	
    	var remaining = maxauth.sessiontimeout - elapsed;

    	if(this._userActivityCheck()){
    		return;
    	}
    	
    	if($M.debug){
	    	if(!this.timer){
	    		this.timer = document.createElement('div');
	    		document.body.appendChild(this.timer);
	    		$j(this.timer).css({'position':'absolute','z-index':'10000','background-color':'#fff','top':'50px','color':'red','border':'1px solid #999'});
	    	}
	    	this.timer.innerHTML = remaining;
    	}
    	if(elapsed >= (maxauth.sessiontimeout - maxauth.inactivetimeout)){
    		if(remaining <= 0){
    			window.clearTimeout(this.inactivityInterval);
    			this.inactivityInterval = null;
    			if(this.timeoutWarnDialog){
    				this.timeoutWarnDialog.close();
    			}
    			$M.toggleWait(true);
    			this.async(function(){
    				$M.workScape.timeout();	
    			}, 100);
    			return;
    		}
    		else {
		    	if(this.timeoutWarnDialog){
		    		$j('.sessionRemaining').html(Math.abs(remaining));
		    	}
		    	else {
		    		var count = '<span class="sessionRemaining style-scope maximo-context">'+remaining+'</span>';
		    		if(!this.inactivityMessage){
			    		this.inactivityMessage = $M.localize('uitext','mxapibase','inactivity_warn', [count]);
			    		this.inactivityQuestion = $M.localize('uitext','mxapibase','inactivity_stay');
		    		}
		    		this.timeoutWarnDialog = $M.confirm(this.inactivityMessage + '<br>'+ this.inactivityQuestion, function(){this.timeoutWarnDialog = null; this._startInactivityTimer(true);}, this, 0, [0], null, 'none');
		    		$j(this.timeoutWarnDialog).find('.dialogIcon').hide();
		    		$j(this.timeoutWarnDialog).find('.dialogCloseButton').hide();
		    		$j(this.timeoutWarnDialog).find('.header').hide();
		    		var login = this;
		    		//change to 1 second interval so we can refresh the countdown
	    			window.clearTimeout(this.inactivityInterval);
	    			this.inactivityInterval = null;
		    		this.inactivityInterval = window.setInterval(function(){
		        		login._checkInactivityTimer();
		        	}, 1000);
		    		$j(this.timeoutWarnDialog).on('mousedown mouseup tap', function(e){
		    			e.stopPropagation();
		    		});
		    	}
    		}
    	}
    },
    _resetInactivityStart: function(){
    	var maxauth = $M.getMaxauth();
    	if(!maxauth){
    		return;
    	}
    	var currentTime = this._getCurrentTimeInSeconds();
    	//adjust by 5 seconds to avoid request missing window at the end of countdown
    	this._inactivityTimeoutStart = currentTime - 5;
    	if(this.inactivityInterval){
    		window.clearTimeout(this.inactivityInterval);
    		this.inactivityInterval = null;
    	}
    	return currentTime;
    },
    _pingServer: function(maxauth){
    	if(this.inactivityInterval){
    		window.clearTimeout(this.inactivityInterval);
			this.inactivityInterval = null;	
    	}
		this._userActive = false;
		this.$.keepAlive.resourceUri = maxauth.baseUri + '/oslc/ping/';
    	var login = this;
    	//do this before ping to avoid a few second time mismatch problem. Better to timeout a few seconds early than leave user without a session.
		this._lastPing = this._getCurrentTimeInSeconds();
		this.$.keepAlive.loadRecord().then(function(result){
			login._startInactivityTimer(false);
		});
    },
    _startInactivityTimer: function(ping){
    	var maxauth = $M.getMaxauth();
    	if(!maxauth || !maxauth.sessiontimeout || maxauth.sessiontimeout === 0){
    		return; //do nothing
    	}
   	
    	if(ping){
    		this._pingServer(maxauth);
    		return;
    	}
    	
    	this.sessionTimeoutStart = this._resetInactivityStart();
    	
    	var login = this;
    	if(!this.inactivityInterval){
        	this.inactivityInterval = window.setInterval(function(){
        		login._checkInactivityTimer();
        	}, 1000);
    	}
    	if(!this.bodyInactivityEvents){
    		this.bodyInactivityEvents = true;
    		
    		$j('body').on('tap', function(e){
				login.fire('login-user-activity', {type:e.type});
    		});

    		$j('body').on('keydown', function(e){
    			login.fire('login-user-activity', {type:e.type});
    		});
    		
    		$j('body').on('mouseup', function(e){
    			login.fire('login-user-activity', {type:e.type});
    		});
    		
    		$j('body').on('mousedown', function(e){
    			login.fire('login-user-activity', {type:e.type});
    		});
    		
    		$j('body').on('mousemove', function(e){
    			if(!login.timeoutWarnDialog){
    				login.fire('login-user-activity', {type:e.type});
    			}
    		});
    	}
    },
    _userActivity: function(e){
    	this._userActive = true;
    },
    _userActivityCheck: function(){
    	var maxauth = $M.getMaxauth();
    	if(!maxauth){
    		return;
    	}
		if(this.stopUserActivityEvents || this.timeoutWarnDialog){ //only one every 2 seconds 
			return;
		}
		this.stopUserActivityEvents = true;
		var login = this;
		this.activityTimer = setTimeout(function(){
			window.clearTimeout(login.activityTimer);
			login.stopUserActivityEvents = false;
		}, 2000);
		var elapsed = this._getCurrentTimeInSeconds() - this._lastPing;
		if((elapsed > this._userActivityThreshold) && this._userActive){
			this._startInactivityTimer(true);
			return true;
		}
		return false;
    },
    _handleUserDataRefreshed: function(e){
    	$M.userInfo = this.personData[0];
    	this.loadResourcesAndWorkscape();
    },
    _handleUserDataError: function(){
    	this._offerBaseRedirect();
    }
});