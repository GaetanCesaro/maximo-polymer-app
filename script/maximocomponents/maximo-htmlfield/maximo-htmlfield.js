/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
`<maximo-htmlfield>` element represents a publishing-extensible field type for defining rich HTML content.

Example:
```html
	<maximo-htmlfield ignore-rich-text id="viewsr-label-description" class="description" ellipsis-size="50" datalabel="{{_getDescription(sr)}}"></maximo-htmlfield>
```

This field can be used as a description field. It is similar to the "frames" that we have in html, but you don't need to create another page and link a source to it.
The "datalabel" is where the text and informations goes, you can insert html codes as well.

Example:
```html
	<maximo-htmlfield id="text1" datalabel="This is a <b><i>test</i></b>.<br> You can turn this label a <font color='red'>description</font> <marquee>field</marquee>.<br><br> <font color='blue'>Its a publishing-extensible field type for defining rich HTML content</font>" ellipsis-size="50"></maximo-htmlfield>
```

@demo

*/

Polymer({
	is: 'maximo-htmlfield',
  	behaviors: [BaseComponent],
	properties : {
		ellipsisSize : {
			type: Number,
			value: 0,
		},
		label: {
			type: String,
			value: '',
			notify:true
		},
		datalabel: {
			type: String,
			value: '',
			notify: true,
			observer: '_updateLabel'
		},
		maxHeight: {
			type: String
		},
		ignoreRichText: {
			type: Boolean,
			reflectToAttribute: true
		}
	},

	ready : function() {
		this._updateLabel();
	},
	attached: function(){
		var bgColor = this._findBackgroundColor();
		if(bgColor !== 'transparent'){
			$j(this.$.fadeDiv).css({'background':'linear-gradient( rgba('+bgColor+', 0) 0%, rgba('+bgColor+', 1) 80% )'});
		}
	},

	_findBackgroundColor: function(){
		var element = this.$.outer;
		var color;
		while(!color && element && element[0] !== document){ 
			var testColor = $j(element).css('background-color');
			var rgb = testColor.replace('rgba(','').replace('rgb(','').replace(')',''); 
			rgb = rgb.replace(/ /g, '');
			if(rgb!=='0,0,0,0' && rgb!=='transparent'){
				color = rgb;
			}
			element = $j(element).parent();
		}
		return color;
	},
	
	haveTitleLabel : function() {
		if (this.label && this.label.length !== 0) {
			return true;
		}
		return false;
	},
	/**
	 * update contents.
	 */
	_updateLabel : function() {
		var labelString = '';
		
		if (this.datalabel) {
			labelString = this.datalabel;
			if (this.ignoreRichText) {
				// trick to strip html tags from rich text
		        var richText = document.createElement("div");
		        richText.innerHTML = labelString;
		        var plainText = richText.textContent || richText.innerText;
		        richText.remove();
		        richText = null;
		        labelString = plainText;
			}
			if(this.maxHeight){
				$j(this.$.outer).attr({'title':this.datalabel});
				this.async(function(){
					this.lineHeight = $j(this.$.hidden).height();
					$j(this.$.hidden).css({'display':'none'});				
					$j(this.$.dynamicdata).css({'overflow':'hidden','display':'inline-block'});
					$j(this.$.fadeDiv).css({'display':'none'});
					if(this.maxHeight){
						var max = parseInt(this.maxHeight); 
						var newHeight = max -(max%this.lineHeight);
						$j(this.$.dynamicdata).css({'max-height':newHeight+'px'});
						$j(this.$.outer).height(($j(this.$.outer).height()+(max%this.lineHeight))+'px');
						if(this.$.dynamicdata.scrollHeight>this.$.dynamicdata.clientHeight+10){
							$j(this.$.fadeDiv).css({'display':'block'});
						}
					}
					
				},10);
			}
			else if (this.ellipsisSize !== 0 && labelString.length > this.ellipsisSize) {
				$j(this.$.outer).attr({'title':labelString});
				labelString = this.datalabel.substring(0, this.ellipsisSize);
				
				// if there is html tag, add or remove tag.				
				var tagStartIndex = labelString.lastIndexOf('<');
				var tagEndIndex = labelString.lastIndexOf('>');
				var tag = '';
				
				if (tagStartIndex !== -1 && tagEndIndex !== -1) {
					if (tagStartIndex > tagEndIndex) {
						labelString = this.datalabel.substring(0, tagStartIndex);
						
						tagStartIndex = labelString.lastIndexOf('<', tagEndIndex);
						if (tagStartIndex !== -1) {
							tag = labelString.substring(tagStartIndex + 1, tagEndIndex);
							if (tag.charAt(0) !== '/') {
								labelString += '</' + tag + '>';
							}
						}
					}
					else {
						tag = labelString.substring(tagStartIndex + 1, tagEndIndex);
						
						if (tag.charAt(0) !== '/') {
							labelString += '</' + tag + '>';
						}
					}
				} else if (tagStartIndex !== -1) {
					labelString = this.datalabel.substring(0, tagStartIndex);
				}
				
				labelString += '...';
			}
		}
		
		
		

		this.$.dynamicdata.innerHTML = labelString;
	}
});