/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A number input component.
*/
 Polymer({
    is: 'maximo-numberinput',
    behaviors : [BaseComponent],
    properties: {
    
      max: {
        type: Number,
        notify: true
      },
 
      min: {
    	type: Number,
    	notify: true
      },

      value: {
      	type: Number,
      	value: 0,
      	notify: true,
      	observer: '_handleValueChange'
      },
      
      label: {
        type: String,
        notify: true
      },
      
      allowOverrange: {
          type: Boolean,
          value: false,
          notify: true
      }
    },
    observers: [
     
    ],
    
    ready: function(){	

	},
	
    attached: function(){

    },
    
    _handleMinus: function(){
    	if(this.min === undefined){
    		this.value = parseInt(this.value) - 1;
    	}
    	if(this.value > this.min){
    		if(this.value < (this.min + 1)){
    			this.set('value',this.min);
    		}else{
    			this.value = parseInt(this.value) - 1;
    		}
    	}
    },
    
    _handlePlus: function(){
    	if(this.max === undefined){
    		this.value = parseInt(this.value) + 1;
    	}
    	if(this.value < this.max){
    		if(this.value > (this.max - 1)){
    			this.set('value',this.max);
    		}else{
    			this.value = parseInt(this.value) + 1;
    		}
    	}
    },
    
    _handleValueChange: function(){
    	if(this.allowOverrange === false){
    		if(this.value > this.max){
    			this.set('value',this.max);
    		}
    		if(this.value < this.min){
    			this.set('value',this.min);
    		}
    	}
    }
     
  });
