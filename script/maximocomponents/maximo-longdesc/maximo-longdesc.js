/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-longdesc>` element. A readonly iframe to safely display html content. The iframe hides when there is no content.

Example:
```html
	<maximo-longdesc text="{{textValue}}" auto-size max-height='50'></maximo-longdesc>
```

@demo
*/

Polymer({
	is: 'maximo-longdesc',
  	behaviors: [BaseComponent, TableComponent],
  	properties: {
  		/** HTML value to show in iframe */
		text: {
			type: String,
			value: '',
			notify: true,
			observer: '_haveDescText'
		},
		/** Width for iframe */
		width: {
			type: String,
			notify: true
		},
		/** Height for iframe */
		height: {
			type: String,
			notify: true
		},
		/** Autosize iframe to match content */
		autoSize: {
			type: Boolean
		},
		/** Maximum height to use when autosize*/
		maxHeight: {
			type: String
		}
  	},
  	_waitForContentWindow: function(){
  		if(this.$.frame.contentWindow){
  			window.clearInterval(this.interval);
  	  		this._updateText();
  		}
  	},
  	_updateText: function(){
		this.$.frame.contentWindow.document.open();
		this.$.frame.contentWindow.document.write('<link href="css/main.css" rel="stylesheet">');
		this.$.frame.contentWindow.document.write('<div id="'+this.id+'_inernalDiv'+'" style="font-family: HelveticaNeue;font-size:12px;color:#464646;width:95%;-webkit-user-select: text;user-select: text">' +  this.text + '</div>');
		var internalDiv = this.$.frame.contentWindow.document.getElementById(this.id+'_inernalDiv');
		$j(this.$.frame).css('width','100%');
		if(this.autoSize){
			var height = $j(internalDiv).height();
			if(this.maxHeight){
				var maxHeight = parseInt(this.maxHeight);
				height = height > maxHeight? maxHeight: height;
			}
			$j(this.$.frame).css({'height':height+'px','width':$j(internalDiv).width()+'px'});
		}
		else {
			if(this.height){
				$j(internalDiv).height(parseInt(this.height));
			}
			if(this.height){
				$j(internalDiv).height(parseInt(this.width));
			}
		}
		var longdesc = this;
		$j(internalDiv).on('click', function(){
			$j(longdesc).trigger('click');
		});
		this.$.frame.contentWindow.document.close();
  	},
	_haveDescText : function() {
		if ((this.text) && (this.text.length > 0)) {
			this.$.frame.hidden=false;
			//in many cases the contentWindow of the iframe is null and needs time to initialize. The interval allows for this problem.
			this.interval = window.setInterval(this._waitForContentWindow(), 200);
		}
		else {
			this.$.frame.hidden=true;
		}
	}
});