/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-servicemanager-srdetail-card',
  	behaviors: [BaseComponent],
    properties: {
		record : {
			type: Object,
			notify: true,
		},
   		label : {
   			type: String,
   			value : function(){
   				return $M.localize('Service Request Detail');
   			}
   		}
	},

	ready : function (){	
	},
	splitLine : function() {
		if(this.record.description_longdescription!=null){
			var strVal = this.record.description_longdescription;
			var lines = strVal.split('\n');

			//convert content to HTML 
			var resultString  = '<p>';
			for (var i = 0; i < lines.length; i++) {
			    resultString += lines[i] + '<br>';
			}
			resultString += '</p>';
			return resultString;
		}
		return null;
	},
	/**
	 * show reportedPriority
	 */
	showPriority : function(){
		var priority = this.record.reportedpriority;
		var priorityName;

		switch (priority) {
		  case 3    : priorityName = 'Medium';
		              break;
		  case 2    : priorityName = 'High';
		              break;
		  case 1    : priorityName = 'Urgent';      
                      break;
		  default   : priorityName = 'Low';
          			  break;		  
		}

		return  priorityName;
	}, 
	
	/**
	 * Close Dialog.
	 */
	close : function() {
		UndoBehavior.close.call(this);
	},
	toggle: function(collapse) {
		  collapse.toggle();
	},
	_setDateString : function (record) {
		
		if (record.statusdate){
			return $M.localize(' {0} ',[this.calcDifference(record.statusdate)]);
		}
		else {
			return '';
		}
	},
	calcDifference : function (referencePeriod) {
		
		var difference = '';
		var oneMinute=1000*60;
		var oneHour=oneMinute*60;
		var oneDay=oneHour*24;
		//var oneWeek=oneDay*7;
		
		if (referencePeriod) {
			var msecs = Date.parse(referencePeriod);
			var completionDate = new Date(msecs);
			var nowDate = new Date();
			
			var msecsDiff = nowDate.getTime() - completionDate.getTime();
			var value = 1;
			
//			if (msecsDiff >= oneWeek) {
//				value = Math.round(msecsDiff/oneWeek);
//				difference = value.toString() + ' week';
//			}else 
			if (msecsDiff >= oneDay) {
				value = Math.round(msecsDiff/oneDay);
				difference = value.toString() + ' day';
			}else if (msecsDiff >= oneHour){
				value = Math.round(msecsDiff/oneHour);
				difference = value.toString() + ' hour';
			}else if (msecsDiff >= oneMinute) {
				value = Math.round(msecsDiff/oneMinute);
				difference = value.toString() + ' minute';
			}else {
				value = 1;
				difference = '1 minute';
			}
			
			if (value > 1) {
				difference = difference + 's';
			} 
		}
		
		return difference;
	}
});