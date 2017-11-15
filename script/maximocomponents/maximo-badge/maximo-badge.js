/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*

`<maximo-badge>` element. Displays / indicates small texts or numbers.

Example:
```html
	<maximo-badge id="badge"></maximo-badge>	
```

### Styling

The following custom properties and mixins are also available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--maximo-badge-border-radius` | Border radius | `25%`
`--maximo-badge-margin-left` | margin left | `0px`
`--maximo-badge-margin-bottom` | margin bottom | `0px`
`--maximo-badge-width` | width | `20px`
`--maximo-badge-height` | height | `20px`
`--maximo-badge-background` | background-color | `var(--accent-color)`
`--maximo-badge-opacity` | opacity | `1.0`
 
 @demo

 */
Polymer({
      is: 'maximo-badge',
      
      behaviors: [
        Polymer.IronResizableBehavior
      ],

      properties: {
        object: {
          type: String,
          observer: '_forChanged'
        },

        /**
         * Content displayed inside badge
         */
        data: {
          type: String,
          observer: '_dataChanged',
          notify: true
        },
        
        /**
         * Flag to show/hide component
         */
        hidden: {
        	type: Boolean,
        	value: false,
        	notify: true
        },
        
        /**
         * Badge color
         */
        color: {
        	type: String,
        	value: 'white',
        	notify: true
        },
        
        /**
         * Content font size
         */
        fontSize:{
        	type: String,
        	value: '14px;',
        	notify: true
        }
      },
      
      ready: function() {
    	  
      },

      attached: function() {
    	 this. _forChanged();
      },

      _forChanged: function() {
        if (!this.isAttached) {
          return;
        }
        this._target = this.target;
        this.async(this.notifyResize, 1);
      },

      _dataChanged: function() {
        this.setAttribute('aria-label', this.label);
      },
      
      /**
       * Compute whether the badge should be hidden
       * according to content of data property
       */
      _getHidden: function(data) {
    	  if(!this.data || this.data === '0' || this.data === 0)
    	  {
    		  return true;
    	  }
    	  else
          {
    		  return this.hidden;
          }
      }
    });