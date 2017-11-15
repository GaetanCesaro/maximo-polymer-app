/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-srdetail-card',
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
	 * split line when change textarea to label
	 */
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
	 * Close Dialog.
	 */
	close : function() {
		UndoBehavior.close.call(this);
	},
	toggle: function(collapse) {
		  collapse.toggle();
	}
});