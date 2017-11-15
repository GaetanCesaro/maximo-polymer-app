/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
`<maximo-footer>` element. Behave as a simple footer div, which stay at the bottom of his parent component and can align the content.

Example:
```html
  <maximo-footer id="footer" centered left></maximo-footer>
```
@demo
 */
Polymer({
	is: 'maximo-footer',
  	behaviors: [BaseComponent],
	properties : {
		/**
     * Centralize the content
    */
		centered: {
			type: Boolean,
			value: false,
			observer: '_setCentered'
		},
    /**
     * Align the content to the left
    */
    left:{
      type: Boolean,
      value:false
    }	
	},
  	created : function(){
  		
  	},
  	ready : function(){
  		this._setCentered();
  		$j(this.$.footer).toggleClass('left',this.left);
  	},
  	_setCentered: function(){
		$j(this.$.footer).toggleClass('centered',this.centered);
  	},
  	attached: function(){
  		//Apply class if footer is inside a mximo-dialog
  		var hasParentDialog = $M.findElementParent(this.$.footer,'MAXIMO-DIALOG');
  		if (hasParentDialog) {
  			$j(this.$.footer).toggleClass('dialog',true);
  		}
  	},
  	
});