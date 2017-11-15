/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2017
 */

/*
A user menu component.
 */
Polymer({
	is : 'maximo-usermenu',
	/**
	 * @polymerBehavior 
	 */
	behaviors : [ BaseComponent, ArrowKeys ],
	properties : {		
		menuoptions : {
			type: Array,
			value: function(){
				return [];
			},
			notify: true
		},
		isopen : {
			type : Boolean,
			value : false
		},
		_arrowKeyInfo: {
			type: Object,
			value: function(){
				return {'selector':'li', 'focusSelector':'a', 'parentElementId':'expandeddiv', 'allowDisabled': true};
			}
		}
	},
	listeners: {
		'iron-overlay-closed' : 'menuClosed'
	},
	ready : function() {
		$j(this.$.menusection).css({'top':'50px'});
		if($M.dir !== 'rtl'){
			this.$.menusection.style.right='0px';	
		}
		else {
			this.$.menusection.style.left='0px';
		}
	},
	toggleMenu : function (e) {
		if (this.menuoptions) {
			this.isopen = !this.isopen;
			this._setMenuState(this.open);
		}
		if(this.isopen){
			var navMenu = this;
			this.async(function(){
				if(!navMenu.keysAdded){
					navMenu.keysAdded = true;
					$j(this.$.expandeddiv).find('li').on('keydown', function(e){
				    	if(e.which === $M.keyCode.ESCAPE){
				    		navMenu.$.wrkspaceimg.focus();
				    		return;
				    	}
				    	navMenu._arrowKeyHandler(e);
					});
				}
			},100);
		}
	},	
	_setMenuState : function (open) {
		$j(this.$.outer).toggleClass('open',this.isopen);
	},
	menuClosed : function (e) {
		this._setMenuState(false);		
	},
	signout: function(){
		$M.workScape.signout();
	},
	openStartCenter: function(e){
    	$M.openStartCenter();
    },
    _showWelcome: function(){
    	if($M.currentWorkscape !== 'welcome'){
	    	var maxauth = JSON.parse(sessionStorage.getItem('maxauth'));
	    	if(maxauth){
	    		var whoami = maxauth.whoami;
				if(whoami){
					
					if(whoami.workcenters && Object.keys(whoami.workcenters).length>0){
						var temp = [];
						Object.keys(whoami.workcenters).forEach(function(workCenterId){
							var workCenter = whoami.workcenters[workCenterId];
							if(!workCenter.hidden){
								temp.push(workCenterId);
							}
						//return true;
						});
						return temp.length>0;
					}
				}
	    	}
    	}
		return false;
    },
	_buttonkey: function(e){
		var valid = false;
		switch (e.which){
			case $M.keyCode.ENTER:
				this.toggleMenu();
				valid = true;
				break;
			case $M.keyCode.DOWN:
				valid = true;
				if(!this.isopen){
					this.toggleMenu();
				}
				break;
		}
		if(this.isopen && valid){
			this.async(function(){
				$j(this.$.menusection).find('a')[0].focus();	
			}, 100);

		}
	},
    _wait: function(e){
    	if(!e.target.hasAttribute('disabled')){
    		$M.toggleWait(true);
    	}
    },
    _getImage: function(){
    	return $M.userInfo._imagelibref;
    }
});