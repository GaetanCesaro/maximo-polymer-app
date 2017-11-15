/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-image>` element. It's an image component.

Example:
```html
	<maximo-image id="image1" src="../demo/images/raleigh.png"></maximo-image>
```

The path of the file is defined in the src="", it can be from the same folder, another folder or from another web site. 

Example:
```html
	<maximo-image id="image1" src="raleigh.png"></maximo-image>
	<maximo-image id="image1" src="data/raleigh.png"></maximo-image>
	<maximo-image id="image1" src="http://www.w3.ibm.com/raleigh.png"></maximo-image>
```

The images can also be resized through the widht or/and height property.

Example:

```html
	<maximo-image id="image1" src="../demo/images/raleigh.png" width="200px"></maximo-image>
	<maximo-image id="image1" src="../demo/images/raleigh.png" width="200"></maximo-image>
	<maximo-image id="image1" src="../demo/images/raleigh.png" height="200px"></maximo-image>
```

This can be done with .jpg, .png and .gif images, however, the resize will not work on animated gifs.

@demo

*/


Polymer({
	is: 'maximo-image',
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