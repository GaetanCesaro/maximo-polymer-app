/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
    is: 'maximo-remote-notification',
    behaviors: [
        BaseComponent,
        Polymer.NeonAnimationRunnerBehavior
    ],

    properties: {
        // notification counter
        counter: {
            type: Number,
            value: 0,
            notify: true
        },
        // call the function behind this object when there are new notifications
        _newNotificationListeners: {
            type: Array,
            value: function () {return [];}
        },
        // how long before refresh the counter in miliseconds, default 30 seconds
        refreshTimeout: {
            type: Number,
            value: 30000,
            notify: true,
            reflectToAttribute: true
        },
        // holds the notifications hrefs (members)
        members: {
            type: Array,
            value: function () {return [];}
        },
        // hold notification details
        notifications: {
            type: Array,
            notify: true,
            value: function () {return [];}
        },
        // which notifcation events should be shown on the widget
        filterEvents: {
            type: Array,
            notify: true,
            reflectToAttribute: true,
            value: function () {return [];}
        },
        // show/hide notification date based on attribute set to the component
        showDate: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        
        _lastnotificationtime:{
        	 type: String,
        	 value:null
        },
        
        _cancelCurrentUpdateNotificationBadge:{
        	 type: Boolean,
             value: false,
        },
        
        _noNotifications: {
            type: Boolean,
            value: false,
            notify: true,
            reflectToAttribute: true
        },
        // holds the handle of async requests to update notification unread counter
        _refreshGenerator: {
            type: Object
        },
        // tells if the notificationContainer is hidden
        _notificationContainerHidden: {
            type: Boolean,
            value: true
        },
        animationConfig: {
            value: function () {
                return {
                    entry: {
                        // provided by neon-animation/animations/scale-up-animation.html
                        name: 'fade-in-animation',
                        node: this.$.notificationsContainer,
                        timing: {duration: 300}
                    },
                    exit: {
                        // provided by neon-animation/animations/scale-down-animation.html
                        name: 'fade-out-animation',
                        node: this.$.notificationsContainer,
                        timing: {duration: 300}
                    }
                };
            }
        }
    },
    listeners: {
        'subscribe-all-records': '_onSubscribeToAllRecords',
        'notifications-changed': '_updateNoNotifications',
        'counter-changed': '_updateCounterBadge',
        'neon-animation-finish': '_onNeonAnimationFinish',
        // trigger to open/close the notification overlay
        'toggle-notf-overlay': '_showHideNotificationContainer'
    },

    ready: function () {
   
        // If authentication is needed, just return.
        if (this._isAuthenticationNeeded()) {
            return (new Promise(function (resolve, reject) {
                reject('Authentication needed');
            }).bind(this));
        }

        // setup ajax requests 
        this._setupAjaxRequests();

        // check for new notifications
       // this.$.mxajaxCountNotifications.generateRequest();
        // send request
        this.$.mxajaxAllNotifications.generateRequest();

        // enable tap listeners
        this._enableTaps();

        // Enable document-wide tap recognizer to capture outside tap
        Polymer.Gestures.add(document, 'tap', this._onCaptureClick.bind(this));

        // adjust notification overlay size based on the device size
        var notfContainer = this.$.notificationsContainer;
        notfContainer.style.maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - notfContainer.offsetTop + 'px';
        document.documentElement.addEventListener('onresize', function () {
            notfContainer = this.$.notificationsContainer;
            notfContainer.style.maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - notfContainer.offsetTop + 'px';
        });

        // dom-repeat
        this.$.repeater.templatize(this.querySelector('#notftemplate'));
        Polymer.Bind.prepareModel(this.$.repeater);
        Polymer.Base.prepareModelNotifyPath(this.$.repeater);
    },

    detached: function () {
        // stop async requests to update notification unread counter
        this.cancelAsync(this._refreshGenerator);
    },

    _updateNoNotifications: function () {
        this._noNotifications = (this.notifications.length === 0);
    },
    
    _enableTaps: function () {
        // listen to tap events to open and close notification overlay
        this.listen(this.$.notificationIconContainer, 'tap', '_showHideNotificationContainer');
        this.listen(this.$.backIcon, 'tap', '_showHideNotificationContainer');
    },

    _disableTaps: function () {
        // unlisten to tap events to open and close notification overlay
        this.unlisten(this.$.notificationIconContainer, 'tap', '_showHideNotificationContainer');
        this.unlisten(this.$.backIcon, 'tap', '_showHideNotificationContainer');
    },

    _setupAjaxRequests: function () {
        // build intobject name in ('x', 'y')

        // mxapinotification?lean=1&oslc.select=notfeventmessage,notificationtime&oslc.where=eventforuser="FRAN" and dismissed=false&oslc.orderBy=-notificationtime
        ajax = this.$.mxajaxAllNotifications;
        ajax.url = this._getLoggedUserNotificationsURL();
        ajax.headers = {};
    },

    _updateCounterBadge: function () {
        if (this.counter > 0) {
            this.$.notificationCounterBadge.classList.remove('hidden');
            // if the notification container is showing update notifications
            if (!this.$.notificationsContainer.classList.contains('hidden')) {
                this.$.mxajaxAllNotifications.generateRequest();
            }
        }
        else {
            this.$.notificationCounterBadge.classList.add('hidden');
        }
    },
    
    _refreshNotificationCounter: function () {
    	  var mixedEvents = '';
          var i = 0;
          for (i = this.filterEvents.length - 1; i >= 0; i -= 1) {
              mixedEvents += '"' + this.filterEvents[i] + '",';
          }
          mixedEvents = mixedEvents.slice(0, -1);
          // get user name
          var maxauth = $M.getMaxauth();
          var countnewUrl = maxauth.baseUri + '/oslc/os/mxapinotification?action=countnew' + 
              '&oslc.where=' + 
              
              encodeURIComponent('eventname in [' + mixedEvents  + 
                 '] and eventforuser="' + maxauth.username + '" and dismissed=false') +
                 (this._lastnotificationtime ?     encodeURIComponent(' and notificationtime>'+ '"' +this._lastnotificationtime) + '"' :'')+
                 (this._lastnotificationtime ?     encodeURIComponent(' and notificationtime>'+ '"' +this._lastnotificationtime) + '"' :'')
                 ;
          
          // mxapinotification?action=countnew&oslc.where=intobjectname="MXAPISR" and eventforuser="FRAN" and dismissed=false&_lid=fran&_lpwd=fran
          var ajax = this.$.mxajaxCountNotifications;
          ajax.url = countnewUrl;
          ajax.headers = {};
          this.$.mxajaxCountNotifications.generateRequest();
    },

    _updateCounter: function (e) {
    	var that = this;
    	if(this._cancelCurrentUpdateNotificationBadge === false){

            if (this.counter < e.detail.response.count) {
                // call listener
                for (var i = this._newNotificationListeners.length - 1; i >= 0; i--) {
                    var func = this._newNotificationListeners[i].listener
                    var context = this._newNotificationListeners[i].context;
                    // attach context and execute function
                    func.bind(context)();
                }
            }
            this.counter = e.detail.response.count;
    	}   	
    	
    	this._cancelCurrentUpdateNotificationBadge = false;
        
        this._refreshGenerator = this.async(function () { 
           that._refreshNotificationCounter();
        }, this.refreshTimeout);
    },
    
    _sendBulkRequest: function (object, data, action) {
        // build url
        var bulkUrl = $M.getMaxauth().baseUri + '/oslc/os/' + object + '?' + ((action) ? ('action=' + action) : '' );
        // send request
        var headers_ = {};
	    //adding the csrf token
        headers_.csrftoken = $M.getCSRFToken();
        headers_['x-method-override'] = 'BULK';	
            
        $j.ajax({
            url: bulkUrl,
            headers: headers_,
            contentType: 'application/json',
            data: ((typeof data) !== 'string') ? JSON.stringify(data) : data,
            dataType: 'json',
            type: 'POST',
            error: function (xhr, status, error) {
                console.log('Unable to request bulk for object ' + object + ', error: ' + error);
            }
        });
    },

    _dismissAllNotifications: function () {
        var toDismiss = [];
        var json = {};

        var i = 0;
        // format notifications to a BULK request for deletion
        for (i = this.notifications.length - 1; i >= 0; i--) {
            json = {
                _data: {},
                _meta: { 
                    uri: this.notifications[i].href,
                    method: 'PATCH',
                    patchtype: 'MERGE'
                }
            };
            toDismiss.push(json);
        }
        // mark all notifications read before dismissing
        this._markAllNotificationsRead();
        this._sendBulkRequest('mxapinotification', toDismiss, 'dismiss');
        this.notifications = [];
    },

    /**
     * Subscribe to all records for a given a collection-data (maximo-collection)
     */
    _onSubscribeToAllRecords: function (collectionData) {
        var subscribeAllArray = [];
        var json = {};

        var i = 0;
        var j = 0;
        // format the collectionData to a BULK request for subscription based on filterEvents
        for (i = this.filterEvents.length - 1; i >= 0; i -= 1) {
            for (j = collectionData.length - 1; j >= 0; j -= 1) {
                // build bulk item structure
                json = {
                    _data: { eventname: this.filterEvents[i]},
                    _meta: { 
                        uri: collectionData[j].href,
                        method: 'PATCH',
                        patchtype: 'MERGE'
                    }
                };
                subscribeAllArray.push(json);
            }
        }
        
        this._sendBulkRequest('mxapisr', subscribeAllArray, 'subscribe');
    },

    _onAllNotificationsResponse: function (e) {
        this.notifications = e.detail.response.member || [];
        // hide spinner after notifications are loaded
        this.$.spinner.hidden = true;
        this.$.notificationsContainer.classList.remove('song2');
        
        this._updateNotificationInfo();        
        if(this._cancelCurrentUpdateNotificationBadge ===false){
        	this._cancelCurrentUpdateNotificationBadge = true;
        	this._refreshNotificationCounter();
        }        
    },

    /**
     * Constructs a data access query URL.
     * mxapinotification?lean=1&oslc.select=notfeventmessage,notificationtime&oslc.where=eventforuser="FRAN" and dismissed=false&oslc.orderBy=-notificationtime
     * Returns the URL as a string.
     */
    _getLoggedUserNotificationsURL: function () {
    	var maxauth = $M.getMaxauth();
        return maxauth.baseUri + 
            '/oslc/os/mxapinotification?lean=1' + 
            '&oslc.select=notfeventmessage,notificationtime,_touched' + 
            '&oslc.where=eventforuser="' + encodeURIComponent(maxauth.username) + '"' +
            encodeURIComponent(' and ') + 'dismissed=false' +
            '&oslc.orderBy=-notificationtime';
    },

    /**
     * Indicates whether authentication is needed or not.
     */
    _isAuthenticationNeeded: function (e) {
        return this.$.myauthenticator.isAuthenticationNeeded();
    },

    // show/hide date
    _showDate: function () {
        if (!this.showDate) {
            return 'hidden';
        }
    },

    // show/hide notificationContainer and animates
    _showHideNotificationContainer: function () {
        // show overlay
        if (this.$.notificationsContainer.classList.contains('hidden')) {
            // change container state
            this._notificationContainerHidden = false;

            // only send request if there are new notifications
            if (this.counter > 0) {
                // add spinner until notifications are loaded
                this.$.spinner.hidden = false;
                // blur content
                this.$.notificationsContainer.classList.add('song2');
                // send request
                this.$.mxajaxAllNotifications.generateRequest();
            }

            // show notifications
            this.$.notificationsContainer.classList.remove('hidden');

            // adjust notification overlay size based on the device size
            var notfContainer = this.$.notificationsContainer;
            notfContainer.style.maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - notfContainer.offsetTop + 'px';

            // disable listeners until animation is finished (_onNeonAnimationFinish)
            this._disableTaps();

            // animate
            this.playAnimation('entry');
        } 
        // hide overlay
        else {
            this._notificationContainerHidden = true;
            
            // disable listeners until animation is finished (_onNeonAnimationFinish)
            this._disableTaps();

            // animate and hide
            this.playAnimation('exit');
            // the code bellow is under _onNeonAnimationFinish
            // this.$.notificationsContainer.classList.add('hidden');

            // mark all notifications as read after closing the overlay
            this._markAllNotificationsRead();
        }
    },

    _markAllNotificationsRead: function () {
        this.counter = 0;

        var markReadArray = [];
        var json = {};
        var newnotifications = [];

        var i = 0;
        // format the collectionData to a BULK request for subscription based on filterEvents
//        for (i = this.notifications.length - 1; i >= 0; i -= 1) {
        for (i = 0; i < this.notifications.length; i++) {
            if (this.notifications[i]._touched === false) {
                // force the read mark for consistency
                this.notifications[i]._touched = true;
                json = {
                    _data: {},
                    _meta: { 
                        uri: this.notifications[i].href,
                        method: 'PATCH',
                        patchtype: 'MERGE'
                    }
                };
                markReadArray.push(json);
            }
            
            newnotifications.push($M.cloneRecord(this.notifications[i]));
        }

        if (markReadArray.length === 0) {
            return;
        }

        this._sendBulkRequest('mxapinotification', markReadArray, 'markasread');
        
        this.notifications = newnotifications;
        this._updateNotificationInfo();
        this._cancelCurrentUpdateNotificationBadge = true;
    },
    
    _updateNotificationInfo: function () {
    	var notifications =0;
    	var updateTime=false
 	    for (i = 0; i < this.notifications.length; i++) {
            if (this.notifications[i]._touched === false) {
            	notifications++;
            }
            if (this.notifications[i]._touched === true && updateTime===false ) {
         	   this._lastnotificationtime = this._getNotificationTime (this.notifications[i].notificationtime);
         	   updateTime=true;
            }
        }
 	    this.counter=notifications;
     },
     
     _getNotificationTime: function (datetime){
    	 var hourStr = datetime.substring(11, 19)  ;
    	 var minuteStr ;
     	 var secondStr ;
    	 var hour = parseInt(hourStr.substring(0, 2));
    	 var minute =  parseInt(hourStr.substring(3, 5));
    	 var second =  parseInt(hourStr.substring(6, 8));
    	 
    	 second++;
    	 if(second===60){
    		 secondStr="00";
    		 minute++;
    	 }else  if(second < 10){
    		 secondStr="0"+second;
    	 }else{
    		 secondStr = "" +second;
    	 }
    	 
    	 if(minute>=60){
    		 minuteStr="00";
    		 hour++;
    	 }else  if(minute < 10){
    		 minuteStr="0"+minute;
    	 }else{
    		 minuteStr = "" +minute;
    	 }
    	 
    	 if(hour < 10){
    		 hourStr = "0" +hour;
    	 }else{
    		 hourStr = "" +hour;
    	 } 
    	 
    	 hourStr = hourStr + ":" + minuteStr + ":" + secondStr;
    	 
    	return datetime.replace(datetime.substring(11, 19),hourStr).replace("+", "-");
     },
     
    // when notificationContainer finishes the animation
    _onNeonAnimationFinish: function () {
        if (this._notificationContainerHidden) {
            this.$.notificationsContainer.classList.add('hidden');
        }
        // enable listeners again
        this._enableTaps();
    },
    // find notification overlay in path
    _overlayInPath: function (path) {
        path = path || [];
        var i = 0;
        for (i = 0; i < path.length; i += 1) {
            if (path[i] === this) {
                return true;
            }
        }
        return false;
    },
    // capture taps
    _onCaptureClick: function (event) {
        // Check if clicked outside of top overlay and overlay is not showing.
        if (!this._notificationContainerHidden && !this._overlayInPath(Polymer.dom(event).path)) {
            this._showHideNotificationContainer();
        }
    },
    // register a function to be called whenever a new notification comes up
    addOnNewNotification: function(listener, context) {
        this._newNotificationListeners.push({'listener': listener, 'context': context});
    }
});