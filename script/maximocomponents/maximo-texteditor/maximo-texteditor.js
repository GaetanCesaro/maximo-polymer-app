/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A text editor component.
 */
Polymer({
  is: 'maximo-texteditor',
  behaviors : [ BaseComponent ],
  properties: {
	  autofocus: {
		  type: Boolean,
		  value : false
	  },
      readonly: {
          type: Boolean,
          value: false,
          notify: true
      },
      required: {
          type: Boolean,
          value: false,
          notify: true
      },
      placeholder: {
          type: String,
          value: ''
      },
      type: {
          type: String,
          value: 'text'
      },
      value: {
    	  type: String,
    	  value: '',
    	  notify : true,
    	  observer : '_changeValue'
      },
      pattern: {
    	  type: String,
    	  value: ''
      },
      width: {
    	  type: String,
    	  value : '200px'
      },
      height: {
    	  type: String,
    	  value : '100px'
      },
      maxlength: {
    	  type: Number
      }
    },
    ready: function() {
    	if(this.readonly){
    		$j(this.$.texteditor).prop('readonly', 'readonly');
    	}
    	$j(this.$.label).attr({'for':this.$.texteditor.id});
    	$j(this.$.texteditor).attr({'name':this.$.texteditor.id});
    	if(this.width){
    		$j(this.$.texteditor).css({'width':this.width});
    	}
    	if(this.height){
    		$j(this.$.texteditor).css({'height':this.height});
    	}
    },
    _changeValue(e) {
    	if(this.maxlength && (this.value.length > this.maxlength)){
    		this.value = this.value.substr(0, this.maxlength);
    	}
    	else{
    		this.fire('update-value', this.value);
    	}
    }
});