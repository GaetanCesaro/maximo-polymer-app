/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */


Polymer({
	is: 'maximo-response-field',
  	behaviors: [BaseComponent],
	properties : {
		item: {
			type: Object,
			value : null,
			notify : true
		},
		
		question: {
			type: Object,
			value : null,
			notify : true
		},
		
    	resultrecord: {
    		type: Object,
    		notify:true
    	},
		
		textresponseinput: {
			type: String,
			value: function() {
    			return '';
    		},
	    	notify: true,
		}
	},
		
	/**
	 * Synchronize response field data updates in the database.
	 */
	_updateResponseField : function(e) {
		var currentFieldEvent = e.currentTarget.parentElement.parentElement.parentElement.fieldEvent;
		var value = e.currentTarget.value;
		var selectedRecord = this.resultrecord;
		var currentUser = $M.userInfo.personid;
		var inspfieldHref = currentFieldEvent.localref;
		
		var field = {};
		field.resultnum = selectedRecord.resultnum;
		field.inspquestionnum = currentFieldEvent.inspquestionnum;
		field.inspformnum = currentFieldEvent.inspformnum;
		field.inspfieldnum = currentFieldEvent.inspfieldnum;
		field.revision = parseInt(currentFieldEvent.revision);
				
		var responsefield = (currentFieldEvent.fieldtype==='TR' || currentFieldEvent.fieldtype==='SO') ? 'txtresponse' : 'numresponse';
		field[responsefield]=value;//parseFloat(value);
		field.enteredby = currentUser;
		field.entereddate = new Date();
		field.orgid = selectedRecord.orgid;
		field.siteid = selectedRecord.siteid;	
		
		var recordobject = {};
		recordobject.field = field;
		recordobject.recorddata = selectedRecord;
		recordobject.inspfieldHref = inspfieldHref;
		
		this.fire('updateResponse',recordobject);

	},
	
	/**
	 * Dynamically build Text, Numeric and Single Select Response Fields on Execution View.
	 */
	attached : function(){ 
		if(!this.item){
			return;
		}
		var resultRecord = this.resultrecord;
		var itemfield = this.item;
		$j( this ).empty();
		
		//filter fields down to only ones that exist on result record
		var self = this;
		var responseArray = [];
		if(resultRecord.inspfieldresult && itemfield.inspfieldresult){
			responseArray = itemfield.inspfieldresult.filter(function(el){
				return el.orgid===resultRecord.orgid && el.resultnum===resultRecord.resultnum;
			});
		}
		var responseField = '';
		var responseFieldType = (itemfield.fieldtype==='TR' || itemfield.fieldtype==='SO') ? 'txtresponse' : 'numresponse';
			
		if(itemfield.fieldtype==='TR' || itemfield.fieldtype==='SE'){
			responseField = Polymer.Base.create('maximo-text',{'id':itemfield._id+'textresponse'});
			if(itemfield.fieldtype==='TR'){
				responseField.placeholder=$M.localize('uitext','mxapiinspection','enter_answer');
			} else {
				responseField.placeholder=$M.localize('uitext','mxapiinspresult','numeric_response');
			}
		} else {
			var placeholdertext = $M.localize('uitext','mxapibase','select_option');
			responseField = Polymer.Base.create('maximo-select',{'id':itemfield._id+'responseFieldresponse','placeholder':placeholdertext});
		}
		

		if(resultRecord.inspfieldresult && responseArray[0] && responseArray.length>0){
			if(!responseArray || responseArray.length===0 || responseArray[0][responseFieldType]===undefined){
				responseField.setAttribute('value','');
			} else {
				responseField.setAttribute('value',responseArray[0][responseFieldType]);				
			}
		} else {
			responseField.setAttribute('value','');
		}
		
		//Dynamically build Text, Numeric and Single Select Response Fields
		if(itemfield.fieldtype==='TR' || itemfield.fieldtype==='SE'){	
			responseField.label=itemfield.description;
					
			if(itemfield.fieldtype==='TR'){
				responseField.setAttribute('id',itemfield._id+'textresponse');
				responseField.setAttribute('type','text');
			} else if(itemfield.fieldtype==='SE'){
				responseField.setAttribute('id',itemfield._id+'numericresponse');
				responseField.setAttribute('type','text');
					
				$j(responseField.$.input).attr('class','input-no-spinner style-scope maximo-text');
				$j(responseField.$.input).attr('step','any');
			}
								
			
			$j(responseField.$.input).on('change',function(e){
				self._updateResponseField(e);				
				self.domHost.fire('maximo-response-field-changed',e);
			});
			
			
			$j(responseField.$.input).keyup(function () {
				
				if(responseField.required===true && !responseField.label){
					if($j(this).val().length>0){
						$j(responseField.$.input)[0].parentElement.removeAttribute('required');		
						$j(responseField.$.input)[0].parentElement.setAttribute('notrequired','');
					} else {
						$j(responseField.$.input)[0].parentElement.removeAttribute('notrequired');
						$j(responseField.$.input)[0].parentElement.setAttribute('required','');
					}	
				}
				
				//only process for single numeric entry
			    if($j(this)[0].parentElement.parentElement.parentElement.parentElement.item.fieldtype==='SE'){
			    	var num=$j(this).val();
				    
				    var reg = new RegExp('^(?!.*?\\.{2})(?!.*\,\,)(?!.*--)[0-9\.\,\-\/]+$');
				  			    
				    if(!reg.test(num)){
				    	num = num.substring(0,num.length - 1);
				    	$j(this).val(num);
				    }
				    
				    //needed for edge browser to trigger change event when field is cleared
				    if(num===''){
				    	$j(responseField.$.input).trigger('change');	
				    }
				    
			    }
			});
			
			if(itemfield.required===true && !itemfield.description){
				if(responseField.getAttribute('value').length>0){
					$j(responseField.$.input)[0].parentElement.removeAttribute('required');		
					$j(responseField.$.input)[0].parentElement.setAttribute('notrequired','');
				} else {
					$j(responseField.$.input)[0].parentElement.removeAttribute('notrequired');
					$j(responseField.$.input)[0].parentElement.setAttribute('required','');
				}
			}
			
			$j(responseField.$.input).attr('style','font-size:129%;width:50%;');
			
			$j(responseField.$.input).attr('id',itemfield._id+'_input_response');
			
			if(resultRecord.status_maxvalue==='COMPLETED'){
				responseField.setAttribute('readonly','true');
			}
			
		} else {
			//SINGLE SELECT SECTION							
			var res = [];
			
			if(resultRecord.status_maxvalue==='COMPLETED'){
				$j(responseField.$.select).attr('disabled','disabled');
			}
			
			//sort collection to make sure data is in sequence order
			itemfield.inspfieldoption.sort(function(a, b) {
				return parseFloat(a.sequence) - parseFloat(b.sequence);
			});
			
			itemfield.inspfieldoption.forEach(function (inspfieldoption) {
				res.push(inspfieldoption.description);
			});
			
			var valuelist = res.join(',');
			
			//responseField.setAttribute('id',itemfield._id+'responseFieldresponse');
			responseField.label=itemfield.description;
			responseField.values = valuelist;
			
			$j(responseField.$.select).on('change',function(e){
				if(responseField.required===true && !responseField.label){
					if($j(this).val().length>0){
						$j(responseField.$.select)[0].parentElement.removeAttribute('required');		
						$j(responseField.$.select)[0].parentElement.setAttribute('notrequired','');
					} else {
						$j(responseField.$.select)[0].parentElement.removeAttribute('notrequired');
						$j(responseField.$.select)[0].parentElement.setAttribute('required','');
					}
				}
				self._updateResponseField(e);
				self.domHost.fire('maximo-response-field-changed',e);
			});
			
			if(itemfield.required===true && !itemfield.description){
				if(responseField.getAttribute('value').length>0){
					$j(responseField.$.select)[0].parentElement.removeAttribute('required');		
					$j(responseField.$.select)[0].parentElement.setAttribute('notrequired','');
				} else {
					$j(responseField.$.select)[0].parentElement.removeAttribute('notrequired');
					$j(responseField.$.select)[0].parentElement.setAttribute('required','');
				}
			}
			
			//$j(responseField.$.input).attr('style','font-size:129%;');
			
			$j(responseField.$.select).attr('id',itemfield._id+'_select_option');
			
		}	
		
		//set required flag on required response fields
		if(itemfield.required===true){
			responseField.setAttribute('required','');
			//hide required flag when label is empty
			if(!responseField.label){
				$j(responseField.$.label).attr('hidden','');
			}
		}
		
		responseField.setAttribute('style','text-align:left;');
		$j(responseField.$.label).attr('style','font-size:129%;');

		this.parentElement.setAttribute('style','padding-left:21px;padding-bottom:20px;');
		responseField.fieldEvent = itemfield;
		
		this.appendChild(responseField);
	}
});
