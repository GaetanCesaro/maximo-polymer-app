/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
Maximo progress element. Behaves as normal field plus a few more properties 

Example:
```html
    <maximo-progress id="progressBar" class="attachmentProgress" min="0" max="1000" value="0"></maximo-progress>
```
### Properties
- min = Set the initial value that the progress bar can assume
- max= Set the maximum value that the prgress bar cna assume
- value = The value of the progress bar in real time
- data-index= the data that will be loaded

@demo
 */

Polymer({
      is: 'maximo-progress',
      
      behaviors: [Polymer.IronRangeBehavior],

      properties: {
                

    	  displayValue : {
    		  type:Boolean,
    		  value: true,
    		  notify: true
    	  }
      },
      
      ready: function() {
    	  
      },

      attached: function() {
    	
      },

      _computeStyle: function(ratio) {
          return 'width: ' + ratio + '%;';
      }
    });