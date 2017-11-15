/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*

The maximo dialog is a function that can be used/activated through a button or even any event that calls this function.

Example:
```javascript
	showDialogFunction: function(e){
		$M.showDialog(this, this._dataset, $M.localize('type','app','msgIDstring'), 'maximo-dialogfilename', false);
	}
```
This can also be done without a localize function.

Example:
```javascript
	showTestDialog: function(){
  		$M.showDialog(null, 'test_dialog'+$M.dialogs.stack.length, 'Test Dialog '+$M.dialogs.stack.length, 'dialogHtmlFile', false, null);
  	}
```

The size of the dialog and the font style of it can be changed directly in the css linked with the html(index) file.
The dialog works like any other page, but any function or event used inside the dialog will end as soon as it is closed. So if you desire to take any action after its closure, be sure to call an "onclose" in order for it to work.

Example:
```javascript
_createNewDataSet: function(){
		this.container.close();	
		this.container.onclose = $M._changeWorkCenter('datasetfilename');
	}
```

@demo

*/

Polymer({
	is: 'maximo-dialog',
  	behaviors: [DynamicComponent,BaseComponent,UndoBehavior],
	properties : {
		title : {
			type : String
		},
		record : {
			type: Object,
			notify: true
		},
		recordData: {
			type: Object,
			notify: true		
   		},
   		recordIndex: {
   			type: Number,
   			value : 0
   		},
		content : {
			type : String,
			value: ''
		},
		contentObject : {
			type : Object,
			value : function(){
				return null;
			}
		},
		fullSize : {
			type : Boolean,
			value : false
		},
		scoped : {
			type: Boolean,
			value : true
		},
		cancelCallback: {
			type: Object
		},
		_canceled: {
			type: Boolean,
			value: true
		},
		_showing: {
			type: Boolean,
			default: false
		}
	},
	makeFullSize: function(){
			var height = $j(window).innerHeight();
			var headerHeight = $M.screenInfo.size==='small'?0:this.headerHeight;
			$j(this.$.dialog).css({'width':'100vw','max-width':'100vw','position':'absolute'});
			$j(this.$.border).css({'border-width':'0px'});
			var adjustOffset = ($M.workScape && $M.workScape.$.content.contains(this));
			$j(this.$.dialog).parent().css({'border':'0px'});
			if(adjustOffset){
				$j(this.$.wrapper).css({'top':headerHeight+'px'});
				$j(this.$.dialog).css({'height':'calc(100vh - '+headerHeight+'px'});
			}
			else {
				if($M.screenInfo.size==='small'){
					$j(this.$.wrapper).css({'top':-this.headerHeight+'px'});
				}
				else {
					$j(this.$.wrapper).css({'top':this.headerHeight+'px'});
				}
				$j(this.$.dialog).css({'height':'100vh'});
			}
			$j(this.$.dialog).toggleClass('fullSize', true);
	  		$j(this.$.title).css({'max-width':'auto'});
			$j(this.$.header).css({'text-align':'center'});
	  		
	  		$j(this.$.underlay).css({'margin-left':'0px','margin-top':'0px'});
			this.hiddenLeftMargin = window.innerWidth;
			if(adjustOffset){
				this.hiddenLeftMargin = parseInt($j(this.parentElement).offset().left) + window.innerWidth;
			}
	  		if(!this._showing){
	  			$j(this.$.wrapper).css({'border':'0px','margin-left':-this.hiddenLeftMargin+'px','transition': 'margin-left .3s, opacity .6s'});
	  		}
			
			this.async(function(){
				$j(this.$.dialog).css({'border-width':'0px'});
				$j(this.$.title).css({'max-width':($j(window).innerWidth()-$j(this.$.title).offset().left)+'px'});
				if($M.workScape && $M.workScape.$.content.contains(this)){
					height = height - this.headerHeight
				}
				$j(this.$.internal).css({'height':height-$j(this.$.header).height()-$j(this.$.footerRow).height()+'px','box-sizing':'border-box'});
		  		var offset = $j(this.$.underlay).offset();
		  		$j(this.$.underlay).css({'margin-left':-offset.left+'px','margin-top':-offset.top+'px'});
	  			leftMargin = 0;
	  			if(adjustOffset){
	  				leftMargin = -parseInt($j(this.parentElement).offset().left); 
	  			}
	  			$j(this.$.wrapper).css({'opacity':'1','margin-left':leftMargin+'px','transition':'margin-left 0s'});
				this._showing = true;
			}, 300);
	},
	created: function(){
	},
  	attached: function(){
  		try {
			this.headerHeight = 0;
  			if($M.workScape){
  				this.headerHeight = $M.workScape.getHeaderHeight();
  				$M.workScape.disableHeaderAndFooter(true);
  			}
  			if($M.screenInfo.size==='small'){
  				this.fullSize = 2;
  			}
  			if(this.fullSize === 2){
  				$M.overlayDialogs.push(this); 
  			}
	  		var dialogCount = $M.dialogCount();
	  		var jInternal = $j(this.$.internal);
	  		//center first
	  		var jDialogWrapper = $j(this.$.wrapper);
	  		var jDialog = $j(this.$.dialog);
	  		var zIndex = 2000+(dialogCount*2);
	  		if(!this.fullSize){
	  			jDialogWrapper.css({'opacity':'0','transform':'scale(.01)'});
	  		}
			jDialogWrapper.css({'z-index':zIndex+1});
	  		$j(this.$.underlay).css({'z-index':zIndex,'top':$j('body').scrollTop()+'px','position':'absolute'});
	  		var offset = $j(this.$.underlay).offset();
	  		$j(this.$.underlay).css({'margin-left':-offset.left+'px','margin-top':-offset.top+'px'});
	  		var my = this;
	  		this.async(function(){
		  		if(my.contentObject){
		  			my.placeHolder = my.contentObject.parentNode;
		  			my.contentObject.container = my;
		  			if(my.contentObject.parent){
		  				Polymer.dom(my.$.internal).appendChild(my.contentObject);
		  			}
		  			else {
		  				$j(my.$.internal).append(my.contentObject);
		  			}
		  			if(my.contentObject){
		  				$j(my.contentObject).removeAttr('hidden');
		  			}
			  		if(my.contentObject && my.contentObject.$ && my.contentObject.$.footer){
			  			Polymer.dom(my.$.footer.parentNode).replaceChild(my.contentObject.$.footer,my.$.footer);
			  		}
			  		else {
			  			if(my.$.footer && my.$.footer.firstElementChild &&  my.$.footer.firstElementChild.childElementCount > 0){
			  				$j(my.$.footerRow).show();
			  			}
			  			else {
			  				$j(my.$.footerRow).hide();
			  				$j(my.$.internal).css({'padding-bottom':'10px'});
			  			}
			  		}
			  		$j(my.contentObject).show();
		  		}
		  		else {
		  			jInternal.html(my.content);
		  		}
		  		this.async(function(){
			  		if(!this.fullSize) {
			  			var top = this.owner?0:(($j('body').scrollTop() + ($j('body').height()/2))-(jDialog.height()/2) - 100);
			  			if(top<50){
			  				top = 50;
			  			}
			  			if(top-$j('body').scrollTop()<0){
			  				top = $j('body').scrollTop();
			  			}
			  			jDialogWrapper.css({'top':top+'px'});
			  		}
			  		if(!this.fullSize){
			  			jDialogWrapper.css({'padding':'0px'});
			  		}
			  		if(this.fullSize || jDialog.width() > $j('body').width()){
			  			jDialogWrapper.css({'width':'100%'});
			  			jDialog.css({'width':'100%'});
			  		}
			  		else if(!this.owner){
			  			jDialogWrapper.css({'left':($j('body').width()/2)-(jDialog.width()/2)+'px'});
			  		}
		  		}, 100);
				this.async(function(){
					$M.underlays.push(my.$.underlay);
					$M.fixUnderlays();
			  		$M.toggleWait(false);
			  		if(!this.fullSize){
			  			jDialogWrapper.css({'transition': 'all .2s','transform':'scale(1)','opacity':'1'});
			  		}
					jDialog.focus();
			  		$M.dialogs.stack.push(my.id);
			  		$M.dialogs.map[my.id] = my; 
		  			window[my.id]=my;
		  			if(my.contentObject && my.contentObject.id){
		  				window[my.contentObject.id] = my.contentObject;	
		  			}
					
		  			$j(this.$.dialogBackButton).css({'display':this.fullSize===2 || $M.screenInfo.size==='small'?'inline-block':'none'});
		  			$j(this.$.dialogCloseButton).css({'display':this.fullSize===2 || $M.screenInfo.size==='small'?'none':'inline-block'});
		  			$j(this.$.dialogCloseButton).attr('id', this.buildId($j(this.$.dialogCloseButton).attr('id')));
		  			$j(this.$.title).css({'text-align':$M.screenInfo.size==='small'?'center':'initial'});
					
		  			my.ensureFit();
					my.bindEvent(window, 'resize' ,function(){
			  			my.ensureFit();
			  		});
					if(!my.fullSize){
						my.bindEvent(my.$.internal, 'DOMSubtreeModified' ,function(){
				  			if(my.domTimer){
				  				window.clearTimeout(my.domTimer);
				  			}
				  			my.domTimer = setTimeout(function(){
				  				my.ensureFit();
				  			}, 320);
				  		});
					}
					this.async(function(){
						if(my.focusElement){
							my.focusElement.focus();	
						}
						else {
							my.$.internal.focus();
						}
						jDialog.attr('aria-label',this.title);
						$j(this.$.title).attr('title',this.title);
						var wrapper = $j(my.$.wrapper);
						var observe = function(){
							my.mutationObserver.observe(my.$.internal, { subtree: true, attributes: true, childList: true, characterData: true });
						};
						my.mutationObserver = new MutationObserver(function(mutations) {
							my.mutationObserver.disconnect();
							var top = wrapper.position().top;
							var height = wrapper[0].offsetHeight;
							if(top+height > window.innerHeight){
								my.ensureFit();
							}
							window.setTimeout(function(){
								var top = wrapper.position().top;
								var height = wrapper[0].offsetHeight;
								if(top+height > window.innerHeight){
									my.ensureFit();
								}
								observe();
							}, 300);
						});
						observe();
					}, 200);
				}, 200);
	  		});
  		}
  		catch(error){
  			this.closeMe();
			throw error;			  			
  		}
 	},
 	cancel: function(){
 		this.close(true);
 	},
  	ensureFit: function(){
  		if(this.fullSize){
  			this.makeFullSize();
  			return;
  		}
  		if(this.$.internal.scrollHeight > this.$.internal.clientHeight)
  		{
  			return;
  		}
  		var fullHeight;
  		fullHeight= ($M.workScape?$M.workScape.getHeight():window.innerHeight)-($j(this.$.header).height()+$j(this.$.footerRow).height());
  		//TODO - make sure dialog is on screen (top,left, bottom, right). If not scale/move so it is.
  		$j(this.$.dialog).css({'height':''});
  		$j(this.$.internal.parentNode).css({'height':'auto','max-height':fullHeight+'px','box-sizing':'border-box'});
  		var position = {'top': parseInt($j(this.$.wrapper).css('top')),'left': parseInt($j(this.$.wrapper).css('left'))};
  		var left = this.owner?0:((window.innerWidth/2) - ($j(this.$.dialog).width()/2));
  		if(left<30){
  			left = left / 2;
  			$j(this.$.wrapper).css({'margin':'0px 10px 0px 5px'});
  		}
  		$j(this.$.wrapper).css({'left':left+'px'});
  		var xDiff = (position.left + $j(this.$.dialog).width()) - window.innerWidth;
  		if(xDiff > 0){
  			$j(this.$.wrapper).css({'left':position.left-(xDiff+20)+'px'});
  		}
  		
  		if(($j(this.$.internal.parentNode).height() + position.top) > fullHeight){
  			$j(this.$.internal.parentNode).css({'height':(fullHeight-position.top)+'px','box-sizing':'border-box'});
  		}
		//$j(this.$.title).css({'max-width':$j(this.$.title.parentNode).width()-30+'px'});
  	},
  	close : function(canceled){
  		this._canceled = canceled;
		UndoBehavior.close.call(this);
  	},
  	closeMe : function(caller){ //do not call directly
  		if(caller && !UndoBehavior.canClose.call(this, caller)){
  			return;
  		}
  		this.destroy();
  		var closeId = $M.dialogs.stack.pop();
  		var dialog = $M.dialogs.map[closeId];
  		if(dialog && dialog.fullSize === 2 ){
  			$M.overlayDialogs.pop();
  		}
  		$M.underlays.pop();
  		$M.fixUnderlays();
		delete $M.dialogs.map[closeId];
		var my = this;
		this.async(function(){
			if(my.placeHolder){
				my.placeHolder.appendChild(my.contentObject);
				if($j(my.contentObject).attr('data-hideme')==='true'){
					$j(my.contentObject).attr({'hidden':'true'});
				}
			}
			if(this.fullSize){
				$j(this.$.wrapper).css({'transition':'margin-left .3s', 'margin-left':-this.hiddenLeftMargin+'px'});
			}
			else {
				$j(this.$.wrapper).css({'transform':'scale(.01)','opacity':'0'});
			}
			if(this._canceled && this.cancelCallback){
				this.cancelCallback.apply(caller);
			}
			if($M.debug){
				console.log('dialog '+ (this._canceled?'':'NOT ')+'canceled');
			}
			this.async(function(){
				this._showing = false;
				$j(my).remove(); //removes all children, including the underlay
				delete window[my.id];
				if(my.contentObject && my.contentObject.id){
	  				delete window[my.contentObject.id];	
	  			}
	  			if(this.fullSize){
	  				my.contentObject.setAttribute('layout','default');
	  			}
		  		if($M.dialogs.stack.length===0 && $M.workScape){
		  			$M.workScape.disableHeaderAndFooter(false);
		  		}
				if($M.dialogCount()===0){
					$M.toggleScroll(true);
				}
		  		$M.toggleWait(false);
			}, 300);
		});
  	},
  	getInnerWidth: function(){
  		return $j(this.$.internal).width() - parseInt($j(this.$.internal).css('padding-left'))- parseInt($j(this.$.internal).css('padding-right'));
  	},
  	_stopTap: function(e) { 
  		e.stopPropagation(); 
  	}
});