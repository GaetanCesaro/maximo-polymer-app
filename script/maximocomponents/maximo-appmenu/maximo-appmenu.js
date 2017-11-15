/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
Application menu component.
 */
Polymer({
	is : 'maximo-appmenu',
	properties : {		
		menuoptions : {
			type: Array,
			value: function(){
				return [];
			},
			notify: true
		},
		menuicon : {
			type : String,
			value: 'icons:menu',
			notify: true
		},
		isopen : {
			type : Boolean,
			value : false
		}
	},
	/**
	 * @polymerBehavior 
	 */
	behaviors : [ BaseComponent ],
	listeners: {
		'iron-overlay-closed' : 'menuClosed'
	},
	ready : function() {
		var temp = [];
		var allowedWC = $M.getAllowedWorkscapes();
		Object.keys(allowedWC).forEach(function(workCenterId){
			var workCenter = allowedWC[workCenterId];
			var menuEntry = {label:workCenter.description,event:'change-workcenter',value:workCenterId.toLowerCase(),apptype:workCenter.apptype};
			if(workCenter.description && workCenter.description !== '' && !$M.arrayContains(allowedWC,menuEntry)){
				temp.push(menuEntry);
			}
		});
		temp.sort(function(a, b) {
		    return a.label >  b.label;
		});
		temp.push({label:$M.localize('uitext','mxapibase','More...'),event:'change-workcenter',value:'welcome',sep:true});
		if(temp.length === 0 || (temp.length===2 && temp[1].value === $M.currentWorkscape)){
			$j(this.$.outer).attr({'hidden':'true'});
			return;
		}
		else {
			this.set('menuoptions', temp);
			$j(this.$.menusection).css({'top':'50px','left':'0px'});
		}
	},
	toggleMenu : function (e) {
		if (this.menuoptions) {
			this.isopen = !this.isopen;
			this._setMenuState(this.open);
		}
	},	
	_isWC: function(item){
		return 'WC' === item.apptype;
	},
	_isAPP: function(item){
		return 'APP' === item.apptype;
	},
	_setMenuState : function (open) {
		this.menuicon = this.isopen ? 'icons:highlight-off' : 'icons:menu';
	},
	_itemURL: function(value){
		var url = '#/'+value;
		return url;
	},
	menuClosed : function (e) {
		this._setMenuState(false);		
	},
	_checkItem: function(junk){
		console.log('tester');
	},
	_disabled: function(appId){
		return appId === $M.currentWorkscape;
	}
});