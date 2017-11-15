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
A detail card title component.
 */
Polymer({
	is: 'maximo-detailcard-title',
  	behaviors: [BaseComponent],
    
    properties: {    
    	id: {
    		type: String
    	},
    	
    	tooltip: {
    		type:String,
			notify:true
    	},
		
		dclabel:{
			type:String,
			notify:true,
			observer:'_calculateBlur'
		},
		
		dcparent:{
			type:String,
			notify:true,
			//observer:'_setLabelClass'
		},
		
		dclabel_nosnip:{
			type:String,
			notify:true,
		},
		
		blurstring:{
			type:String,
			notify:true,
			value:null,
		},
		
		labelClass:{
			type:String,
			notify:true,
			value:'dclabel',
		},
		
		showblur:{
			type:Boolean,
			notify:true,
			value: false
		},
		
		singlevaluetitlefontcolor:{
			type: String,
			notify: true,
			//observer: ' _updateSingleValueFontColor'
		},
		
		singlevaluetitlesize:{
			type: String,
			notify: true,
			value: 'big',
			//observer: '_updateSingleValueSize'
		},
    },
    
    ready: function() {
    	
    	//this._calculateBlur();
    	this._updateStyles();
    	this._updateSingleValueFontColor();
    	this._updateSingleValueSize();
    },
    
    
    
    getNoSnipTitle() {
    	return this.dclabel_nosnip;
    },
    
    _calculateBlur() {
    	var snipLength = this._snipLength();
    	var snipOffset = snipLength-(this.dcparent === 'singlevalue' ? 4 : 5);		
    	this.dclabel_nosnip = !this.dclabel_nosnip ? this.dclabel : this.dclabel_nosnip;
    	if(this.dclabel)
        { 
	    	if(this.dclabel.length >= snipLength)
	    	{
	    		this.blurstring = this.dclabel.substring(snipOffset,snipLength);
	    		this.blurstring = "...";
	    		this.dclabel = this.dclabel.substring(0, snipOffset-1);
	    		this.showblur = true;
	    	}
        }
    },
    
    _snipLength() {
    	
    	//this.dcparent === 'picturebox' ? 32 : this.dcparent === 'singlevalue' ? 25 : 40;
    	if(this.dcparent === 'picturebox')
		{
    		return 32;
		}
    	if(this.dcparent === 'singlevalue' && this.singlevaluetitlesize === 'medium')
		{
    		return 30;
		}
    	if(this.dcparent === 'singlevalue' && this.singlevaluetitlesize === 'small')
		{
    		return 38;
		}
    	if(this.dcparent === 'singlevalue' && this.singlevaluetitlesize === 'big')
		{
    		return 25;
		}
    	return 40;
    },
    
    _updateSingleValueSize() {
    	
    	this.customStyle['--maximo-singlevalue-info-title-font-size'] = this.singlevaluetitlesize === 'small' ? "14px" 
				   : this.singlevaluetitlesize === 'medium' ? "18px"
						   						: "22px";
    	this.updateStyles();
    },
    
    _updateSingleValueFontColor() {
    	
		this.customStyle['--maximo-singlevalue-info-title-font-color'] = this.singlevaluetitlefontcolor;
    	this.updateStyles();
    },
    
    _updateStyles() {
    	this.labelClass = this.dcparent ? this.dcparent : 'dclabel';
    	this.updateStyles();
    	
    	//this.customStyle['--maximo-detailcard-title-overflow-display'] = this.showblur ? "inline-block" :"display";
    	/*this.customStyle['--maximo-singlevalue-info-bkcolor-background'] = this.backgroundColor;
    	this.customStyle['--maximo-singlevalue-info-bordercolor-border-color'] = this.borderColor;
    	this.customStyle['--maximo-singlevalue-info-title-font-size'] = this.titleSize === 'small' ? "14px" :"22px";
    	this.customStyle['--maximo-singlevalue-info-title-font-color'] = this.titleFontColor;
    	this.customStyle['--maximo-singlevalue-info-value-font-color'] = this.valueFontColor;
    	this.customStyle['--maximo-singlevalue-info-svinfoicon-margin'] = this.titleSize === 'small' ? "4px 0px 0px 235px" :"-7px 0px 0px 235px";
    	this.customStyle['--maximo-singlevalue-info-svinfoicon-display'] = this.showInfo ? "inline-block" :"none";
    	this.updateStyles();*/
    },
    
    _fireDetailHoverEvent: function(e) {
    	e.currentTarget.tooltip = this.tooltip;
    	e.currentTarget.label = this.dclabel;
    	e.currentTarget.label_nosnip = this.dclabel_nosnip;
    	this.fire('title-overflow-event',e.currentTarget);
    },
    
    
    _setLabelClass() {
    	
    	this.labelClass = this.dcparent;
    	
    },
    
    
});
