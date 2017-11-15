/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A simple panel component.
 */
Polymer({
	is: 'maximo-simple-panel',
	behaviors: [BaseComponent],
	properties: {
		title: {
			type: String,
			value: 'Panel'
		},		
		count: {
			type: String
		},
		backButton : {
			type: Boolean,
			value: false,
			notify : true,
			observer : '_showBackButton'
		}
	},
	moveToHeader: ['maximo-searchbar'],
	created: function(){
	},
	ready: function(){
		this.moveToHeader.forEach(function(tagName){
			var element = $j(this.$.panelInternal).find(tagName);
			if(element[0]){
				element.css({'padding-top':'0px','padding-bottom':'0px'});
				Polymer.dom(this.$.additional).appendChild(element[0]);
			}
		}, this);
	},
	attached: function(){
	},
	refresh: function(){
	},
	_showBackButton : function() {
		console.log('backbutton:'+this.backButton);
		if (this.backButton) {
			$j(this.$.dialogBackButton).css({'display':'block'});
			$j(this.$.panelHeader).addClass('panelHeaderWithBackButton');
			
			this.listen(this.$.dialogBackButton, 'tap', '_onTap');

		} else {
			$j(this.$.dialogBackButton).css({'display':'none'});
		}
	},
  	_onTap : function(e) {
  		this.fire('close', this);
  	}
  	
});