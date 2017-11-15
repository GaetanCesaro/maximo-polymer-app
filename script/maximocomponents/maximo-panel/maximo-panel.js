/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A panel component.
 */
Polymer({
	is: 'maximo-panel',
	behaviors: [BaseComponent, LoadingComponent, DragScrollComponent],
	properties: {
		label: {
			type: String,
			value: ''
		},
		height: {
			type: String,
			value: ''
		},
		width: {
			type: String,
			value: ''
		},
		headinginfo : {
			type: String,
			value: ''
		},
		count: {
			type: String,
			computed: '_fixCount(headinginfo)'
		},
		manualRefresh: {
			type: Boolean,
			value: false,
			notify: true
		},
		collections: {
			type: String,
			value : '',
			notify: true,
			observer: '_setCollections'
		},
		fullWidth: {
			type: Object,
			value: function(){
				return false;
			}
		},
		paging: {
			type: Boolean,
			value: function(){
				return true;
			}
		}
	},
	moveToHeader: ['maximo-searchbar','maximo-content-selector'],
	moveToFooter: ['maximo-data-page'],
	collectionList : [],
	created: function(){
		
	},
	ready: function(){
		$M.workScape.panels.push(this);
		if(!$j(this.$.internal).hasClass('auto')){
			if(this.width === parseInt(this.width)){
				this.width = this.width+'px';
			}
		}
		var ironLists = $j(this.$.internal).find('iron-list');
		if(ironLists.length>0){
			ironLists[0].scrollTarget = this.$.internal;
		}
		this.moveToHeader.forEach(function(tagName){
			var element = $j(this.$.internal).find(tagName);
			if(element[0]){
				element.css({'padding-top':'0px','padding-bottom':'0px'});
				Polymer.dom(this.$.additional).appendChild(element[0]);
			}
		}, this);


		this.moveToFooter.forEach(function(tagName){
			var element = $j(this.$.internal).find(tagName);
			if(element[0]){
				if(element[0].tagName === 'MAXIMO-DATA-PAGE'){
					this.dataPage = element[0];
					if(!element[0].collection){
						element[0].collection = this.dataHost.getLocalObject(this.collectionList[0]);
					}
				}
				element.css({'padding-top':'0px','padding-bottom':'0px'});
				if(element[0].collection && element[0].collection.tagName === 'MAXIMO-COLLECTION'){ 
					Polymer.dom(this.$.footer).appendChild(element[0]);
				}
			}
		}, this);
		
		if(this.paging && !this.dataPage && this.collectionList && this.collectionList.length>0){
			var collection = this.dataHost.getLocalObject(this.collectionList[0]);
			if(!collection || collection.tagName !== 'MAXIMO-COLLECTION'){
				collection = this.getGlobalObject(this.collectionList[0]);
			}
			if(collection && !collection.length){
				this.dataPage = Polymer.Base.create('maximo-data-page', {'id':this.id+'_dataPage','collection':collection});
				this.dataPage.panel = this;
				$j(this.dataPage).css({'padding-top':'0px','padding-bottom':'0px'});
				Polymer.dom(this.$.footer).appendChild(this.dataPage);
			}
		}
		this.dragScrollElement = this.$.internal;
	},
	attached: function(){
//		if(this.label === ''){
//			$j(this.$.panel).removeClass('border');
//		}
		this.fixLabel();
		if($M.touch){
			$j(this.$.buttons).find('.button').each(function(){
				$j(this).toggleClass('touch', true);
			});
		}
		var slider = $M.findElementParent(this, 'MAXIMO-SLIDER-CONTAINER');
		if(slider){
			this.slider = slider;
		}
	},
	fixLabel: function(instant){
		$j(this.$.title).width(0);
		var buttonWidth = $j(this.$.buttons).width();
		$j(this.$.title).css({'width':'calc(100% - '+buttonWidth+'px - 20px)'});
	},
	_fixCount: function(newValue){
		if(newValue!==''){
			return '('+newValue+')';
		}
		return '';
	},
	_setCollections: function(newValue){
		this.collectionList = newValue.length>0?newValue.split(','):null;
	},
	getWidthLimits: function(){
		if(!this.widthLimits){
			var hPadding = 0;
			if($j(this.$.wrapper)){
				hPadding = parseInt($j(this.$.wrapper).css('padding-left'))+parseInt($j(this.$.wrapper).css('padding-right')) + 
				parseInt($j(this.$.wrapper.firstElementChild).css('margin-left'))+parseInt($j(this.$.wrapper.firstElementChild).css('margin-right'));
			}
			var myMinWidth = parseInt(this.width?this.width:$M.workScape.minPanelWidth);
			this.widthLimits = { // in pixels
				'min': (window.innerWidth>myMinWidth?myMinWidth:window.innerWidth)+hPadding,
				'max': parseInt(this.maxWidth?this.width:$M.workScape.maxPanelWidth)
			};
		}
		return this.widthLimits;
	},
	resize: function(){
		this.fixLabel(true);
	},
	getInternalHeight: function(){
		//return the internal height based on full height - header and footer
		return $j(this.$.panel).height()-$j(this.$.header.firstElementChild).height() - $j(this.$.footer.firstElementChild).height();
	},
	refresh: function(){
		if(this.collectionList && this.collectionList.length>0){
			this.collectionList.forEach(function(collectionId){
				var collection = window[collectionId]; 
				if(collection.length){ //in case of duplicate IDs - TODO - this should come out after ID restrictions are resolved
					[].forEach.call(collection, function(child) {
						$j.proxy(child.refreshRecords(), child);					    
					});
				}
				else {
					$j.proxy(collection.refreshRecords(), collection);
				}
			});
		}
	},
	myToggleLoading: function(){
		//to override default
		return false;
	}
	
});