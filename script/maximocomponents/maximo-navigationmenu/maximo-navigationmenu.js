/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2017
 */

/*
A navigation menu component.
 */
Polymer({
	is : 'maximo-navigationmenu',
	behaviors : [ BaseComponent,ArrowKeys],
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
		_allowedCount : {
			type: Number,
			value: 0
		},
		_arrowKeyInfo: {
			type: Object,
			value: function(){
				return {'selector':'li:not([heading])', 'focusSelector':'a', 'parentElementId':'expandeddiv', 'allowDisabled': true};
			} 
		}
	},
	/**
	 * @polymerBehavior 
	 */
	listeners: {
		'iron-overlay-closed' : 'menuClosed'
	},
	ready : function() {
		var temp = [];
		var allowedWC = $M.getAllowedWorkscapes();
		var navMenu = this;
		Object.keys(allowedWC).forEach(function(workCenterId){
			var workCenter = allowedWC[workCenterId];
			var menuEntry = {label:workCenter.description,event:'change-workcenter',value:workCenterId.toLowerCase(),apptype:workCenter.apptype};
			if(!workCenter.hidden && workCenter.description && workCenter.description !== '' && !$M.arrayContains(allowedWC,menuEntry)){
				temp.push(menuEntry);
				navMenu._allowedCount++;
			}
		});
		temp.sort(function(a, b) {
		    return a.label >  b.label;
		});
		if(temp.length <=1 || $M.currentWorkscape === 'welcome'){
			$j(this.$.outer).attr({'hidden':'true'});
			return;
		}
		this.set('menuoptions', temp);
		$j(this.$.menusection).css({'top':'50px'});
		if($M.dir !== 'rtl'){
			this.$.menusection.style.right='0px';	
		}
		else {
			this.$.menusection.style.left='0px';
		}
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
	toggleMenu : function () {
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
				    		navMenu.$.button.focus();
				    		return;
				    	}
						navMenu._arrowKeyHandler(e);
					});
				}
			},100);
		}
	},	
	_isWC: function(item){
		var isWC = ('WC' === item.apptype);
		if(isWC){
			$j(this.$.WCHeading).attr('hidden',false);
			$j(this.$.WCHeadingHR).attr('hidden',false);
			$j(this.$.WCHeadingBR).attr('hidden',false);
		}
		return isWC;
	},
	_isAPP: function(item){
		var isAPP = ('APP' === item.apptype);
		if(isAPP){
			$j(this.$.APPHeading).attr('hidden',false);
			$j(this.$.APPHeadingHR).attr('hidden',false);
		}
		return isAPP;
	},
	_setMenuState : function (open) {
		$j(this.$.outer).toggleClass('open',this.isopen);
	},
	_itemURL: function(value){
		var url = '#/'+value;
		if($M.demoMode){
			url = 'Javascript: void(0)';
		}
		return url;
	},
	menuClosed : function (e) {
		this._setMenuState(false);		
	},
	_disabled: function(appId){
		return appId === $M.currentWorkscape;
	},
    _showMore: function(count){
    	return count>1;
    },
    _wait: function(e){
    	if(!e.target.hasAttribute('disabled')){
    		$M.toggleWait(true);
    	}
    },
    _isOpen: function(open){
    	return open;
    }
});