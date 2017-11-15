/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
This element maintains a dual bound page number and supports moving backwards and forwards
*/
Polymer({
	is: 'maximo-simple-paginator',
  	behaviors: [BaseComponent],
	properties : {

		/**
		 * The current page number. Required.
		 */
		pageNum:{
			type: Number,
			notify: true
		},

		/**
		 * Total number of pages. Required.
		 */
		totalPages:{
			type: Number,
			notify: true
		},

		/**
		 * Returns true if we are on the first page
		 */
		isFirstPage:{
			type: Boolean,
			computed: '_isFirstPage(pageNum,totalPages)'
		},

		/**
		 * returns true if the are on the last page
		 */
		isLastPage:{
			type: Boolean,
			computed: '_isLastPage(pageNum,totalPages)'
		},

		getPageNum:{
			type: Number,
			computed: '_calculatePageNum(pageNum,totalPages)'
		}

	},

	_isFirstPage: function(pageNum,totalPages){
			return pageNum === 1;
	},

	_isLastPage: function(pageNum,totalPages){
			var calcPageNum = this._calculatePageNum(pageNum,totalPages);
			return calcPageNum === totalPages;
	},

	/**
	 *	For the case where no records are returned, the pagenum is still shown as 1, 
	 *  while the totalPages is 0. In this case, we need to output the pagenum as 0.
	 */
	_calculatePageNum: function(pageNum,totalPages){
		return totalPages === 0 ? 0 : pageNum;
	},

	/**
	 * Fire an event to indicate we want the previous page
	 */
	previousPage: function(){
		if(this.pageNum - 1 > 0){
			this.fire('maximo-simple-paginator-previous-page');
		}
	},

	/**
	 * Fire an event indicating we want the next page
	 */
	nextPage: function(){
		if(this.pageNum < this.totalPages){
			this.fire('maximo-simple-paginator-next-page');
		}
	}
});
