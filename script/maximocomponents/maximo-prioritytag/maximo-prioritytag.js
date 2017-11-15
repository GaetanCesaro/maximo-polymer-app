/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
Maximo priority element. Show a custom tag that represents the wopriority attribute.

Example:
```html
		<maximo-prioritytag id="prioritydemo" priority="{{exampledata}}"></maximo-prioritytag>
```

### Classifications
  The priorities are segmented in 3 groups.

1- High (Background color = orange)
```html
<maximo-prioritytag id="prioritydemo" priority="1"></maximo-prioritytag>
```
2- Medium (Background color = yellow)
```html
<maximo-prioritytag id="prioritydemo" priority="2"></maximo-prioritytag>
```
3- Low (Background color = green)
```html
<maximo-prioritytag id="prioritydemo" priority="3"></maximo-prioritytag>
```

@demo
 */
Polymer({
    is: 'maximo-prioritytag',
    behaviors: [BaseComponent],
    properties: {
    	/**
    	 * Priority received to stick inside tag, number value only.
    	 */
    	priority: {
    		type: Number,
    		value: 0,
    		notify: true,
    		observer: 'update'
    	}
    },

	update: function() {
		var priority = this.getAttribute('priority') ? this.getAttribute('priority') : this.priority;
		if (priority === 'NaN'){
			priority = 0;
		}
		$j(this.$.container).attr({'aria-label':this.localize('uitext', 'mxapibase', 'Priority0', [priority])});
		this.computeColor(priority);
	},
	/**
    	 * Set the CSS style related to the priority number
    	 */
	computeColor: function (priority) {
		var color = '';

		if(priority<=1){
			color='one';
		} else if(priority<=2){
			color='two';
		} else if(priority<=3){
			color='three';
		} else if (priority>=4){
			color='four';
		}

		$j(this.$.container).toggleClass('one',false);
		$j(this.$.container).toggleClass('two',false);
		$j(this.$.container).toggleClass('three',false);
		$j(this.$.container).toggleClass('four',false);
		$j(this.$.container).toggleClass(color,true);
	}

});
