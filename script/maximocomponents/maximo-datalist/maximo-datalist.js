/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-datalist>` element. A navigabledisplay of data. Supports a display attributes and a children attribute.
Can display flat or hierachical data.

Example:
```html
	<maximo-datalist id="dd_datalist" multi-select="true" drag-target="[[getLocalObject('dd_datalist1')]]" 
	display-attributes="upperattribute,description" items='[[flatData]]' multi-select></maximo-datalist>
```

### Accessibility
&#8593; / &#8595; Move focus between visible nodes.<br>
&#8592; Closes an open node or moves focus to the node's parent if already closed.<br>
&#8594; Expands a closed node or moves focus to the node's first child if already open.<br>
Enter selects an item. 

@demo
*/

Polymer({
	is : 'maximo-datalist',
	properties : {
		label : {
			type : String,
			value : ''
		},
		/** data object array */
		items: {
			type: Array,
			value: [],
			observer: '_render'
		},
		/** Attribute that displays for each line */
		displayAttributes: {
			type: String,
			value: '',
			notify: true
		},
		/** Attribute that store icon name for element */
		iconAttribute: {
			type: String,
			value: null
		},
		/** Attribute that stores children at each level */
		childAttribute: {
			type: String,
			value: null
		},
		/** Height of component */
		height: {
			type: String,
			value: '400px'
		},
		/** Width of component */
		width: {
			type: String,
			value: '300px'
		},
		/** Event to fire when selecting element. */
		selectEvent: {
			type: String,
			value: null
		},
		/** Event to fire to remove selected elements. */
		removeEvent: {
			type: String,
			value: null
		},
		/** Event to fire to edit an item. */
		editEvent: {
			type: String,
			value: null
		},
		/** Expand entire datalist upon load. */
		expandAll: {
			type: Boolean
		},
		/** Select first entry upon load. */
		stopInitialSelection: {
			type: Boolean,
			value: false
		},
		/** Select more than one at a time. */
		multiSelect: {
			type: Boolean
		},
		/** Set target for drag events and enables dragging of elements */
		dragTarget: {
			type: Object,
			value: null
		},
		/** Sets allowed source for drop elements and configures drop events. */
		dropSource: {
			type: Object,
			value: null
		},
		/** Event to call on container with list of added records. */
		addEvent: {
			type: String,
			value: null
		},
		/** allows override of add icon for directionality. */
		addIcon: {
			type: String
		},
		numbered: {
			type: String
		},
		/** Allow reordering */
		reorder: {
			type: Boolean,
		},
		/** Event to call when reordering within. Enables local drag/drop. */
		reorderEvent: {
			type: String,
		},
		/** Custom toolbar buttons to add to items */
		customToolbarButtons: {
			type: Array,
			value: function(){
				return [];
			}
		},
		/** Shows info icon on items and sets event to fire. */
		iteminfoEvent: {
			type: String
		},
		maintainUserChanges: {
			type: Boolean,
			value: false
		},
		_hideTopBottom: {
			type: Boolean,
			value: false
		},
		_selectedMap: {
			type: Object,
			value: {}
		},
		_selectedRecords: {
			type: Object,
			value: []
		},
		_expanded: {
			type: Object,
			value: function(){
				return {};
			}
		},
		_scrollTop: {
			type: Number,
			value: 0
		}
	},
	/**
	 * @polymerBehavior 
	 */
	behaviors : [ BaseComponent, LoadingComponent],
	ready: function(){
		this._itemToolbarButtons = [];
		/** Stores index for drag/drop operations */
		this._datalistIndex = 0;
	},
	attached: function(){
		$j(this.$.datalist).css({'width':this.width,'height':this.height});
		this.async(function(){
			if(this.reorderEvent || this.reorder){
				$j(this.$.controls).css({'height':this.height});
				var controlWrapper = $j(this.$.controls).children().first();
				var buttonCount = $j(controlWrapper).find('maximo-button:not([hidden])').length + 1;
				var buttonHeight = buttonCount*25;
				controlWrapper.css({'margin-top':($j(this.$.controls).height()/2 - buttonHeight/2 + 'px')});
				if(parseInt(this.height)<buttonHeight){
					this._hideTopBottom = true;
					buttonHeight = (buttonCount - 2)*25;
					controlWrapper.css({'margin-top':($j(this.$.controls).height()/2 - buttonHeight/2 + 'px')});
				}
			}
			else {
				$j(this.$.controls).css({'display':'none'});
			}
		});
		this.initialized = true;
		if(!this.initialRender){
			this.refresh();
		}
		this._bindContainerDropEvents();
		this.supportsPassive = false;
		var datalist = this;
		try {
			var opts = Object.defineProperty({}, 'passive', {
		    get: function() {
		    	datalist.supportsPassive = true;
		    }
		  });
		  window.addEventListener('test', null, opts);
		} catch (e) {}
	},
	/** Force a refresh of datalist */
	refresh: function(){
		if(this.initialized){
			this.toggleBlur(true);
			this._render(this.items);
		}
	},
	_error: function(message){
		var span = this._createElement('span');
		$j(this.$.datalist).append($j(span).toggleClass('error',true).text(message));
	},
	_render: function(newValue) {
		if(!this.initialized){
			return;
		}
		this.initialRender = true;
		if(this.multiSelect || (this.maintainUserChanges && Object.keys(this._selectedMap).length>0)){
			this.stopInitialSelection = true;
		}
		if(this.reorderEvent || this.reorder){
			if(!this.dropSource){
				this.dropSource = this;
			}
			if(!this.dragTarget){
				this.dragTarget = this;
			}
		}
		//$j(this.$.datalist).empty();
		$j(this.$.datalist).find('ul').remove();
		$j(this.$.info).css({'display': !this.items || this.items.length===0?'block':'none'});
		if(!this.items || this.items.length===0){
			this._showNoRecords();
			this.toggleBlur(false);
			return;
		}
		this._datalistIndex = 0;
		this._addLevel(0, this.$.datalist, newValue);
		if(this.expandAll){
			this._toggleExpandAll(true);
		}
		else {
			if(this.items.length===1){
				this._toggleExpandItem($j(this.$.datalist).find('li').first()[0]);	
			}
		}
		if(this.stopInitialSelection!==true && this.selectEvent){
			var element = $j(this.$.datalist).find('li').first()[0];
			if(element){
				this._selectElement(element, true);
			}
		}
		this._colorElements();
		this.fire('datalist-refreshed', this);
		if(this.maintainUserChanges){
			var dataList = this;
			var temp = JSON.parse(JSON.stringify(this._expanded));
			$j(this.$.datalist).toggleClass('notransition',true);
			Object.keys(temp).forEach(function(key){
				dataList._toggleExpandItem($j('#'+key)[0], true);
			});
			Object.keys(this._selectedMap).forEach(function(selectedIndex){
				dataList._selectElement($j(dataList.$.datalist).find('li')[selectedIndex], true);
			});
			$j(this.$.datalist).toggleClass('notransition',false);
			this.$.datalist.scrollTop = this._scrollTop;
		}
		else {
			this.clearSelected();
		}
		this.toggleBlur(false);
	},
	resetUserChanges : function(){
		this._expanded = {};
		this.clearSelected();
		this._scrollTop = 0;
	},
	_addLevel: function(level, parent, levelItems){
		//If this changes to be more dynamic, we will have to be sure to fix datalist-index on all elements when levels are added. Will also have to re-color. 
		if(parent && levelItems && levelItems.length>0){
			level++;
			var datalist = this;
			var ul = datalist._createElement('ul');
			$j(ul).attr({'role':(parent === datalist.$.datalist)?'tree':'group'});
			levelItems.forEach(function(item){
				datalist._addItem(level, ul, item);
			});
			$j(parent).append(ul);
		}
	},
	_addItem: function(level, parent, item){
		var datalist = this;
		if(item.datalistVisible === false){
			datalist._datalistIndex++;
			return;
		}
		var hasChildren = datalist.childAttribute!==null && item[datalist.childAttribute] && item[datalist.childAttribute].length>0;
		var li = datalist._createElement('li',{'class':'datalistItem'});
		var href = item.href;
		if(item._id){
			href = item._id; 
		}
		else {
			if(item.href && item.href.indexOf('/')>0){
				href = item.href.substring(item.href.lastIndexOf('/')+1, item.href.length);
			}
		}
		$j(li).attr({'id': datalist.id+'_'+href, 'datalist-index': datalist._datalistIndex, 'aria-level': level, 'role':'datalistitem','tabindex':datalist._datalistIndex===0?'0':'-1'});
		item.__itemIndex__ = datalist._datalistIndex;
		li.item = item;
		datalist._datalistIndex++;
		this.listen(li, 'keydown', '_keyHandler');

		var label = datalist._createElement('label');
		var numDiv = datalist._createElement('div',{'class':'index'});
		var widthAttrContainer = 0;
		
		//if item is marked as required and its not a group header, set required attr.
		if(item._required && !item.children){
			$j(li).attr('required','');
			widthAttrContainer +=5.2;
		}
		
		if(this.numbered !==undefined ){
			$j(numDiv).html(datalist._datalistIndex+'.');
			$j(label).append(numDiv);
		}
		if(this.multiSelect){
			var checkbox = datalist._createElement('maximo-checkbox');
			$j(label).append(checkbox);
			$j(checkbox._getCheckbox()).attr({'tabindex':'-1'});
			$j(checkbox._getCheckbox()).on('click', function(e){
				datalist._selectElement(li, checkbox.checked);
				e.stopPropagation();
			});
			$j(checkbox._getCheckbox()).on('keydown', function(e){
				if(e.keyCode === $M.keyCode.ENTER){
					checkbox.checked = !checkbox.checked; 
					datalist._selectElement(li, !checkbox.checked);
					e.stopPropagation();
				}
			});
		}
		

		$j(li).append(label);
		var padding = ((level-1)*27);
		if(level===1){
			padding = 10;
		}else{
			widthAttrContainer +=2.5;
		}
		
		if(!hasChildren && datalist.childAttribute!==null){
			padding += 16;
		}
		if(datalist.displayAttributes===undefined){
			this._error('No attributes defined.');
			return;
		}
		var attributes = datalist.displayAttributes.split(',');

		var attrContainer =  datalist._createElement('div');
		
		
		attributes.forEach(function(attribute){
			var attrDiv = datalist._createElement('div',{'class':'datalistAttribute','data-attribute':attribute});
		
			var value = attribute===''?item:item[attribute];
			if(!value || value.length===0){
				value='&nbsp;';
			}
			$j(attrDiv).html(value);
			$j(attrContainer).append(attrDiv);
		});
		$j(label).append(attrContainer);
		
		//Append icon if exist
		if (this.iconAttribute && item.hasOwnProperty(this.iconAttribute) && item[this.iconAttribute]) {
			var icon =  datalist._createElement('iron-icon',{'icon': item[this.iconAttribute], 'class': 'dataicon' });
			var attrIconContainer =  datalist._createElement('div');
			$j(attrIconContainer).append(icon);
			$j(label).append(attrIconContainer);
			widthAttrContainer += 30;
			attrIconContainer.style.cssText = 'width:'+widthAttrContainer+'px;';
//			$j(label).css('padding-'+($M.dir==='rtl'?'left':'right'),'10px');
		} 
		

		$j(label).css('padding-'+($M.dir==='rtl'?'right':'left'),padding+'px');
		if(hasChildren){
			$j(li).attr({'aria-expanded':'false','parent':true});
			datalist._expandListItem(this, false);
			var span = datalist._createElement('span');
			var chevron = datalist._createElement('iron-icon');
			chevron.icon = 'chevron-right';
			$j(span).append(chevron);
			$j(label).prepend(span);
			this.listen(span, 'tap', '_toggleExpandItem');
			datalist._addLevel(level, li, item[datalist.childAttribute]);
			widthAttrContainer += 16;
		}
		
		attrContainer.style.cssText = ' min-width: calc(100% - '+widthAttrContainer+'px); max-width: calc(100% - '+widthAttrContainer+'px);';
		
		$j(parent).append(li);

		if(this.dragTarget!==null){
			this._bindDragEvents(li);
		}
		if(this.dropSource!==null){
			this._bindDropEvents(li);
		}
		datalist._addItemToolbar(li);
		if(datalist.multiSelect || datalist.selectEvent || datalist.removeEvent || datalist.dragTarget){
			$j(li).on('mouseup', function(e){
				if(!datalist.dragging){
					datalist._select(e);
					datalist._fixToolbarColor(li);
					datalist.clickTimer = null;
					e.stopPropagation();
				}
			});
		}
		$j(li).on('mousemove', function(e){
			if(datalist.hovered && datalist.hovered !== label){
				datalist.hovered.toggleClass('hovered', false);
			}
			//$j(li).focus();
			datalist.hovered = $j(label);
			$j(label).toggleClass('hovered', true);
			$j(e.currentTarget).toggleClass('hovered', true);
			datalist._fixToolbarColor(li);
			e.stopPropagation();
		});
		$j(li).on('mouseleave', function(e){
			if(datalist.hovered){
				datalist.hovered.toggleClass('hovered', false);
			}
			$j(e.currentTarget).toggleClass('hovered', false);
			$j(label).toggleClass('hovered', false);
			datalist._fixToolbarColor(li);
			e.stopPropagation();
		});
	},
	_buildGradient: function(colorHex){
		if(!colorHex || colorHex==='transparent'){
			return 'transparent';
		}
		colorHex = colorHex.replace('rgba(','').replace('rgb(','').replace(')',''); 
		var rgb = colorHex.indexOf(',')>0?colorHex:$M.hexToRgb(colorHex);
		rgb = rgb.replace(/ /g, '');
		var gradient = 'linear-gradient(to right, rgba(RGBREP,0) 0%,rgba(RGBREP,0) 2%,rgba(RGBREP,1) 15%,rgba(RGBREP,1) 100%)';
		if(rgb==='0,0,0,0'){
			return 'transparent';
		}
		gradient = gradient.replace(/RGBREP/g, rgb);
		return gradient;
	},
	addCustomToolbarButton: function(li, button, buttonIndex){
		button.customButton = true;
		return this._addToolbarButton(li,button, buttonIndex);
	},
	_addToolbarButton: function(li, button, buttonIndex){
		var datalist = this;
		if(!li.toolbar){
			li.toolbar = this._createElement('div',{'class':'toolbar','id':datalist.id+'_toolbar'});
			$j(li).append(li.toolbar);
		}
		var buttonElement =  datalist._createElement('button',{'id':li.id+'_toolbar_'+button.originalEvent,'class':button.class,'originalEvent':button.originalEvent,'tabindex':'0','buttonIndex':buttonIndex===-1?0:$j(li.toolbar).find('button').length});
		var icon = datalist._createElement('iron-icon',{'icon':button.icon});
		icon.setAttribute('icon',button.icon);
		buttonElement.selectMe = function(e, target, index){
			var eventData = [datalist.itemForElement(li)];
			if(datalist.dragTarget && button.event === datalist.dragTarget.addEvent){
				var eventIndex = index;
				if(index === undefined){
					eventIndex = -1;
				}
				datalist._selectElement(li, true);
				eventData = {'eventIndex': eventIndex, 'records': datalist.multiSelect?datalist._selectedRecords:[datalist._selectedRecords.pop()]};
			}
			if(button.event === datalist.editEvent || button.event === datalist.iteminfoEvent || button.customButton===true){
				eventData = {'item': li, 'record': datalist.itemForElement(li), 'button':e.currentTarget};
			}
			if(button.event === datalist.iteminfoEvent){
				datalist.async(function(){
					target.fire(button.event, eventData);
				},300);
			}
			else {
				target.fire(button.event, eventData);
			}
		};
		$j(buttonElement).on('keydown',function(e){
			var target = button.eventTarget?button.eventTarget:datalist;
			if($j(e.currentTarget).attr('originalEvent')==='reorder'){
				if(e.keyCode === $M.keyCode.UP){
					buttonElement.selectMe(e, target, -1);
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.keyCode === $M.keyCode.DOWN){
					buttonElement.selectMe(e, target,1);
					e.preventDefault();
					e.stopPropagation();
				}
				datalist.async(function(){
					datalist._selectElement($j('#'+e.currentTarget.id).parent().parent()[0], true);
					$j('#'+e.currentTarget.id).focus();
				},100);
			}
			else {
				if(e.keyCode === $M.keyCode.ENTER){
					buttonElement.selectMe(e, target);
					e.preventDefault();
					e.stopPropagation();
				}
			}
		});
		$j(buttonElement).on('mouseup', function(e){
			var target = button.eventTarget?button.eventTarget:datalist;
			buttonElement.selectMe(e, target, $j(li).attr('datalist-index'));
		});
		$j(buttonElement).attr({'aria-label':button.title,'title':button.title});
		$j(buttonElement).append(icon);			
		if(buttonIndex===-1){
			$j(li.toolbar).prepend(buttonElement);
		}
		else {
			$j(li.toolbar).append(buttonElement);
		}
		this.async(function(){ //give time to render
			var liHeight = $j(li).height();
			var marginTop = liHeight-2;
			$j(li.toolbar).css({'margin-top':'-'+marginTop+'px'});
			$j(li.toolbar).find('iron-icon').css({'max-height':(liHeight-8)+'px','height':(liHeight-8)+'px'});
		});
		if(button.hover){
			$j(buttonElement).on('mouseenter', function(e){
				if(buttonElement.hoverTimer){
					window.clearTimeout(buttonElement.hoverTimer);
				}
				$j(buttonElement).one('mouseleave', function(){
					if(buttonElement.hoverTimer){
						window.clearTimeout(buttonElement.hoverTimer);
					}
					$M.tooltip.hide();
				});
				buttonElement.hoverTimer = setTimeout(function(){
					buttonElement.selectMe(e, datalist, -1);
					if(buttonElement.hoverTimer){
						window.clearTimeout(buttonElement.hoverTimer);
					}
				}, 50);
			});
		}
		return buttonElement;
	},
	_addItemToolbar: function(li){
		if(!this.toolbarInited){
			if(this.iteminfoEvent){
				//cannot show info icon. only base icon sets 
				this._itemToolbarButtons.push({'class':'toolbar','hover':true,'originalEvent':'info','event':this.iteminfoEvent,'icon':'action-based:get-information'});
			}
			if(this.removeEvent){
				this._itemToolbarButtons.push({'class':'toolbar','originalEvent':'remove','event':this.removeEvent,'icon':'action-based:trash','title':$M.localize('uitext','mxapibase','remove')});
			}
			if(this.editEvent){
				this._itemToolbarButtons.push({'class':'toolbar','originalEvent':'edit','event':this.editEvent,'icon':'action-based:edit','title':$M.localize('uitext','mxapibase','edit')});
			}
			if(this.dragTarget && this.dragTarget !== this && !$M.touch && this.addIcon){
				this._itemToolbarButtons.push({'class':'toolbar','originalEvent':'add','event':this.dragTarget.addEvent,'eventTarget':this.dragTarget,'icon':this.addIcon?this.addIcon:'arrow-forward','title':$M.localize('uitext','mxapibase','select	')});
			}
			this.toolbarInited = true;
		}
		if(this._itemToolbarButtons.length>0){
			var datalist = this;
			this._itemToolbarButtons.forEach(function(button){
				datalist._addToolbarButton(li, button);
			});
			$j(li).append(li.toolbar);
			$j(li).on('focus', function(){
				datalist._fixToolbarColor(li);
			});
			this.async(function(){ //give time to render
				var liHeight = $j(li).height();
				var marginTop = liHeight-2;
				$j(li.toolbar).css({'margin-top':'-'+marginTop+'px'});
				$j(li.toolbar).find('iron-icon').css({'max-height':(liHeight-8)+'px','height':(liHeight-8)+'px'});
			},100);
			return li.toolbar;
		}
	},
	_drop: function(e){
		var datalist = this;
		e.preventDefault();
		$j(e.target).toggleClass('dropTargetTop', false);
		$j(e.target).toggleClass('dropTargetBottom', false);
		$j(e.currentTarget).toggleClass('dropTarget', false);
		var records;
		if(e.originalEvent.dataTransfer){
			records = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
		}
		else {
			records = datalist.dropSource.getDropData();
		}
		var event = datalist.addEvent;
		if(!datalist.dropSource.dragging){
			datalist.dragging = false;
			datalist._move(datalist.dropIndex?datalist.dropIndex:0);
			return;
		}
		else {
			datalist.fire(event, {'eventIndex': datalist.dropIndex?datalist.dropIndex:0, 'records':records});
		}
		$j(datalist.$.datalist).find('.datalistItem').last().toggleClass('dropTargetLast', false);
		if(!datalist.dropSource.dragging){
			datalist.clearSelected();
		}
		if(datalist.addEvent===undefined){
			console.log('Add event not defined for datalist['+datalist.id+']');
		}
		if(datalist.dropSource){
			datalist.dropSource.dragging = false;
		}
	},
	_bindContainerDropEvents: function(){
		if(!this.containerDropEvents && this.dropSource !== null){
			var datalist = this;
			$j(datalist.$.datalist).on('drop', function(e){
				datalist._drop(e);
			});
			$j(datalist.$.datalist).on('dragover', function(e){
				if(datalist.dropSource.dragging === true){
					var last = $j(datalist.$.datalist).find('.datalistItem').last();
					if(last.length<0){
						last.toggleClass('dropTargetLast', true);
					}
					else {
						
					}
					e.preventDefault();
				}
			});
			$j(datalist.$.datalist).on('dragenter', function(e){
				$j(e.currentTarget).toggleClass('dropTarget', true);
				e.stopPropagation();
			});
			$j(datalist.$.datalist).on('dragleave', function(e){
				$j(e.currentTarget).toggleClass('dropTarget', false);
				$j(datalist.$.datalist).find('.datalistItem').last().toggleClass('dropTargetLast', false);
				e.stopPropagation();
			});
			$j(datalist.$.datalist).on('dragend', function(e){
				$j(datalist.$.datalist).find('.datalistItem').last().toggleClass('dropTargetLast', false);
				datalist.async(function(e){
					datalist.dragging = false;
					if(datalist.dropSource){
						datalist.dropSource.dragging = false;
					}
				},100);
			});
			this.containerDropEvents = true;
		}
	},
	_bindDropEvents: function(element){
		var item = $j(element);
		var datalist = this;
		datalist.itemDragOver = function(e){
			var target = e.currentTarget;
			var offsetX = e.offsetX;
			var offsetY = e.offsetY;
			if((datalist.dropSource && datalist.dropSource.dragging === true) || (datalist.reorder || datalist.reorderEvent !== undefined && datalist.dragging === true)){
				datalist.dropIndex = parseInt($j(target).attr('datalist-index'));
				if(offsetY>$j(target).height()/2){
					datalist.dropIndex++;
				}
				console.log(datalist.dropIndex);
				$j(target).toggleClass('dropTargetBottom', offsetY<=$j(target).height()/2);
				
				var diff = ($j(target).position().top + $j(target).height()) - $j(datalist.$.datalist).height() - datalist.$.datalist.scrollTop;
				if(diff>0){
					datalist.$.datalist.scrollTop += diff + $j(target).height()/4 ;
				}
				else if($j(target).prev() && ($j(target).prev().position().top < datalist.$.datalist.scrollTop)){
					this.async(function(){
						datalist.$.datalist.scrollTop = $j(target).prev().position().top;						
					}, 100);
				}
						
				var last = $j(datalist.$.datalist).find('.datalistItem').last();
				if(last[0] && last[0] === $j(target)[0]){
					if(offsetY>$j(target).height()/2){
						last.toggleClass('dropTargetTop', false);
						last.toggleClass('dropTargetLast', true);
						last.one('dragleave', function(e){
							last.toggleClass('dropTargetLast', false);		
						});
					}
					else {
						last.toggleClass('dropTargetLast', false);
					}
				}
				else {
					$j(target).toggleClass('dropTargetTop', offsetY>$j(target).height()/2);
				}
				return true;
				//e.stopPropagation();
			}
			return false;
		};
		if(item.attr('drag-enabled') === undefined){
			if(this.dropSource === this){
				item.on('drop', function(e){
					e.preventDefault();
					$j(e.currentTarget).toggleClass('dropTargetTop', false);
					$j(e.currentTarget).toggleClass('dropTargetBottom', false);
					datalist.fire(datalist.addEvent, {'eventIndex': datalist.dropIndex?datalist.dropIndex:-1, 'records': datalist._selectedRecords});
				});
			}
			item.on('dragenter', function(e){
				e.stopPropagation();
			});
			item.on('dragover', function(e){
				if(datalist.itemDragOver(e)){
					e.preventDefault();
					e.stopPropagation();
				}
			});
			item.on('dragleave', function(e){
				datalist.dropIndex = -1;
				$j(e.currentTarget).toggleClass('dropTargetTop', false);
				$j(e.currentTarget).toggleClass('dropTargetBottom', false);
				e.stopPropagation();
			});
			item.attr('drag-enabled', 'true');
		}
	},
	_bindDragEvents: function(element){
		var datalist = this;
		$j(element).attr({'draggable':'true'});
		$j(datalist.$.datalist).on('contextmenu', function(e){
			e.preventDefault();
			e.stopPropagation();
		});

		if(this.dragTarget && this.dragTarget.addEvent){
			$j(element).on('dblclick', function(e){
				datalist.dragTarget.fire(datalist.dragTarget.addEvent, {'eventIndex': -1, 'records': [datalist.itemForElement(e.currentTarget)]});
			});
		}
		$j(element).on('dragstart', function(e){
			var selected = $j(e.currentTarget).attr('aria-selected')==='true';
			if(e.shiftKey || e.ctrlKey){
				if(selected){
					datalist._selectElement(e.currentTarget, true);
				}				
			}
			else {
				if(!selected){
					datalist._select(e);
				}
			}
			datalist.dragging = true;
			e.originalEvent.dataTransfer.setData('application/json', JSON.stringify(datalist._selectedRecords));
			e.originalEvent.dataTransfer.effectAllowed = 'copy';
		});
		$j(element).on('dragend', function(e){
			datalist.dragging = false;
		});
		var ts;
		element.addEventListener('touchstart', function(e){
			//datalist._select(e);
			ts = e.touches[0].clientY;
			if(!e.currentTarget.longTapTimeout && !e.currentTarget.longTapped){
				e.currentTarget.longTapped = true;
				e.currentTarget.longTapTimeout = window.setTimeout(function(){
					if(!datalist.dragging){
						if(datalist.multiSelect===true){
							var multi = $j(datalist.$.datalist).attr('multi') === 'true';
							if(multi){
								datalist.clearSelected();
							}
							else {
								datalist._select(e);
							}
							$j(datalist.$.datalist).attr({'multi':!multi});
						}
						datalist.dragging = true;
					}
				},300);
			}
		}, datalist.supportsPassive ? { passive: true } : false); 
		$j(element).on('touchmove', function(e){
			if(true === datalist.dragging){
				if(datalist.dragItem){
					datalist.dragItem.css({'position':'absolute','left':datalist._getCoords(e)[0]+'px','top':datalist._getCoords(e)[1]+'px'});
				}
				return;
			}
			if(e.shiftKey){
				datalist._select(e);
			}
			else if(e.ctrlKey){
				var selected = $j(e.currentTarget).attr('aria-selected')==='true';
				if(!selected){
					datalist._selectElement(e.currentTarget, true);
				}
			}
			if(!datalist.dragItem){
				datalist.dragItem = $j(e.currentTarget).clone();
				$j(datalist.dragItem).css({'background-color':'#7cc7ff'});
				$j('body').append(datalist.dragItem);
			}
			datalist.dragItem.css({'position':'absolute','left':datalist._getCoords(e)[0]+'px','top':datalist._getCoords(e)[1]+'px'});
			datalist.dragging = true;
		});
		$j(element).on('touchend', function(e){
			if(e.currentTarget.longTapTimeout){
				window.clearTimeout(e.currentTarget.longTapTimeout);
				e.currentTarget.longTapTimeout = null;
			}
			delete e.currentTarget.longTapped;
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			if(datalist.dragItem){
				$j(datalist.dragItem).remove();
				datalist.dragItem = null;
			}
			var dropTarget = document.elementFromPoint(touch.clientX,touch.clientY);
			if(datalist.dragTarget === dropTarget){
				datalist.dragTarget._drop(e);
				//datalist.clearSelected();
			}
			else if(datalist.dragTarget.contains(dropTarget)){
				var index = $j(dropTarget).attr('datalist-index');
				datalist.dragTarget.fire(datalist.dragTarget.addEvent, {'eventIndex': index?index:-1, 'records': datalist._selectedRecords});
				//datalist.clearSelected();
			}
			datalist.dragging = false;
		});
	},
	_getCoords: function(e) {
		var coords = [];
		e = e.originalEvent?e.originalEvent:e;
		if (e.touches && e.touches.length) { 	// iPhone
			coords[0] = e.touches[0].clientX;
			coords[1] = e.touches[0].clientY;
		} else { 								// all others
			coords[0] = e.clientX;
			coords[1] = e.clientY;
		}
		return coords;
	},
	_createElement: function(def, props){
		var element = document.createElement(def);
		$j(element).attr({'class': 'style-scope maximo-datalist '+$M.dir});
		if(props!==undefined){
			if(props['class']!==undefined){
				$j(element).toggleClass(props['class'], true);
			}
			for(var key in props){
				if(props.hasOwnProperty(key) && key !== 'class'){
					$j(element).attr(key, props[key]);
				}
			}
		}
			
		return element;
	},
	_keyHandler: function(e){
		if(!e.target || $j(e.target).attr('contentEditable')==='true'){
			event.stopPropagation();
			return;
		}
		var li = e.currentTarget;
		var span = li.firstElementChild.firstElementChild;
		var expanded = $j(li).attr('aria-expanded')==='true';
		var _datalistIndex = parseInt($j(li).attr('datalist-index'));
		var stop = false;
		var move = 0;
		var keyCode = e.keyCode;
		if($M.dir==='rtl'){ //SWITCH RIGHT AND LEFT FOR BIDI
			if(keyCode === $M.keyCode.LEFT){
				keyCode = $M.keyCode.RIGHT;
			}
			else if(keyCode === $M.keyCode.RIGHT){
				keyCode = $M.keyCode.LEFT;
			}
		}
		switch(keyCode){
		case $M.keyCode.ENTER:
			//$j(li).trigger('click');

			this._select(e);
			stop = true;
			break;
		case $M.keyCode.LEFT:
			stop = true;
			if(expanded){
				$j(span).trigger('click');
			}
			else {
				move = -1;
			}
			break;
		case $M.keyCode.UP:
			stop = true;
			move = -1;
			break;
		case $M.keyCode.RIGHT:
			stop = true;
			if((e.ctrlKey || e.shiftKey) && this.dragTarget && this.dragTarget.addEvent && this._selectedRecords.length>0){
				this.fire(this.dragTarget.addEvent, {'eventIndex': -1, 'records': this._selectedRecords});
			}
			else {
				if(!expanded){
					$j(span).trigger('click');
					$j(li).focus();
				}
				else {
					move = 1;
				}
			}
			break;
		case $M.keyCode.DOWN:
			stop = true;
			move = 1;	
			break;
		case $M.keyCode.DELETE:
			if(this.removeEvent){
				if(this._selectedRecords.length>0){
					this.fire(this.removeEvent, this._selectedRecords);
					var datalist = this;
					this.async(function(){
						datalist._focus(_datalistIndex, 1, true);
					},200);
				}
			}
			break;
		}
		if(move !== 0){
			var newli = this._focus(_datalistIndex, move);
			if(newli && e.target !== e.currentTarget && e.target.tagName === 'BUTTON'){
				var buttonIndex = $j(e.target).attr('buttonIndex');
				if(buttonIndex !== undefined){
					this.clearSelected();
					this._selectElement(newli[0],true);
					this.async(function(){
						var button = newli.find('button[buttonindex='+buttonIndex+']').first();
						button.focus();
					});
					
				}
			}
		}
		if(stop){
			event.stopPropagation();
			event.preventDefault();
		}
	},
	_focus: function(_datalistIndex, move, wrap){
		var next;
		do{
			_datalistIndex = _datalistIndex+move;
			next = $j(this.$.datalist).find('li[datalist-index='+_datalistIndex+']').first();
		}
		while(next.length===1 && next.css('display')==='none');
		if(next[0]){
			next.focus();
		}
		else if(wrap !== undefined && wrap === true){
			this._focus(-1, 1);
		}
		return next;
	},
	_toggleExpandItem: function(eventOrItem, expanded){
		var li = eventOrItem.currentTarget?eventOrItem.currentTarget.parentElement.parentElement:eventOrItem;
		var ul = $j(li).children().last();
		if(ul.length===1){
			var expand = false;
			if(expanded !== undefined && typeof expanded === 'boolean'){
				expand = expanded;
			}
			else {
				expand = $j(li).attr('aria-expanded')!=='true';
			}
			$j(li).attr({'aria-expanded': expand});
			this._expandListItem(li, expand);
		}
		this._colorElements();
		if(eventOrItem.stopPropagation){
			eventOrItem.stopPropagation();
		}
	},
	_scrolled: function(e){
		this._scrollTop = e.currentTarget.scrollTop;
	},
	_expandListItem:function(li, expand){
		if(expand){
			this._expanded[li.id] = true;
		}
		else if(this._expanded[li.id]){
			delete this._expanded[li.id];
		}
	},
	_select: function(e){
		if(e.stopPropagation){
			e.stopPropagation();
		}
		var oldSelection = this.lastSelected;
		var element = e.currentTarget?e.currentTarget:e.target;
		var done = false;
		if(this.multiSelect!==true || $j(this.$.datalist).attr('multi')!=='true'){
			//this._selectElement(e.currentTarget, $j(e.currentTarget).attr('aria-selected') !== 'true');
		//}
			if((!oldSelection || !this.multiSelect || !e.detail || !e.shiftKey) && (!e.keyCode || !e.shiftKey) ){
				//single change
				var wasSelected = $j(element).attr('aria-selected') === 'true' && (this._selectedRecords.length===1 || e.ctrlKey);
				if(e.detail && e.ctrlKey && this.multiSelect === true){
					this._selectElement(element, !wasSelected);
				}
				else {
					this.clearSelected();
					this._selectElement(element, !this.stopInitialSelection?true:!wasSelected);	
				}
				done= true;
			}
		}
		if(!done){
			if(e.shiftKey){
				this.clearSelected();
				if(oldSelection){
					var oldIndex = parseInt($j(oldSelection).attr('datalist-index'));
					var newIndex = parseInt($j(element).attr('datalist-index'));
					var start = oldIndex<newIndex?oldIndex:newIndex;
					var end = oldIndex<newIndex?newIndex:oldIndex;
					for(var itemIndex = start; itemIndex<=end;itemIndex++){
						var item = $j(this.$.datalist).find('li[datalist-index='+itemIndex+']')[0];
						if(item){
							this._selectElement(item, true);
						}
					}
					$j(this.lastSelected).focus();
					done= true;
				}
			}
			if(!done){
				this._selectElement(e.currentTarget, $j(e.currentTarget).attr('aria-selected') !== 'true');
			}
		}
	},
	/** clear all datalist selections */
	clearSelected: function(){
		var datalist = this;
		$j(this.$.datalist).find('li[aria-selected]').each(function(){
			//$j(this).removeAttr('aria-selected');
			//$j(this).find('label').first().attr({'selected':false});
			datalist._selectElement(this, false);
		});
		this.lastSelected = null;
		this._selectedMap = {};
		this._selectedRecords = [];
	},
	_selectElement: function(element, select){
		if(select === undefined){
			select = $j(element).attr('aria-selected') === undefined;
		} 
		$j(element).attr({'aria-selected':select});
		var label = $j(element).find('label');
		label.first().attr({'selected':select});
		var index = parseInt($j(element).attr('datalist-index'));
		if(select){
			if(!this._selectedMap.hasOwnProperty(index)){
				this._selectedMap[index] = this._selectedRecords.length;
				var record = this.itemForElement(element);
				record.__itemIndex__ = index; 
				this._selectedRecords.push(record);
				this.lastSelected = element;
			}
		}
		else {
			this._selectedRecords.splice(this._selectedMap[index], 1);
			var keys = Object.keys(this._selectedMap);
			var datalist = this;
			keys.forEach(function(key){
				if(parseInt(key)>index){
					datalist._selectedMap[key] = parseInt(datalist._selectedMap[key])-1; 
				}
			});
			delete this._selectedMap[index];
			this.lastSelected = element;
		}
		if(this.reorderEvent || this.reorder){
			this._enableOrderButtons();
		}
		this.fire(this.selectEvent, this);
//		var checkbox = $j(element).find('maximo-checkbox')[0];
//		if(checkbox){
//			checkbox.set('checked',select);
//		}
		this._fixToolbarColor(element);
	},
	_enableOrderButtons: function(){
		var enabled = this._selectedRecords.length > 0 && this._selectedRecords.length !== this.items.length;
		$j(this.$.controls).children().first().find('maximo-button').each(function(){
			if(enabled){
				$j(this).removeAttr('disabled');
			}
			else {
				$j(this).attr({'disabled':'true'});
			}
		});		
	},
	_fixToolbarColor: function(li){
		var label = $j(li).find('label');
		var toolbar = $j(li).find('.toolbar');
		if(toolbar){
			$j(toolbar).css({'background': this._buildGradient(label.css('background-color'))});
		}
	},
	_toggleExpandAll: function(expand){
		var dataList = this;
		$j(this.$.datalist).find('li').each(function(li){
			if($j(this).attr('aria-expanded')!==undefined){
				$j(this).attr({'aria-expanded':expand});
				dataList._expandListItem(this, expand);
			}
		});
		this._colorElements();
	},
	_colorElements: function(){
		var index = 0;
		$j(this.$.datalist).find('li').each(function(){
			if($j(this).css('display')!=='none'){
				$j(this).toggleClass('odd',index%2!==0);
				index++;
			}
		});
	},
	getDropData: function(){
		return this._selectedRecords;
	},
	/** Get the data element for an 'li' within the list. */ 
	itemForElement: function(element){
		return element.item;
	},
	_moveUp: function(e){
		this._reOrder('up');
	},
	_moveDown: function(e){
		this._reOrder('down');
	},
	_moveToTop: function(e){
		this._reOrder('top');
	},
	_moveToBottom: function(e){
		this._reOrder('bottom');
	},
	_findItem: function(href){
		var info;
		this.items.some(function(record, index){
			if(record.href===href){
				info = index;
				return true;
			}
		});
		return info;
	},
	_move: function(newIndex) {
		var datalist = this;
		//remove selected from the list
		var removedBefore = 0;

		var items = JSON.parse(JSON.stringify(this._selectedRecords));
		
		//reverse them so indexes don't have to be adjusted as we remove
		items.sort(function(a, b) {
			if(a.__itemIndex__ < b.__itemIndex__){ return 1; }
		    if(a.__itemIndex__ > b.__itemIndex__){ return -1; }
		    return 0;
		});
		
		items.forEach(function(selected){
			datalist.items.splice(selected.__itemIndex__, 1);
			if(selected.__itemIndex__<newIndex){
				removedBefore++;
			}
		});
		
		var added = 0;
		
		newIndex -= removedBefore;
		items.reverse().forEach(function(item){
			datalist.items.splice(newIndex+added, 0, item);
			added++;
		});
		datalist.refresh();

		var target = $j(datalist.$.datalist).find('li[datalist-index='+newIndex+']')[0];
		for(var select = 0; select<added; select++){
			datalist._selectElement(target, true);
			target = target.nextSibling;
		}
	},
	_reOrder: function(move) {
		//must go through each record in selected and move it individually. Use index of each to do the move in proper direction.
		var datalist = this;
		var added = 0;
		var tempSelected;
		if(move==='up' || move==='top' || move === 'bottom'){
			tempSelected = this._selectedRecords.sort(function(a, b) {
			 	if (a.__itemIndex__ > b.__itemIndex__) {
			 		return 1;
				}
			});
		}
		else {
			tempSelected = this._selectedRecords.sort(function(a, b) {
			 	if (a.__itemIndex__ < b.__itemIndex__) {
			 		return 1;
				}
			});
		}
		var moved = false;
		tempSelected.forEach(function(selected, index){
			var originalPointer = datalist._findItem(selected.href);
			var pointer = originalPointer;
			var offset = 0;
			if(pointer !== undefined){
				switch(move){
					case 'up':
						if(pointer === 0){
							return;
						}
						pointer = pointer - 1;
						if(tempSelected.length > 1){
							offset = 0;
						}
						break;
					case 'top':
						if(pointer === 0){
							return;
						}

						pointer = added;
						break;
					case 'down':
						if(pointer >= datalist.items.length - 1){
							return;
						}
						pointer = pointer + 1;
						break;
					case 'bottom':
						if(pointer >= datalist.items.length - 1){
							return;
						}
						pointer = datalist.items.length - 1 + added;
						if(tempSelected.length > 1){
							offset = -1;
						}
						break;
				}
				var item = datalist.items.splice(originalPointer, 1)[0];
				datalist._selectedRecords[index].__itemIndex__ = pointer + offset;
				datalist.items.splice(pointer, 0, item);
				added++;
				moved = true;
			}
		});
		if(moved){
			var tempSelect = JSON.stringify(datalist._selectedRecords);
			this.refresh();
			tempSelect = JSON.parse(tempSelect);
			var lastElement;
			tempSelect.forEach(function(selected) {
				var selectedIndex = selected.__itemIndex__;
				$j(datalist.$.datalist).find('li').each(function(index){
					if(index === selectedIndex){
						datalist._selectElement(this, true);
						if((move === 'bottom') || !lastElement){
							lastElement = this;
						}
					}
				});
			});
			if(lastElement){
				var top = $j(lastElement).offset().top;
				var parentTop = $j(this.$.datalist).offset().top;
				if(top < parentTop || top > parentTop + $j(datalist.$.datalist).height()){
					var toTop = move=== 'up' || move ==='top';
					lastElement.scrollIntoView(toTop);
				}
			}
			if(this.reorderEvent){
				this.fire(this.reorderEvent, this);
			}
		}
	},
	/**
	 * select the given record in the list
	 */
	selectRecord: function(record) {
		this.clearSelected();
		var datalist = this;
		$j(this.$.datalist).find('li').each(function(index){
			if (this.item === record) {
				datalist._selectElement(this, true);
			}			
		});
	},
	
	/**
	 * 	Display no records image and text
	 */
	_showNoRecords: function () {
		
		var noRecordsNode = $j('<div id="dtListNoRecords">' +
								'<div id="dtlistDiv">' + 
									'<object data="images/bee-shadow-large.svg" type="image/svg+xml" style="padding-top: 20px;"></object>' +
								'</div>'+
								'<p id="dtListText" style="font-family:HelveticaNeue-Light-Italic;font-size:22px;">' + $M.localize('uitext','mxapibase','NoRecords') + '</p></div>');
		
//		$j( noRecordsNode ).addClass( 'noRecords' );
//		$j('p', noRecordsNode ).addClass( 'noRecords' );
		
		$j(this.$.info).html(noRecordsNode);
//		$j(this.$.info).text($M.localize('uitext','mxapibase','NoRecords'));
	}
});