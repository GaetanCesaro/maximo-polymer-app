/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-tooltip>` element. Used to show a tooltip. This is a singleton element and can be used via maximo-context - $M.showTooltip()

Example:
```html
	Tooltip is a singleton and should be included by the platform at the top level of the page.
```

@demo
 */
Polymer({
	is: 'maximo-tooltip',
	behaviors: [ BaseComponent ],
	properties: {
		_position: {
			type: String,
			observer: '_positionTooltip'
		},
		stopMouseDown: {
			type: Boolean,
			value: false
		}
    },
/**
 * Show a tooltip 
 * @param {HTMLElement or String} message The message to show in tooltip
 * @param {Object or HTMLElement} optionsOrElement The Element to which tooltip is attached or an object with properties. 
 * The only supported options are  {element, position(north,south,east,west)}
 */
	show: function(message, optionsOrElement){
		this.windowInfo = {'innerHeight':window.innerHeight,'innerWidth':window.innerWidth};		
		$j(this.$.tooltip).css({'opacity':'0'});
		$j(this.$.tooltip).css({'display':'initial'});
		if(!optionsOrElement){
			return;
		}
		this.attemptedPosition = {'top':0,'left':0};
		this.currentOffset = $j(this.$.tooltip).offset();
		this.arrowOffset = 14;
		this.positionsAttempted = 0;
		if(optionsOrElement.tagName){
			this.element = optionsOrElement;
		}
		else {
			if(!optionsOrElement.element){
				return;
			}
			this.element = optionsOrElement.element;
			this.stopMouseDown = optionsOrElement.stopMouseDown;
			this.background = optionsOrElement.background;
		}
		
		if(this.background !== undefined){
			$j(this.$.tooltip).css({'background':this.background});
			$j(this.$.pointer).css({'background':this.background});
		}		
		
		this.element = $j(this.element);
		this.elementOffset = $j(this.element).offset();
		$j(this.$.tooltip).attr({'aria-label':message});
		$j(this.$.content).empty();
		if(typeof message === 'string'){
			$j(this.$.content).text(message);
		}
		else {
			$j(this.$.content).append(message);
		}
		this._position = null; //needed in case same tooltip is shown again and must adjust for size
		this.elementDim = {'h':this._getFullHeight(this.element),'w':this._getFullWidth(this.element)};
		this.tooltipDim = {'h':this._getFullHeight(this.$.tooltip),'w':this._getFullWidth(this.$.tooltip)};
		this._position = optionsOrElement.position?optionsOrElement.position:'east';
		$j(this.$.tooltip).css({'opacity':'1'});
		var tooltip = this;
		$M.currentTooltip = this;
		this._addMouseDown();
		this.async(function(){
			$j(this.element).focus();	
		});
		$j(window).one('resize.tooltip', function(){
			tooltip.hide();
		});
		$j(window).one('scroll.tooltip', function(){
			tooltip.hide();
		});
		if($M.workScape && $M.workScape.slider){
			$j($M.workScape.slider.$.container).one('scroll.tooltip', function(){
				tooltip.hide();
			});
		}
	},
/**
 * Hide a tooltip
 * @param {Boolean} immediate Hide the tooltip without a fade effect.
 */ 
	hide: function(immediate){
		this._position = null;
		if($M.currentTooltip && this !== $M.currentTooltip){
			$M.currentTooltip.hide();
			return;
		}
		$j(this.$.tooltip).css({'opacity':'0'});
		var tooltip = this;
		if(immediate){
			$j(tooltip.$.tooltip).css({'display':'none'});
		}
		else {
			this.async(function(){
				$j(tooltip.$.tooltip).css({'display':'none'});
			}, 300);
		}
		$j('body').off('mousedown.tooltip');
		$j(window).off('resize.tooltip');
		$j(window).off('scroll.tooltip');
		if($M.workScape && $M.workScape.slider){
			$j($M.workScape.slider.$.container).off('scroll.tooltip');
		}
	},
	_addMouseDown: function(){
		var tooltip = this;
		this.closeHandler = $j('body').on('mousedown.tooltip', function(e){
			if(tooltip.element[0] !== e.target && !tooltip.element[0].contains( e.target )){
				tooltip.hide(true);
			}
		});
	},
	_positionTooltip : function(position){
		if(!position){
			return;
		}
		$j(this.$.tooltip).toggleClass('north',false);
		$j(this.$.tooltip).toggleClass('south',false);
		$j(this.$.tooltip).toggleClass('east',false);
		$j(this.$.tooltip).toggleClass('west',false);
		var left = 0;
		var top = 0;
		var element = this.element;
		//var elPosition = $j(element).offset();
		this.positionsAttempted++;
		switch(position){
			case 'north':
				top = this._getTop(element) - this.tooltipDim.h - this.arrowOffset - 5;
				left = (this.elementOffset.left + this.elementDim.w / 2) - (this.tooltipDim.w / 2);
				left -=(this.arrowOffset/4);
				$j(this.$.tooltip).toggleClass('north',true);
				break;
			case 'east':
				left = this.elementOffset.left + this.elementDim.w + this.arrowOffset;
				top = (this.elementOffset.top+(this.elementDim.h/2))-(this.tooltipDim.h/2);
				$j(this.$.tooltip).toggleClass('east',true);
				break;
			case 'west':
				left = this.elementOffset.left - this.tooltipDim.w - this.arrowOffset;
				top = (this.elementOffset.top+(this.elementDim.h/2))-(this.tooltipDim.h/2);
				left -=(this.arrowOffset/2);
				$j(this.$.tooltip).toggleClass('west',true);
				break;
			default:
				top = this._getTop(element) + this.elementDim.h + this.arrowOffset;
				left = (this.elementOffset.left + this.elementDim.w / 2) - (this.tooltipDim.w / 2);
				left -=(this.arrowOffset/4);
				$j(this.$.tooltip).toggleClass('south',true);
				break;
		}
		this.attemptedPosition = {'top':top,'left':left};
		this._ensureFit(position);
	},
	_ensureFit: function(position){
		if(this.positionsAttempted < 4){
			$j(this.$.pointer).css({'top':'','left':''});
			switch(position){
				case 'north':
					if(this.attemptedPosition.top<0){
						this._positionTooltip('east');
						return;
					}
					break;
				case 'east':
					if(this.attemptedPosition.left + this.tooltipDim.w > this.windowInfo.innerWidth){
						this._positionTooltip('south');
						return;
					}
					break;
				case 'south':
					if(this.attemptedPosition.top + this.tooltipDim.h > this.windowInfo.innerHeight){
						this._positionTooltip('west');
						return;
					}
					break;
				case 'west':
					if(this.attemptedPosition.left < 0){
						this._positionTooltip('north');
						return;
					}
					break;
			}
		}
		var newPosition = JSON.parse(JSON.stringify(this.attemptedPosition));
		var oldPosition = JSON.parse(JSON.stringify(this.attemptedPosition)); 
		
		if(this.attemptedPosition.top<0){
			newPosition.top = 5;
		}
		var diff = (this.attemptedPosition.top+this.tooltipDim.h - document.body.scrollTop) - window.innerHeight;
		if(diff>0){
			newPosition.top = newPosition.top - diff;
		}
		if(this.attemptedPosition.left<0){
			newPosition.left = 5;
		}
		diff = (this.attemptedPosition.left+this.tooltipDim.w - document.body.scrollLeft) - window.innerWidth;
		if(diff > 0 ){
			newPosition.left = newPosition.left - diff; 
		}
		
		
		if(newPosition.top !== oldPosition.top){ //adjusted top
			var adjustedTop = 0;
			if(newPosition.top > this.elementOffset.top){
				adjustedTop = newPosition.top - this.elementOffset.top + parseInt($j(this.$.tooltip).css('padding-top'));
			}
			else {
				adjustedTop = this.elementOffset.top - newPosition.top;
			}
			$j(this.$.pointer).css('top', adjustedTop + (this.elementDim.h / 4) +'px');
		}
		else if(newPosition.left !== oldPosition.left){ //adjusted left
			var adjustedLeft = 0;
			if(newPosition.left > this.elementOffset.left){
				adjustedLeft = newPosition.left - this.elementOffset.left + parseInt($j(this.$.tooltip).css('padding-left'));
			}
			else {
				adjustedLeft = this.elementOffset.left - newPosition.left;
			}
			$j(this.$.pointer).css('left', adjustedLeft + (this.elementDim.w / 4) +'px');
		}
		
		$j(this.$.tooltip).css({'top':newPosition.top+'px','left':newPosition.left+'px'});
	},
	_getTop: function(element){
		var mTop = 0;
		var marginTop = $j(element).css('margin-top');
		if(marginTop !== undefined && marginTop !== ''){
			mTop = parseInt(marginTop);
		}
    	return $j(element).offset().top + mTop; 
    },
    _getFullWidth: function(element){
    	var padding = 0;
    	var paddingLeft = $j(element).css('padding-left');
    	var paddingRight= $j(element).css('padding-right');
    	if(paddingLeft !== undefined && paddingLeft !== ''){
    		padding += parseInt(paddingLeft);
    	}
    	if(paddingRight !== undefined && paddingRight !== ''){
    		padding += parseInt(paddingRight);
    	}
    	return $j(element).width() + padding;
    },
    _getFullHeight: function(element){
    	var padding = 0;
    	var paddingTop = $j(element).css('padding-top');
    	var paddingBottom= $j(element).css('padding-bottom');
    	if(paddingTop !== undefined && paddingTop !== ''){
    		padding += parseInt(paddingTop);
    	}
    	if(paddingBottom !== undefined && paddingBottom !== ''){
    		padding += parseInt(paddingBottom);
    	}
    	return $j(element).height() + padding;
    },
    _tooltipMouseDown: function(e){
    	if(this.stopMouseDown){
    		e.stopPropagation();
    	}
    }
});