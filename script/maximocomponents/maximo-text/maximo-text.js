/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/**
`<maximo-text>` element. A textbox component that includes a label and styling.

Example:
```html
	<maximo-text id="text1" placeholder="no initial value" width="500px"></maximo-text>
```

@demo

*/
Polymer({
  is: 'maximo-text',
  behaviors : [ BaseComponent, TableComponent ],
  properties: {
	  /**
	   * 
	   */
	  autofill: {
		  type: Object,
		  value : function(){
			  return false;
		  }
	  },
	  /**
	   * Binds to regular input autofocus
	   */
	  autofocus: {
		  type: Boolean,
		  value : false
	  },
	  
	  /**
	   * Restrict field for edition and copy
	   */
      readonly: {
          type: Boolean,
          value: false,
          notify: true,
          observer: '_readonlyChanged',
      },
      /**
       * Set weather null is allowed
       */
      required: {
          type: Boolean,
          value: false,
          notify: true
      },
      
      /**
       * short hint that describes the expected value of an input field
       */
      placeholder: {
          type: String,
          value: ''
      },
      
      /**
       * hint that describes that the expected value is empty
       */
      readonlyEmptyPlaceholder: {
          type: String,
          value: function(){
        	 return this.localize('uitext','mxapibase','NotEntered'); 
          }
      },
      
      /**
       * Defines whether or not the required asterisk will display on the input field
       */
      inputRequired:{
    	  type: Boolean,
          value: false
      },
      
      /**
       * Defines type of the input
       */
      type: {
          type: String,
          value: 'text',
          notify: true
      },
      /**
       * Input value
       */
      value: {
    	  type: String,
    	  value: '',
    	  notify : true,
    	  observer: '_changeValue'
      },
      /**
       * Binds to required-pattern of regular input
       */
      pattern: {
    	  type: String,
    	  value: null,
    	  observer: '_patternChanged'
      },
      /**
       * Component width
       */
      width: {
    	  type: String,
    	  value : ''
      },
      icon:{
        type: String,
        value:'Maximo:Warning',
        notify:true
      },
      /**
       * Set as date if you need datepicker
       */
      dataType: {
    	  type: String,
    	  value: 'text'
      },
      /**
       * Apply border-box to component
       */
      bordered: {
    	  type: Boolean,
    	  value: false
      },
      /**
       * Set how many characters the field allows
       */
      maxlength: {
    	  type: Number,
    	  value: 255
      },
      valcount:{
        type:Number,
        value:0
      },
      valid: {
    	  type: Boolean,
    	  value: true,
    	  observer: '_toggleValidity'
      },
      _typeError: {
    	  type: String,
    	  value: '',
    	  notify: true,
    	  observer: '_typeErrorChanged'
      },
      _typeErrorMessage: {
    	  type: String,
    	  value: '',
    	  notify: true,
      }
    },
    
    _isPassword: function(){
    	return this.type.toLowerCase()==='password'; 
    },
    _passwordClass: function(type){
    	var className = this._isPassword()?'password':'';
		return className;
    },
    ready: function() {
    	if(!this.autofill){
    		//this.originalType = this.type;
    		//this.type = 'text';
    	}
    	if(this.readonly){
    		$j(this.$.input).prop('readonly', 'readonly');
    	}
    	if(this.inputRequired){
    		$j(this.$.input)[0].parentElement.setAttribute('required', '');
    	}
    	$j(this.$.label).attr({'for':this.$.input.id});
    	$j(this.$.input).attr({'name':this.$.input.id});
    	if(this.width){
    		$j(this.$.input).css({'width':this.width});
    	}
    },
    _readonlyChanged: function(){
        if(!this.readonly){
          $j(this.$.input).removeProp('readonly');
          $j(this.$.input).removeAttr('readonly');
        }else{
          $j(this.$.input).prop('readonly', 'readonly');
        }
      },
      
    attached: function(){
    	if(this.readonly){
    		this.placeholder = this.readonlyEmptyPlaceholder;
    	}
    	if(this.dataType.toLowerCase()==='date'){
    		$j(this.$.input).attr('readonly');
    		var text = this;
      		$j(this.$.input).datepicker({
      			altField: text.$.input,
      			isRTL: $M.dir === 'rtl'
        	});
      		var lookupValue = this.$.input.bindValue;
      		if(lookupValue){
      			$j(this.$.input).datepicker('setDate', lookupValue);
      		}
    	}
		$j(this.$.input).toggleClass('bordered', this.bordered===true);
    	if(this.autofill){
    		this.fixPasswords();
    	}
    	if(this._isPassword()){
    		$j(this.$.input).on('focus', function(e){
    			$j(e.target).attr({'type':'password'});
    			$j(e.target).attr({'bindValue': this.value});
    		});
    	}
    	if(this.pattern){
    		$j(this.$.input).attr('pattern',this.pattern);
    	}
    },
    _patternChanged: function(newPattern){
    	if(newPattern){
    		$j(this.$.input).attr('pattern',this.pattern);
    	}
    	else {
    		$j(this.$.input).removeAttr('pattern');
    	}
    },
    /**
     * Converts text input as password
     */
    fixPasswords: function(){
    	if(this._isPassword()){
    		if($j(this.$.input).val()!==''){
        		$j(this.$.input).attr({'type':'password'});
    		}
    		else {
    			$j(this.$.input).attr({'type':'text'});
    		}
    		$j(this.$.input).toggleClass('password', true);
    		$j(this.$.input).attr({'bindValue': this.value});
    	}
    },
    _changeValue: function(newValue){
    	if(newValue!=='' && this._isPassword()){
    		var textbox = this;
    		this.async(function(){
    			textbox.fixPasswords();
    		}, 100);
    		
    	}
    },
    validator: function(e,d){
	    if(e.value=="" && d==true){
	        $j(this.$.wrapper).css({'position':'relative'});
	        $j(this.$.validationicon).css({'display':'initial','position':'absolute','padding-left':'75px','pointer-events':'none','left':'0px','opacity':'1'});
	        //$j(this.$.input).css({'padding-left':'30px','border-color':'#d74108'});
	        $j(this.$.input).toggleClass('invalid',true);
	    	return false;
	    }
        $j(this.$.validationicon).css({'display':'none','opacity':'0'});
        //$j(this.$.input).css({'padding-left':'3px','border-color':'#aeb8b8'});
        $j(this.$.input).toggleClass('invalid',false);
        return true;
    },
    getTableDataBindInfo: function(){
    	return {
			input : this,
			name : 'input',
			value : 'value'
    	};
    },
    _toggleValidity: function(valid){
    	this.validator({'value':''},!valid);
    },
    _typeErrorChanged: function(error){
    	this._typeErrorMessage = this.localize('uitext','mxapibase',this._typeError);
    },
    setDataType: function(type, subType){
		switch(type){
			case 'integer':
			case 'number': //may need to use sub types to be more specific
				$j(this.$.input).attr({'pattern':'[-+]?[0-9]*[.,]?[0-9]+'});
				this._typeError = 'notNumeric';
				
				break;
			case 'boolean':
				$j(this.$.input).attr('pattern','false|true|TRUE|FALSE|True|False');
				this._typeError = 'notBoolean';
				break;
		}
    }
});