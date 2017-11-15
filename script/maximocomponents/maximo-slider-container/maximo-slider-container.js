/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
	is: 'maximo-slider-container',
  	behaviors: [BaseComponent, DragScrollComponent],
	properties : {
		height: {
			type: String,
			value: '100px'
		},
		flex: {
			type: Object,
			notify: true,
			value: function(){
				return false;
			}
		},
		center: {
			type: Object,
			notify: true,
			value: function(){
				return false;
			}
		}
	},
  	created : function(){

  	},
  	ready : function(){
  		this.dragScrollElement = this.$.container;
  	},
  	attached: function(){
  		var slider = this;
		if(this.center){
			$j(this.$.container).toggleClass('flex-center-justified', true);
		}
		slider.bindEvent(slider.$.container, 'DOMSubtreeModified' ,function(e){
			if(slider.changeTimer){
  				window.clearTimeout(slider.changeTimer);
  			}
  			slider.changeTimer = setTimeout(function(){
  				slider.ensureFit();
  			}, 400);
  		});
		slider.bindEvent(window, 'resize' ,function(){
  			if(slider.resizeTimer){
  				window.clearTimeout(slider.resizeTimer);
  			}
  			slider.resizeTimer = setTimeout(function(){
  				slider.ensureFit();
  			}, 400);
  		});

  	},
  	showSlideMarkers: function(){
  		var show = this.$.container.scrollWidth > this.$.container.offsetWidth;
		$j(this.$.scrollFooter).css({'display':show?'block':'none'});
		$j(this.$.container).toggleClass('flex-center-justified', !show);
  	},
  	ensureFit: function(){
  		var count = 0;
  		if(!$j(this.$.container).hasClass('carousel')){
  			$j(this.$.container).css({'overflow-y':'hidden'});
  		}
  		$j(this.$.container).children().each(function(){
  			if(this.tagName.indexOf('INDICATOR') > -1 || 
  					this.tagName.indexOf('CARD') > -1){
  				count++;
  			}
  		});
		$j(this.$.container).css({'width':'100%'});
		if(this.flex){
	  		var width = 100 / count + '%;';
	  		$j(this.$.container).children().each(function(){
	  			if(this.tagName.indexOf('INDICATOR') > -1 || 
	  					this.tagName.indexOf('CARD') > -1){
	  				$j(this).attr('style','width:'+width);
	  				$j(this.firstElementChild).css({'width':''});
	  			}
	  		});
		}
		if($M.workScape.slider && !$M.workScape.panelScroll && this === $M.workScape.topSlider){
			$M.workScape.fixCarouselAndPanels();
		}
  	}
});