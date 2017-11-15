/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-content-selector>` element. A swipe-able group of tablike links that allow changing of content on screen or firing of events to do most anything. 

Example:
```html
	<maximo-content-selector id="CS1">
		<maximo-label id="CS1_a" intvalue="all" on-tap="_tapped" label="Label A"></maximo-label>
		<maximo-label id="CS1_b" intvalue="all" on-tap="_tapped" label="Label B"></maximo-label>
	</maximo-content-selector>
```

### Accessibility
&#8593; or &#8592; Highlight previous selector(wraps to beginning)<br>
&#8595; or &#8594; Highlight next selector(wraps to end)
ENTER Choose currently focused selector

@demo
*/
Polymer({
	is: 'maximo-content-selector',
  	behaviors: [BaseComponent, DragScrollComponent,ArrowKeys],
	properties : {
		defaultIndex: {
			type: Number,
			value: 0
		},
		_arrowKeyInfo: {
			type: Object,
			value: function(){
				return {'selector':'maximo-label'};
			}
		},
		selectorType: {
			type: String,
			value: '',
			notify: true
		},
		light: {
			type: Boolean,
			value: false
		}
	},
	_addScrollHandler: function(){
		if(!this.scrollHandler){
			var selector = this;
	  		this.scrollHandler = $j(this.$.inner).on('scroll', function(){
				selector.scrollTimer = setTimeout(function(){
					selector._fixArrows();
				}, 350);
			});
		}
	},
	_removeScrollHandler: function(){
		$j(this.$.inner).off('scroll');
		this.scrollHandler = null;
	},
	ready: function(){
		this.dragScrollElement = this.$.inner;
	},
  	attached: function(){
  		if(!this.localInitialized){
  			this.localInitialized = true;
	  		$j(this.$.outerdiv).find('*').each(function(i,child){
	  			$j(child).attr({'ws-swipe':'false'});
	  		});
	  		var selector = this;
	  		this.position = 0;
	  		$j(window).on('resize', function(){
				if(selector.resizeTimer){
					window.clearTimeout(selector.resizeTimer);
				}
				selector.resizeTimer = setTimeout(function(){
	  				selector._fixArrows();
				}, 350);
			});
	  		var over = function (e) {
	  			selector._overTap.apply(selector, [e]);
	  		};

	  		var out = function (e) {
	  			$j(e.currentTarget).toggleClass('hover',false);
	  			if(selector.overTimeout){
	  				clearInterval(selector.overTimeout);
	  			}
	  			return false;
	  		};
	  		
	  		//hover
	  		if(!$M.touch){
	  			$j(this.$.west).mouseenter(over).mouseout(out);
	  			$j(this.$.east).mouseenter(over).mouseout(out);
	  		}
	  		var sbWidth = window.getScrollbarWidth()+3;
			$j(this.$.inner).css({'padding-right':this.length*10+'px','margin-bottom':-sbWidth+'px'});
			var observer = new MutationObserver(function(mutations) {
				selector._setupLabels();
			});
			observer.observe(this.$.inner, { childList: true });
			this.async(function(){
				selector._setupLabels();
	  			selector._fixArrows();
	  			selector.select(selector.defaultIndex);
	  		}, 300);
  		}
  		
	},
	_setupLabels: function(){
  		var labels = $j(this.$.outerdiv).find('maximo-label');
  		var selector = this;
  		labels.each(function(index, label){
  			label.onTap = function(){
  				selector.select(index);
  			};
  			label.listen(label, 'tap', 'onTap');
  			label.title = label.label;
			$j(label).attr({'tabindex':(index===0)?'0':'-1','role':'tab'});
			$j(label).on('keyup', function(e){
				selector._arrowKeyHandler(e);
			});
			$j(label).on('keypress', function(e){
				if(e.keyCode===$M.keyCode.ENTER){
					$j(this).trigger('click');
				}
			});
  		});
  		selector.length = labels.length;
  		selector.lastLabel = labels[labels.length-1];
	},
	_overTap: function(e){
		if(e && e.currentTarget){
			var dir = $j(e.currentTarget).hasClass('west')?-1:1;
			if(e.type==='mouseenter'){
				var selector = this;
	  			this.overTimeout = setInterval(function(){
	  				$j(e.currentTarget).toggleClass('hover',true);
	  				selector._scrollBy(dir);
	  			}, 300);
			}
			else {
				this._scrollBy(dir);
			}
		}
		return false;
	},
	_ensureWidth: function(){
		var dialog = $M.findElementParent(this.$.outerdiv, 'MAXIMO-DIALOG');
		$j(this.$.inner).css({'display':'none'});
		var width = dialog?dialog.getInnerWidth():window.innerWidth;
		if($M.screenInfo.size==='small' && $j(this.$.outerdiv).position().left + this.$.outerdiv.offsetWidth > width){
			$j(this.$.inner).css({'width':width+'px','display':'block'});
			return;
		}
		$j(this.$.inner).css({'width':'auto','display':'block'});
	},
	_fixArrows: function(){
		this._ensureWidth();
  		if(this.$.inner.scrollWidth > this.$.inner.offsetWidth){
	  		var left = parseInt(this.$.inner.scrollLeft);
	  		if(left===0){
	  			$j(this.$.west).width('0');
	  		}
	  		else {
	  			if($j(this.$.west).width()===0){
	  				$j(this.$.west).width('24');
	  			}
	  		}
	  		$j(this.$.east).width('0');
	  		var lastLabelRight = this.lastLabel.offsetLeft + this.lastLabel.offsetWidth;
	  		if(lastLabelRight - this.$.inner.scrollLeft > this.$.inner.offsetWidth + 10){
	  			$j(this.$.east).width('24');
	  		}
  		}
  		else {
	  		$j(this.$.west).width('0');
			$j(this.$.east).width('0');
  		}
  	},
  	_scrollBy: function(by, time){
  		this.position += by;
  		if(this.position<0){
  			this.position = 0;
  		}
  		if(this.position >= this.length){
  			this.position = this.length-1;
  		}
  		if(this.position === 0){
  			this.$.inner.scrollLeft = 0;
  			this._fixArrows();
  			return;
  		}
  		if(!time){
  			time = 300;
  		}
  		this.labelToShow = $j(this.$.outerdiv).find('maximo-label')[this.position];
  		if(this.labelToShow){
  			var selector = this;
  			var scrollPos = this.labelToShow.$.label.offsetLeft + $j(this.$.west).width();
  			$j(this.$.inner).animate({
                scrollLeft: scrollPos
            }, time, function() {
            	selector._fixArrows();
            });
  		}
  	},
//  	adjustScroll: function(){
//  		var pos = 0;
//  		var scrollLeft = this.$.inner.scrollLeft;
//  		$j(this.$.outerdiv).find('maximo-label').each(function(index, label){
//			var leftPos = label.$.label.offsetLeft;
//			if(scrollLeft >= leftPos){
//				pos = index;
//			}
//		});
//  		this.position = pos;
//  		this._scrollBy(0, 10);
//  	},
  	/** select one of the selectors by index or event */
  	select: function(eventOrIndex){
  		if(this.selectorType === 'tab'){
  			$j(this.$.outerdiv).toggleClass('isTab',true);
  		}
		$j(this.$.outerdiv).find('maximo-label').each(function(index){
			var current = (typeof eventOrIndex === 'object')?this === eventOrIndex.currentTarget:index===eventOrIndex;
			if($j(this).attr('selector-type') === 'tab'){
				$j(this.$.label).toggleClass('isTab',true);
				$j(this.$.label).toggleClass('isTabCurrentChoice',current);
			}else{
				$j(this.$.label).toggleClass('currentChoice',current);
			}
			$j(this).attr({'tabindex':current?'0':'-1','aria-selected':current+'','role':'tab'});
		});

		var lists = $j(this.parentNode).find('iron-list');
		lists.each(function(index){
			lists[index].fire('iron-resize');
		});
		this.fire('maximo-content-selector-changed', this);
	},
	_getLight: function(light){
		return light? ' light':'';
	}
});