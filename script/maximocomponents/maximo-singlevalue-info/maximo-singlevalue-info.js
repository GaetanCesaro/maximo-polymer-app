/*
 * Licensed Materials - Property of IBM
 *
 * 5724-U18
 *
 * (C) Copyright IBM Corp. 2016 All Rights Reserved
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

/*
A single value info component.
 */
Polymer({
	is: 'maximo-singlevalue-info',
  	behaviors: [BaseComponent],
    
    properties: {    
    	id: {
    		type: String
    	},
    	
    	tooltip: {
    		type:String,
			notify:true
    	},
		
		title:{
			type:String,
			notify:true,
			observer: "_setTooltip"
		},
		
		value:{
			type:String,
			notify:true,
			//observer: "_setData"
		},
		
		data: {
			type:Object,
			notify: true,
			//observer: "_setData"
		},
		
		backgroundColor:{
			type: String,
			notify: true,
			observer: "_updateStyles"
		},
		
		borderColor:{
			type: String,
			notify: true,
			observer: "_updateStyles"
		},
		
		
		titleFontColor:{
			type: String,
			notify: true,
			observer: "_updateStyles"
		},
		
		valueFontColor:{
			type: String,
			notify: true,
			observer: "_updateStyles"
		},
		
		titleSize:{
			type: String,
			notify: true,
			value: "big"
		},
		
		valueSize:{
			type: String,
			notify: true,
			value: "medium"
		},
		
		showInfo:{
			type: Boolean,
			notify: true,
			value: false
		},
		
    },
    
    ready: function() {
    	//Apply user custom style
    	this._updateStyles();
    },
    
    _updateStyles() {
    	this.customStyle['--maximo-singlevalue-info-bkcolor-background'] = this.backgroundColor;
    	this.customStyle['--maximo-singlevalue-info-bordercolor-border-color'] = this.borderColor;
    	this.customStyle['--maximo-singlevalue-info-title-font-size'] = this.titleSize === 'small' ? "14px" 
    																							   : this.titleSize === 'medium' ? "18px"
    																									   						: "22px";
    	this.customStyle['--maximo-singlevalue-info-value-font-size'] = this.valueSize === 'small' ? "14px" 
				   : this.valueSize === 'medium' ? "18px"
						   						: "22px";
    	this.customStyle['--maximo-singlevalue-info-title-font-color'] = this.titleFontColor;
    	this.customStyle['--maximo-singlevalue-info-value-font-color'] = this.valueFontColor;
    	this.customStyle['--maximo-singlevalue-info-svinfoicon-margin'] = this.titleSize === 'small' ? "4px 0px 0px 235px" 
    																								 : this.titleSize === 'medium' ? "-7px 0px 0px 235px"
    																										                        : "-24px 0px 0px 235px";
    	//this.customStyle['--maximo-singlevalue-info-svinfoicon-display'] = this.showInfo ? "inline-block" :"none";
    	this.customStyle['--maximo-singlevalue-info-svinfoicon-display'] = this.showInfo ? "visible" :"hidden";
    	this.updateStyles();
    },
    
    _fireInfoHoverEvent: function(e) {
    	e.currentTarget.tooltip = this.tooltip;
    	this.fire('info-hover-event',e.currentTarget);
    },
    
    _showOverflowInfo : function(e,myinfo,mytooltip) {
		e.stopPropagation();
		var tooltip = this.$[mytooltip];
		//this.set("statusLabelToolTip",e.currentTarget.dclabel_nosnip);
		$M.showTooltip(tooltip, {'element':myinfo,'background':'white','stopMouseDown':true});
	},
	
	_setTooltip: function() {
    	this.set("svToolTip",this.$.singlevaltitle.getNoSnipTitle());
    },
    

    _handleOverflowEvent: function(e,detail_icon_clicked)
    {
    	var icon = e.currentTarget;
		var card = this;
		var tooltip = e.currentTarget.tooltip;
		if(icon.hoverTimer){
			window.clearTimeout(icon.hoverTimer);
		}
		
		$j(icon).one('mouseleave', function(){
			if(icon.hoverTimer){
				window.clearTimeout(icon.hoverTimer);
			}
			$M.tooltip.hide();
		});
		
		icon.hoverTimer = setTimeout(function(){
			card._showOverflowInfo(e,detail_icon_clicked,tooltip);
		}, 350);
    	
    },
    
    
    _setData() {
    	
    },
    
    
});
