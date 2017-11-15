/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A component for displaying message about no records.
 */
Polymer({
	is : 'maximo-norecordfound',
	/**
	 * @polymerBehavior 
	 */
	behaviors : [ BaseComponent],
	properties : {
		totalCount: {
			type: Number,
			value: 0,
			notify: true
		},
		collection: {
			type: Object,
			value : null,
			notify: true
		},
		message:{
			type: String,
			value : 'No records were found',
			notify: true
		},
		showMessage: {
			type: Boolean,
			value: false,
			notify:true
		}
	},
	listeners: {
        'collection-refreshed': 'checkCollection'
     },
	ready : function() {
	},
	attached: function(){
		if(this.collection){
			this.collection.addComponentListener(this);
			this.totalCount = this.collection.__data__.totalCount;
		} else {
			this.totalCount = 0;
		}
	},
	checkCollection: function(){
		this.totalCount = this.collection.__data__.totalCount;
		$j(this.$.norecordid).css({'display':(this.totalCount===0)?'block':'none','padding-top':25+'px'});
	}
	
});