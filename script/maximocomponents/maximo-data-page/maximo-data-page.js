/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-data-page>` element. Can be placed within a panel and will allow paging through data set.

Example:

    <maximo-data-page id="data-page1" collection="{{data}}" total-pages="" page-num="" total-count=""></maximo-data-page>

@demo
*/

Polymer({
	is : 'maximo-data-page',
	/**
	 * @polymerBehavior 
	 */
	behaviors : [ BaseComponent],
	properties : {
		pageNum: { //do we need this or can the collection maintain it
			type: Number,
			value: 0,
			notify: true,
			observer: 'changePage'
		},
		totalPages: { //do we need this or can the collection maintain it
			type: Number,
			value: 0,
			notify: true
		},
		collection: {
			type: Object,
			value : null,
			notify: true
		}
	},
	listeners: {
        'collection-refreshed': 'checkCollection'
     },
	ready : function() {
	},
  	blur: function(blur){
		$j(this).parent().toggleClass('song2',blur);
  	},
	toggleHide: function(){
		var hasPrev = this.collection.hasPreviousPage();
		var hasNext = this.collection.hasNextPage();
		var hide = !hasPrev && !hasNext;
		if(hide && this.panel){
			var height = $j(this.$.pages).height();
			$j(this.panel.$.internal).height(this.panel.getInternalHeight() + height);
		}
		$j(this.$.west).toggleClass('disabled',!hasPrev);
		$j(this.$.east).toggleClass('disabled',!hasNext);
		this.async(function(){
			$j(this.$.pages).css({'display':hide?'none':''});
		}, 100);

	},
	attached: function(){
		if(this.collection){
			this.collection.addComponentListener(this);
			this.pageNum = this.collection.pageNum+1;
		}
		this.pageNum = this.pageNum;
		this.toggleHide();
	},
	nextPage: function(){
		if(this.collection.hasNextPage()){
			this.blur(true);
			this.collection.pageForward();
		}
	},
	previousPage: function(){
		if(this.collection.hasPreviousPage()){
			this.blur(true);
			this.collection.pagePrevious();			
		}
	},
	changePage: function(newValue){
		if(!this.collection || !this.collection.collectionData || newValue <= 0){
			return;
		}
		this.async(function(){
			this.toggleHide();
			this.blur(false);
		}, 200);
	},
	onLastPage: function(){
		if(this.collection && this.collection.totalPages){
			return this.collection.pageNum >= this.collection.totalPages;
		}
		return true;
	},
	checkCollection: function(){
		this.pageNum = this.collection.pageNum;
		this.totalPages = this.collection.totalPages;
		
		if(this.collection.pageSize<this.collection.totalCount && (this.totalPages && this.totalPages>0)){
			$j(this.$.pages).css({'display':'block'});
		} else {
			$j(this.$.pages).css({'display':'none'});
		}
		
		
	}
});