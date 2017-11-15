/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
Maximo audio element. The code we use for inserting any audio file into a web page is really simple and self-explanatory:

Example:
```html
    <maximo-audio src="teste.mp3"></maximo-audio>
```

@demo
 */

Polymer({
	is: 'maximo-audio',
  	behaviors: [BaseComponent],
	properties : {
		src: {
			type: String
		},
		width: {
			type: String
		},
		height: {
			type: String
		}
	},
  	created : function(){
  		
  	},
  	ready : function(){
  		
  	},
  	attached: function(){
  		
  	},
});