/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
  /*
Maximo chatbubble element. It works as a simple message box:

Example:
```html
    <maximo-chatbubble 
    		class="messageBubble" 
    		label="{{message}}" 
    		date="{{date}}" 
    		person-firstname="{{firstname}}" 
    		additional-info="Demo" 
    		person-image="{{image}}" 
    		direction="true/false" 
    		on-clickimage="_showPersonInfo">
    </maximo-chatbubble>
```

@demo
 */

Polymer({
	is: 'maximo-chatbubble',
	behaviors: [BaseComponent],
	properties: {
		/**
		 * Label that be shown in chat bubble
		 */		
		label: {
			type: String,
			value : ''
		},
		/**
		 * Direction of point on bubble. default value is right
		 */
		direction:{
			type: Boolean,
			value : false,
			notify: true,
			reflectToAttribute : true
		},
		/**
		 * Max width value for bubble. Width of bubble can not be longer than max width.
		 */
		maxwidth:{
			type: String,
			value : '200px'
		},
		/**
		 * Label for date. if value is empty, this label will not be displayed.
		 */
		date :{
			type: String,
			value: ''
		},
		/**
		 * Calculation method for date. simple or human
		 */
		datecal :{
			type: String,
			value : '',
			notify: true
		},
		/**
		 * Image path
		 */
		personImage :{
			type : String
		},
		/**
		 * First name of the person who wrote the message
		 */
		personFirstname : {
			type : String
		},
		/**
		 * Aditional information about the person
		 */
		additionalInfo : {
			type : Object
		}
	},
	created: function(){
	},
	ready: function(){
		//this.children[0].style.maxWidth = this.maxwidth;
	},
	attached: function(){
	},
	refresh: function(){
	},
	getCommentDate : function(date){
		if(this.getAttribute('datecal')==='simple'){
			return this.calculateDate(date);
		}
		else{
			return this.calHumanreadableDate(date);
		}
	},
	calculateDate : function(date){
		var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
		                  'July', 'August', 'September', 'October', 'November', 'December'];
		
		var temp = Date.parse(date);
		var completionDate = new Date(temp);
		var month = monthNames[completionDate.getMonth()];
		var day = completionDate.getDate();
		var year = completionDate.getFullYear();
		return month+' '+day+' '+year;
	},
	
	calHumanreadableDate : function(date){
		var difference = '';
		var oneMinute=1000*60;
		var oneHour=oneMinute*60;
		var oneDay=oneHour*24;
		var oneMonth=oneDay*30;
		var oneYear = oneDay*365;
		
		if (date) {
			var msecs = Date.parse(date);
			var completionDate = new Date(msecs);
			var nowDate = new Date();
			
			var msecsDiff = nowDate.getTime() - completionDate.getTime();
			var value = 1;
			if(msecsDiff >= oneYear){
				return this.calculateDate(date);
			}
			else if (msecsDiff >= oneMonth) {
				value = Math.round(msecsDiff/oneMonth);
				difference = value.toString() + ' ' + this.localize('uitext', 'mxapibase', 'month' + (value > 1 ? 's' : ''));
			}
			else if (msecsDiff >= oneDay) {
				value = Math.round(msecsDiff/oneDay);
				difference = value.toString() +  ' ' + this.localize('uitext', 'mxapibase', 'day' + (value > 1 ? 's' : ''));
			}else if (msecsDiff >= oneHour){
				value = Math.round(msecsDiff/oneHour);
				difference = value.toString() +  ' ' + this.localize('uitext', 'mxapibase', 'hour' + (value > 1 ? 's' : ''));
			}else if (msecsDiff >= oneMinute) {
				value = Math.round(msecsDiff/oneMinute);
				difference = value.toString()  + ' ' + this.localize('uitext', 'mxapibase', 'minute' + (value > 1 ? 's' : ''));
			}else {
				value = 1;
				difference =  this.localize('uitext', 'mxapibase', 'now');
				return difference;
			}
		}
		
		return difference+' '+this.localize('uitext', 'mxapibase', 'ago');
	},
	_imgClicked : function(e) {
		this.fire('clickimage', e.detail);
	}
	/*getLeftDirection : function(){
		if(this.direction === 'right'){
			return false;
		}
		else{
			return true;
		}
	},
	getRightDirection : function(){
		if(this.direction === 'right'){
			return true;
		}
		else{
			return false;
		}
	}*/
});