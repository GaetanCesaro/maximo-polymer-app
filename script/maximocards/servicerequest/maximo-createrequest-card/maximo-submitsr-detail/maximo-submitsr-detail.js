/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-detail',
  	behaviors: [BaseComponent],
    properties: {
		label: {
			type: String,
			value: 'Panel'
		},
		icon: {
			type: String,
			value: 'title'
		},		
		title: {
			type: String,
			value: 'title'
		},
		selectedDetailPage: {
    		type: Number,
    		value: 0,
    		notify: true    	
    	},
		srHref: {
			type: String,
			notify: true
		}
	},
	listeners:{
		'go-back' : 'goBack'
	},
	ready: function()
	{
	},
	initPage: function() {
		this.selectedDetailPage = 0;
		var childPages = this.$.detailPages.children;
		
		for (var i = 0; i < childPages.length; i++) {
			childPages[i].initPage();
		}
		this._skipComment = false;
	},
	goBack: function() {
		var checkPage = this.selectedDetailPage - 1;
		
		if (checkPage < 0 || (checkPage === 0 && this._submitInfo.Issue && this._submitInfo.Issue.contents && this._submitInfo.Issue.contents.templateid)) {
			this.selectedDetailPage = 0;
			// parent page
			return 1;
		}
		else if (checkPage === 1 && this._skipComment) {
			checkPage = 0;
		}
		this.selectedDetailPage = checkPage;
		console.log('selectedDetailPagee:'+this.selectedDetailPage);
		
		this.renderPage(this._submitInfo, this._stackData);
	},
	_nextDetailStep : function(e) {
		if (e.detail) {
			this.fire('submit-info', e.detail);
			
		}
		if (e.detail.nextStep) {
			this.$.detailPages.select(e.detail.nextStep);
			this.renderPage(this._submitInfo, this._stackData);
		}
		else {
			var checkPage = this.selectedDetailPage + 1;
			if (checkPage >= this.$.detailPages.children.length) {
				this.fire('go-next');
			} else {
				this.selectedDetailPage = checkPage;
				this.renderPage(this._submitInfo, this._stackData);
			}
		}
	},
	renderPage: function(submitInfo, stackData) {
		this._submitInfo = submitInfo;
		this._stackData = stackData;
		if (this.selectedDetailPage === 0) {
			if (submitInfo.Issue && submitInfo.Issue.contents && submitInfo.Issue.contents.templateid) {
				this.selectedDetailPage = 1;
			} else {
				this._skipComment = true;
			}
		}

		this.$.detailPages.children[this.selectedDetailPage].renderPage(submitInfo, stackData);
  	}	
});
