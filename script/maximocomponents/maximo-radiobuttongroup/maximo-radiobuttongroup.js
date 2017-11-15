/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-radiobuttongroup>` element. Displays a list of radio buttons.

Example:
```html
	<maximo-radiobuttongroup items="{{data}}" attribute="myBoolean" label-attribute="description">
	</maximo-radiobuttongroup>
```

### Accessibility
&#8593; / &#8592; Select previous node.<br>
&#8595; / &#8594; Select next node.<br>

@demo

*/

Polymer({
	is: 'maximo-radiobuttongroup',
  	behaviors: [BaseComponent,ArrowKeys],
  	listeners: {
  		'radio-button-selection-changed': '_select',
  	},
	properties : {
		/** Attribute to use for boolean to determine if checked */
		attribute: {
			type: String,
			value: '',
			notify: true
		},
		/** Attribute to use for radio labels*/
		labelAttribute: {
			type: String,
			value: ''
		},
		/** Attribute to use for hidden button*/
		hiddenAttribute: {
			type: String,
			value: '',
			notify: true
		},
		/** Data from which to build the group */
		items: {
			type: Array
		},
		/** Display horizontally */
		horizontal: {
			type: Boolean,
			value: false
		},
		_checkedButton: {
			type: Object
		},
		_arrowKeyInfo: {
			type: Object,
			value: function(){
				return {'selector':'div[role=radio]','click':true};
			}
		}
	},
  	_getClassName: function(){
  		return this.horizontal?'wrapper horizontal':'wrapper';
  	},
  	_getChecked: function(record){
  		return (record[this.attribute] === true);
  	},
  	_getHidden: function(record){
  		if(record[this.hiddenAttribute] === undefined)
  		{
  			return false;
  		}
  		return record[this.hiddenAttribute];
  	},
  	_getLabel: function(record){
  		return record[this.labelAttribute];
  	},
  	_getTabIndex: function(record){
		if(this.domHost.tagName !== 'MAXIMO-RADIOBUTTONGROUP'){
			return '0';
		}
  		return this._getChecked(record)==='true'?'0':'-1';
  	},
  	_select: function(e){
  		if(e.detail.groupId === this.id){
	  		var target = e.detail.event.currentTarget; 
	  		if($j(target).attr('aria-readonly')===undefined){
	  			var rbg = this;
	  			$j(this.$.wrapper).find('maximo-radiobutton	').each(function(){
	  				this.removeAttribute('checked');
	  			});
	  			target.parentNode.setAttribute('checked','true');
	  			var item = this.$.radioRepeater.itemForElement(target);
	  			var index = this.$.radioRepeater.indexForElement(target);
	  			this.items.forEach(function(record){
	  				record[rbg.attribute] = record.href===item.href;
	  			});
	  			this.fire('radio-button-selected', {'group': this, 'item': item, 'index': index});
	  		}
  		}
  	},
  	_getId: function(record){
  		return this.id + (record.href?'_'+record.href:'');
  	},
	_applyTemplateIDs: function(){
		//override to do nothing
	}
});