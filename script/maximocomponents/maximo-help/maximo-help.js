/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A help component.
 */
Polymer({
	is: 'maximo-help',

	behaviors: [ BaseComponent ],

	properties: {
		tooltip: {
			type: String,
			value: ''
		},
		light: {
			type: Object,
			value: function(){
				return false;
			}
		}
    },
    
    ready: function(){
   		$j(this.$.help).toggleClass('light', this.light);
    },
    
    keypress: function(e){
    	if(e.keyCode === 13 || e.keyCode === 32){
    		this.showTooltip(e);
    	}
    },
    
    showTooltip: function(e){
    	if(this.tooltip){
    		$M.showTooltip(this.tooltip, {'element':$j(this.$.help),'position':'east'});
    		$j(this.$.help).off('mouseout.tooltip');
    	}
    },
    
    hideTooltip: function(e){
    	$M.tooltip.hide();
    },
    
    hoverTooltip: function(){
    	var help = this;
    	$j(this.$.help).one('mouseout.tooltip', function(){
    		if(help.hoverTimer){
    			window.clearTimeout(help.hoverTimer);
    		}
    	});
		help.hoverTimer = setTimeout(function(){
			help.showTooltip();
			$j(help.$.help).one('mouseout.tooltip', function(){
				if($M.tooltip){
					$M.tooltip.hide();
				}
			});
		}, 300);
    }

});