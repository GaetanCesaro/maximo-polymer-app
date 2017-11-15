/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-textarea>` element. A larger editable text component that includes a label and styling.

Example:
```html
	<maximo-textarea spell-check-off value="{{_textAreaValue}}" width="500px"></maximo-textarea>
```

@demo
 */
Polymer({
  is: 'maximo-textarea',
  behaviors : [ BaseComponent ],
  properties: {
	  /** Set component to readonly */
      readonly: {
          type: Boolean,
          value: false,
          observer: '_setReadonly'
      },
      /** turn off spell checking */
      spellCheckOff: {
    	  type: Boolean,
    	  value: false
      },
      /** Set component to required */
      required: {
          type: Boolean,
          value: false,
          observer: '_setRequired'
      },
      /** Set component placeholder */
      placeholder: {
          type: String,
          value: '',
          notify: true
      },
      _internalplaceholder: {
          type: String,
          value: ''
      },
      /** Value of component */
      value: {
    	  type: String,
    	  value: '',
    	  notify : true,
    	  observer: '_updateTextarea'
      },
      /** Set the width of the textarea */
      width: {
    	  type: String,
    	  value : '200px'
      },
      /** Set the height of the textarea */
      height: {
    	  type: String,
    	  value : '100px'
      },
      maxlength: {
    	  type: Number,
    	  value: 255
      }
    },
    ready: function() {
    	if(this.readonly){
    		$j(this.$.input).prop('readonly', 'readonly');
    	}
    	$j(this.$.label).attr({'for':this.$.input.id});
    	$j(this.$.input).attr({'name':this.$.input.id});
    	if(this.width){
    		$j(this.$.input).css({'width':this.width});
    	}
    	if(this.height){
    		$j(this.$.input).css({'height':this.height});
    	}
    	if(this.spellCheckOff){
    		$j(this.$.input).attr({'spellcheck':'false'});
    	}
    },
    attached: function(){
    	if(this.placeholder){
    		this._internalplaceholder = ' '+this.placeholder;
    	}
    	this._setReadonly(this.readonly?this.readonly:false);
    	this._setRequired(this.required);
    },
    _setReadonly: function(val){
        $j(this.$.input).attr({'readonly':val,'aria-readonly':val});
    },
    _setRequired: function(val){
        $j(this.$.input).attr({'aria-required':val});
    },
    _onChange: function(e){
    	this.value = $j(this.$.input).val();
    },
    _updateTextarea: function(value){
    	if (this.value !== undefined) {
    		$j(this.$.input).val(value);
   			$j(this.$.input).toggleClass('placeHolder', this.value.trim()==='');
   		}
    },
    _onblur: function(e){
    	this.placeholder = this._internalplaceholder;
    	$j(this.$.input).toggleClass('placeHolder', this.value.trim()==='');
    },
    _onfocus: function(e){
    	if(!this.readonly){
    		this.placeholder = '';
    		$j(this.$.input).toggleClass('placeHolder', false);
    	}
    },
});