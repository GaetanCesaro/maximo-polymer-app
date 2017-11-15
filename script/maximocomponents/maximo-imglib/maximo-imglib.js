/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
The `<maximo-image>` element is an image processing library.

Example:
```html
	<maximo-imglib id="workinprogress-label-labor-image" width="50px" height="50px" image="{{wmassignment.labor.person._imagelibref}}" noimageicon="maximo-based:no-image" rounded></maximo-image>
```


*/


Polymer({
	is: 'maximo-imglib',
  	behaviors: [BaseComponent, TableComponent],
  	properties: {
		image: {
			type: String,
			value: '',
			notify: true,
			observer: 'haveImageLink'
		},
		width: {
			type: String,
			notify: true
		},
		height: {
			type: String,
			notify: true
		},
		noimageicon: {
			type: String,
			notify: true
		},
		showimage: {
			type: Boolean,
			value: false,
			notify: true,
			observer: 'toggleShowImage'
		},
		showicon: {
			type: Boolean,
			value: false,
			notify: true
		},
		rounded: {
			type: Boolean,
			value: false,
			notify: true
		}
  	},
  	
	ready: function(){
		
	},	
	attached : function() {
		if (!this.showimage && this.noimageicon) {
			this.showicon = true;
		}
	},
	
	haveImageLink: function() 
	{
		this.showimage = Boolean(this.image && (this.image.length > 0));
	},
	
	toggleShowImage: function() {
		this.showicon = !this.showimage;
	},
	
	getErrorIconStyle: function(width, height) {
		return 'width:' + width + ';height:' + height;
	},
	getImageStyle : function(rounded) {
		return rounded ? 'rounded' : '';
	}
  	
});