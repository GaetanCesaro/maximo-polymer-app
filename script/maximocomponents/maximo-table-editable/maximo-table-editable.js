/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
`<maximo-table-editable>` element. A table display of data.

Example:
```html
	<maximo-table-editable 
			id="tableid" 
			collection="{{getLocalObject('collection_short')}}" 
			selected-index="[0]" 
			summary="demo table 1"
			columns='[{"attribute":"first_name","title":"First Name"},
					  {"attribute":"last_name"},{"attribute":"first_name","title":"First Name"},
					  {"attribute":"last_name"},{"attribute":"first_name","title":"First Name"},
					  {"attribute":"last_name"},{"attribute":"first_name","title":"First Name"},
					  {"attribute":"last_name"}]'>
	</maximo-table-editable>
```

### Accessibility
&#8593; or &#8592; Choose previous radio button(wraps to beginning)<br>
&#8595; or &#8594; Choose next radio button(wraps to end)

@demo

*/

Polymer({
	is: 'maximo-table-editable',
  	behaviors: [BaseComponent,TableComponent,LoadingComponent,LongPress],
  	listeners: {
  		'collection-data-refreshed':'_collectionDataRefreshed',
  		'collection-data-refresh-requested':'_startedRefresh',
  		'radio-button-selection-changed': '_radioButtonChanged',
  		'table-action': '_tableAction',
  		'table-action-allowed':'_tableActionAllowed',
  		'new-record-created':'_addTemplateRow'
  	},
	properties : {
		/** Column definitions passed as a property. This will take precedence over internal column definitions.  */
		columns: {
			type: Array,
			value: function(){
				return [];
			},
			notify:true,
			observer: '_fixColumnArray'
		},
		/** Collection to use for display data */
		collection: {
			type: Object,
			observer: '_setCollection'
		},
		/** data to display */
		items: {
			type: Array,
			value: function(){
				return [];
			}
		},
		/**
		 * Label to show in table toolbar 
		 */
		label: {
			type: String,
			value: ''
		},
		noSort: {
			type: Boolean,
			value: false
		},
		/**
		 * keep data in the collection. Editing the table with the data isolated will require manually updating the collection when commit is desired.
		 */
		collectionHoldsData: {
			type: Boolean,
			value: false
		},
		/** Summary to set on the table. This will give a summary of what this table shows and is required for accessibility. */
		summary: {
			type: String
		},
		/** Width to set on the table */
		width: {
			type: String,
			value: '100%'
		},
		/*
		 * Set entire table to readonly
		 */
		readonly: {
			type: Boolean,
			value: function(){
				return false;
			}
		},
		/** Select mode ('single' or 'multiple') */
		selectMode: {
			type: String,
			value: 'none',
			notify: true 
		},
		/**
		 * Show the filter row
		 */
		filterRow: {
			type: Boolean,
			value: false
		},
		/*
		 * Reorder the columns at runtime
		 */
		reorderColumns: {
			type: Boolean,
			value: function(){
				return true;
			}
		},
		/*
		 * Fix the data order 
		 */
		orderedData: {
			type: Boolean,
			value: false
		},
		/*
		 * Allow drag sorting of data rows. ordered-data must also be set.
		 */
		rowDropEvent: {
			type: String
		},
		selectOn: {
			type: Boolean,
			value: false,
			notify: true,
			observer: '_toggleSelectOn'
		},
		/**
		 * Allows setting of width, default is auto
		 */
		width: {
			type: String,
			value: 'auto'
		},
		/*
		 * Will keep selected mode from being turned off
		 */
		_selectAlwaysOn: {
			type: Boolean,
			value: false
		},
		/** Array of selected row index */
		_selectedIndexes: {
			type: Object,
			value: function(){
				return {};
			},
			observer: '_selectedChanged'
		},
		_loading: {
			type: Boolean,
			value: true
		},
		_noRecords: {
			type: Boolean,
			value: false
		},
		_tableDetails: {
			type: Object,
			value: null
		},
		_tableActions: {
			type: Object,
			value: null
		},
		_rowAttributes: {
			type: Object,
			value: function(){
				return {};
			}
		},
		_childColumns: {
			type: Array,
			value: function(){
				return [];
			},
			notify: true
		},
		_data: {
			type: Array,
			value: function(){
				return [];
			},
			notify: true
		},
		_tempData: {
			type: Array,
			value: function(){
				return [];
			},
			notify: true
		},
		_schema: {
			type: Object
		},
		_render: {
			type: Boolean,
			value: false
		},
		_selected: {
			type: Array,
			value: function(){
				return [];
			}
		},
		_externalTableEvents: {
			type: Object,
			value: function(){
				return {
					'table-insert':'_insertRecord',
					'new-record-created':'_addTemplateRow'
				};
			}
		}
	},
	bufferColumns: 4,
	_sortable: true,
	_returnFalse: function(){
		return false;
	},
	_applyTemplateIDs: function(){
		//override to do nothing
	},
	_addSchemaToColumns: function(){
  		var table = this;
  		if(table.collection){
	  		this._childColumns.forEach(function(column){
	  			if (column.dataAttribute !== undefined){
	  				var attr = column.dataAttribute.replace('_localized','');
	  				column.schema = table.collection.schema.properties[attr];
	  			} 
	  		});
  		}
	},
  	_setCollection: function(collection){
  		collection.addComponentListener(this, 'collection-data-refreshed');
  		collection.addComponentListener(this, 'collection-data-refresh-requested');
  	},
  	created : function(){
  		this._childColumnTemp = [];
  		this._rowAttributesTemp = {};
		var table = this;
		$j(this.childNodes).each(function(){
			var child = $j(this)[0];
			switch(child.tagName){
				case 'MAXIMO-TABLE-BODY':
					var col = {};
					$j(child).find('MAXIMO-TABLE-COLUMN').each(function(){
						var column = $j(this)[0];
						col = {};
						for (var index = 0; index < column.attributes.length; index++){
							var item = column.attributes.item(index);
							var name = item.name;
							col[table.replaceDash(name)] = item.value;
						}
						col.childElements = column.children;
						col.filterValue = '';
						col.sortOrder = '';
						col.sortIcon = 'Maximo:Sort';
						table._childColumnTemp.push(col);
						table._rowAttributesTemp[col.dataAttribute] = {};
					});
					break;
				case 'MAXIMO-TABLE-DETAILS':
					table._tableDetails = child;
					break;
				case 'MAXIMO-TABLE-ACTIONS':
					table._tableActions = child;
					break;
			}
		});
  	},
  	_fixColumnArray: function(){
  		var table = this;
  		this._sortable = false;
  		this.columns.forEach(function(col){
  			col.dataAttribute = col.attribute;
			col.childElements = [];
			col.filterValue = '';
			col.sortOrder = '';
  			col.sortIcon = 'Maximo:Sort';
  			delete col.attribute;
  			table._childColumnTemp.push(col);
  			table._rowAttributesTemp[col.dataAttribute] = {};
  		});
  	},
  	/*
  	 * Convert dashed attributes to Camel Case 
  	 *   example - 'first-last' converts to 'firstLast'
  	 * 	 Needed because we cannot use in html {{xxx.yyy}} when yyy has '-' and xxx[yyy] is not supported by polymer 
  	 */
  	replaceDash: function(value){
  		while(value.includes('-')){
  			var index = value.indexOf('-');
  			var nextChar = value.substring(index+1,index+2).toUpperCase();
  			value = value.substring(0, index) + nextChar + value.substring(index + 2);
  		}
  		return value;
  	},
  	ready : function(){
  		this._sortable = this.noSort!=true;
  		var table = this;
  		this._addExternalEvents();
		this._selectAlwaysOn = this.selectOn;
  		if(this._tableActions){
  			$j(this._tableActions).find('> *').each(function(){
  				table._bindEvents(this);
  			});
  			Polymer.dom(this.$.actions).appendChild(this._tableActions);
  		}
		var observer = new MutationObserver(function(mutations) {
	  		if(table.orderedData && table.rowDropEvent){
	  			table._sortable = false;
	  			table._applyRowSorting();
	  		}
	  		if(table.selectMode !== 'none' && !table._selectAlwaysOn){
				table.longPress($j(table.$.body).find('tr'), function(element){
					if(table.selectOn){ //switching to off
						table._selectedIndexes = {};
						$j(table.$.body).find('maximo-checkbox.selectRow').attr('checked',false);
						$j(table.$.header).find('maximo-checkbox.selectAll').attr('checked',false);
					}
					else {
	  					$j(element).find('maximo-checkbox.selectRow').trigger('click');
						$j(element).find('maximo-checkbox.selectRow').attr('checked',true);
					}
					table.selectOn = !table.selectOn;
				});
	  		}
		});
		observer.observe(this.$.body, {childList: true});
  		if(!this.summary){
  			console.error('maximo-table-editable '+this.id+ ' requires a summary attribute that describes this table.');
  		}
  	},
  	attached: function(){
		if(this.height==='auto'){
			$j(this.$.body).css({'overflow-y':'auto'});
		}
		if(this.items.length>0){
			this.renderWithArray(this.items);
		}
  	},
	_startedRefresh: function(){
		//TODO - apply a wait layer?
	},
	_reRender: function(){
		this.set('_childColumns',[]);
		this.async(function(){
			this.set('_childColumns',this._childColumnTemp);
			if(this.items.length>0){
				this._applyFilter();
			}
			else {
				this._collectionDataRefreshed({detail:this.collection});
			}
		});
	},
	renderWithArray: function(data){
		this._sortable = false;
		this.set('_data',[]);
		this._destroyDataRows();
  		this._childColumns = this._childColumnTemp;
  		this.__rowAttributes = this._rowAttributesTemp;
		this._addSchemaToColumns();
		this._render = true;
		this._loading = false;
		this.async(function(){
			this.set('_tempData',this.collectionHoldsData?this.collection.collectionData:JSON.parse(JSON.stringify(this.collection.collectionData)));
			this.collection._addTemplateRow();
			//this.set('_data', data);
			this._initializeAfterLoad();
		});
	},
	_collectionDataRefreshed: function(e){
		this.set('_data',[]);
		if(e.detail === this.collection && this.collection.collectionData){
			this._destroyDataRows();
	  		this._childColumns = this._childColumnTemp;
	  		this.__rowAttributes = this._rowAttributesTemp;
			this._addSchemaToColumns();
			this._schema = this.collection.schema;
			this._render = true;
			this._loading = false;
			this.async(function(){
				this.set('_tempData',this.collectionHoldsData?this.collection.collectionData:JSON.parse(JSON.stringify(this.collection.collectionData)));
				if(!this.collection.getNewRecordData()){
					$j(this.$.body).find('tr.detailRow').each(function(){
						$j(this).remove();
					});
					this.set('_data',this._tempData);
				}
				this._initializeAfterLoad();
			});
		}
	},
	_isTemplate: function(record){
		return record.__tableTemplate__?'true':'';
	},
	_addTemplateRow: function(e){
		var record;
		if(this.collection){
			if(this.collection === e.target){
				record = e.detail;
				record.__tableTemplate__ = true;
				this._tempData.push(record);
				this._templateRecord = record;
				this.set('_data',this._tempData);
			}
		}
		else {
			record = this_data[0];
			if(record){
				Object.keys(newRecord).forEach(function(attribute){
					var value =  newRecord[attribute];
					switch(typeof value){
						case 'string':
							newRecord[attribute] = '';		
							break;
						case 'boolean':
							newRecord[attribute] = false;
							break;
						case 'number':
							newRecord[attribute] = -1;
							break;
						case 'object':
							if(object.length !== undefined){
								newRecord[attribute] = [];
							}
							else {
								newRecord[attribute] = {};
							}
							break;
					}
				});
				record.__tableTemplate__ = true;
				this._tempData.push(record);
				this._templateRecord = record;
				this.set('_data',this._tempData);
			}
		}
	},
	_destroyDataRows: function(){
		$j(this.$.body).find('td').each(function(){
			$j(this).children().each(function(){
				if(this.hasAttribute('data-maximocomponent')){
					this.destroy(true); //don't walk down from this child
				}
			});
		});
	},
	_showRowSortHandle: function(){
		return this.orderedData && this.rowDropEvent;
	},
	_applyRowSorting: function(){
		var table = this;
		var headerCells = $j(table.$.headerRow).find('th');
		
		$j(this.$.body).sortable({
			axis: 'y',
			containment: 'parent',
			opacity: 0.85,
			cursor: 'ns-resize',
			forcePlaceholderSize : true,
			helper: function(event, element) {
				table.dragInfo = {'startIndex':parseInt(element.attr('data-row-index'))};
				if(table._tableDetails){
					var next = element.next();
					if(next.attr('class').includes('detailRow')){
						table.dragInfo.detailRow = next;
					}
					else {
						table.dragInfo.detailRow = null;
					}
				}
				table._toggleDetailsForRow(element, false);
				var clone = element.clone(true);
				clone.find('td').each(function(index, cell){
					$j(cell).width($j(headerCells[index]).outerWidth());	
				});
				return clone;
			},
			start: function(event,ui){
				ui.helper.find('td').each(function(index, cell){
					$j(cell).width($j(headerCells[index]).outerWidth());	
				});
			},
			stop: function(event, ui){
				var startIndex = table.dragInfo.startIndex;
				table.async(function(){
					if(table._tableDetails){
						if(ui.item.next().attr('class').includes('detailRow') && ui.item.next() !==  table.dragInfo.detailRow){
							//have to move it down 1
							ui.item.next().after(ui.item[0]);
						}
						if(table.dragInfo.detailRow){
							ui.item[0].after(table.dragInfo.detailRow[0]);
							table._toggleDetailsForRow(ui.item[0], true);
						}
					}
					$j(this.$.body).find('tr[data-row-index]').each(function(index, row){
						$j(row).attr('data-row-index',index);
					});
					var endIndex = parseInt(ui.item.attr('data-row-index')); 
					table.domHost.fire(this.rowDropEvent, {'table': table, 'startIndex':startIndex, 'endIndex':endIndex});
				});
			}
		});
	},
	_initializeAfterLoad: function(){
		var table = this;
		this.async(function(){
			$j(this.$.headerRow).find('.headerSpan').each(function(){
				var index = parseInt($j(this).parent().attr('data-col-index'));
				$j(this).html(table._getColumnTitle(table._childColumns[index]));
				var dataAttribute = table._childColumns[index].dataAttribute;
				if(dataAttribute){
					$j(this).parent().attr('data-attribute', dataAttribute);
				}
			});
			$j(this.$.headerRow).sortable({
				axis: 'x',
				containment: 'parent',
				helper: 'clone',
				opacity: 0.65,
				items: $j(this.$.headerRow).find('span').parent(),
				start: function(event, ui){
					//applying a css class is slow here so we set directly
					ui.helper.css({'white-space':'nowrap', 'border': '0px', 'background': '#c0e6ff','height':ui.placeholder.height()+'px'});
				},
				stop: function(event, ui){
					var temp = [];
					event.target.sorting = false;
					$j(table.$.headerRow).find('th[data-col-index]').each(function(){
						temp.push(table._childColumns[parseInt($j(this).attr('data-col-index'))]);
					});
					table.set('_childColumnTemp',temp);
		    		table._reRender();
				}
			});
		});
	},
	_getColDetails: function(column, index){
		if(!column.dataAttribute){
			return '';
		}
		return 'width:'+(100/this._childColumns.length)+'%';
	},
	_getColumnTitle: function(column){
		return column.title?column.title:column.schema?column.schema.title:'';
	},
  	_getUniqueId: function(record){
  		var unique = record._id?record._id:record.href?record.href:'missing_id_or_href';
  		return $M.makeSafeId(unique);
  	},
	_bindData: function(newChild){
		var event = {};
		var table = this;
		var rowIndex = newChild._tableInfo.tableRow.recordIndex;
		if(newChild.tagName.toLowerCase() === 'input'){
			event.input = newChild;
			event.name = 'READONLY';
			event.value = 'value';
		}
		else {
			event = newChild.getTableDataBindInfo();
		}
		var dataAttribute = newChild._tableInfo.column?newChild._tableInfo.column.dataAttribute:$j(newChild).attr('table-detail-attribute');
		if(dataAttribute){
			newChild.__originalTableValue__ = newChild._tableInfo.tableRecord[dataAttribute];
			newChild[event.value] = newChild.__originalTableValue__;
			if(Object.keys(event).length>0){
				$j(event.input).on(event.name, function(e){
					var value = e.target[event.value];
					//value = table._stringToSChemaType(e.target, dataAttribute, event.name, value);
					newChild._tableInfo.tableRecord[dataAttribute] = value;
					if(newChild._tableInfo.tableRecord._action !== 'Add'){
						newChild._tableInfo.tableRecord._action = 'Update';
					}
					table._updateMatchedElements(event.value, value, dataAttribute, rowIndex);
				});
				$j(event.input).on('change', function(e){
					this.valid = e.target.checkValidity();
					var value = e.target[event.value];
					if(this.valid){
						value = table._stringToSChemaType(e.target, dataAttribute, 'change', value);
						newChild._tableInfo.tableRecord[dataAttribute] = value;
						table._updateMatchedElements(event.value, value, dataAttribute, rowIndex);
						delete newChild._tableInfo.tableRecord.__invalidAttributes__[dataAttribute];	
					}
					else {
						if(!newChild._tableInfo.tableRecord.__invalidAttributes__){
							newChild._tableInfo.tableRecord.__invalidAttributes__ = {};
						}
						newChild._tableInfo.tableRecord.__invalidAttributes__[dataAttribute] = {'value':value,'error':newChild._typeError,'errorMessage':newChild._typeErrorMessage,'originalValue':newChild.__originalTableValue__};
					}
				});
				
				$j(event.input).attr('mx-listeners','event');
				table._addRowAttribute(dataAttribute,rowIndex,event);
				if(event.input.setDataType){
					event.input.setDataType(this._schema.properties[dataAttribute].type, this._schema.properties[dataAttribute].subType);
				}
			}
		}
	},
	_updateMatchedElements: function(eventValue, value, dataAttribute, rowIndex){
		var matchedElements = this._rowAttributes[dataAttribute][rowIndex];
		matchedElements.forEach(function(element){
			//if(element.input !== e.currentTarget){
				if(element.input.tagName === 'INPUT'){
					$j(element.input).val(value);
					$j(element.input).attr('title',value);
				}
				else if(element.input.set){
					element.input.set(eventValue, value);	
				}
				else if(element.input.setAttribute){
					element.input.setAttribute(eventValue, value);
				}
			//}
		});
	},
	_stringToSChemaType: function(field, attribute, event, value){
		if(this._schema){
			var prop = this._schema.properties[attribute];
			switch(prop.type){
				case 'integer':
					value = parseInt(value);
					break;
				case 'number':
					value = parseFloat(value);
					break;
				case 'boolean':
					if(event === 'change'){
						if(typeof value !== 'boolean'){
							value = (value.toLowerCase() === 'true');
						}
					}
					break;
				default: // do nothing and return a string
					if(prop.subType === 'UPPER'){
						value = value.toUpperCase();
						field.value = value;
					}
					break;
			}
		}
		return value;
	},
	_addRowAttribute: function(attribute, rowIndex, event){
		if(!this._rowAttributes[attribute]){
			this._rowAttributes[attribute] = {};
		}
		if(!this._rowAttributes[attribute][rowIndex]){
			this._rowAttributes[attribute][rowIndex] = [];
		}
		var holder = this._rowAttributes[attribute][rowIndex];
		if(holder.indexOf(event) === -1){
			holder.push(event);
		}
	},
	/*
	 * Searches for special events prefixed with table- and binds them with the domHost
	 */
	_bindEvents: function(newChild){
		var table = this;
		var listeners = ['table-tap','table-kepress'];
		listeners.forEach(function(listener){
			var attr = $j(newChild).attr(listener);
			if(attr){
				var event = listener.substring(6);
				$j(newChild).on(event, function(e){
					if(attr.includes('-')){
						table.domHost.fire(attr, {'table':table,'originalEvent':e.originalEvent});//{'table':table,'originator':newChild});
					}
					else {
						table._tableAction.apply(table,[attr,e]);
					}
				});
			}
		});
	},
	_updateAttributes: function(newChild, childElement, column, record){
		for(var index = 0; index < childElement.attributes.length; index++){
			var attribute = childElement.attributes[index];
			var value;
			if(attribute.value.startsWith(':')){
				if(attribute.value.length===1){
					value = record[column.dataAttribute];
				}
				else {
					value = record[attribute.value.substring(1)];
				}
				if(!column.schema || column.schema.type !== 'boolean' || value === true || value === 'true'){
					newChild.setAttribute(attribute.name, value);
				}
			}
		}
	},
	_getWidth: function(width){
		if(width){
			return 'width:'+width;
		}
		return '';
	},
	_addClass: function(element, className){
		$j(element).toggleClass('style-scope maximo-table-editable '+$M.dir + ' ' + className,true);
	},
	_removeDetails: function(){
		this._destroyDataRows();
		$j(this.$.body).find('.detailRow').each(function(){
			$j(this).remove();
		});
	},
	_toggleDetailsForRow: function(row, open){
		var button;
		if(open && !$j(row)[0].hasAttribute('details-open')){
			button = $j(row).find('.twisty maximo-button');
			button.trigger('click');
		}
		else if(!open && $j(row)[0].hasAttribute('details-open')){
			button = $j(row).find('.twisty maximo-button');
			button.trigger('click');
		}
	},
	_toggleDetails: function(e){
		var table = this;
		var record = this.$.tableList.itemForElement(e.target);
		var detailIcon = $j(e.currentTarget).find('svg');
		var row = $j(e.currentTarget).parent().parent();
		var detailRow = row[0].detailRow;
		if(!detailRow){
			detailRow = row.parent()[0].insertRow(row[0].rowIndex - 1);
			$j(detailRow).attr({'class':'detailRow style-scope maximo-table-editable'});
			$j(detailRow).on('mouseenter mouseleave', function(e){
				table._highlight(e);
			});
			detailCell = detailRow.insertCell();
			$j(detailCell).attr({'colspan':'200','class':'detailCell style-scope maximo-table-editable'});
			$j(detailRow).hide();
			row[0].detailRow = detailRow;
		}
		else {
			 detailCell = detailRow.cells[0];
		}
		row[0].recordIndex = this.$.tableList.indexForElement(e.target);
		detailIcon.css('transition','all .2s');
		if($j(detailRow).css('display')==='none'){
			if($j(detailCell).attr('has-details') === undefined){
				var observer = new MutationObserver(function(mutations) {
					//check to see if has-details was added
					if(mutations[0].attributeName === 'has-details'){
						$j($j(detailCell).find('[data-maximocomponent]')).each(function(){
							this.readonly = table.readonly || table._tableDetails.readonly;
							if(this.allowedOnTable()){
								this._tableInfo = {
									tableRecord : record,
									table : table,
									tableRow : row[0],				
								};
								table._fixDetailsChild(this);
								table._bindData(this);
								table._bindEvents(this);
							}
							else {
								console.error(this.tagName + ' is not allowed on a table.');
								$j(this).remove();
							}
						});
					}
				});
				// pass in the target node, as well as the observer options
				observer.observe(detailCell, { attributes: true});
				$j(detailCell).append(this._tableDetails.innerHTML);
				$j(detailCell).attr('has-details', true);
			}
			detailIcon.css('transform','rotate(90deg)');
			$j(row).toggleClass('detailsOpen',true);
			$j(detailRow).slideToggle('fast');
			$j(row).attr('details-open',true);
		}
		else {
			detailIcon.css('transform','rotate(0deg)');
			$j(row).toggleClass('detailsOpen',false);
			$j(row).removeAttr('details-open');
			$j(detailRow).slideToggle('fast');
		}
	},
	_fixDetailsChild: function(element){
		var table = this;
		for (var index = 0; index < element.attributes.length; index++){
			var item = element.attributes.item(index);
			var matches = item.value.match(/::\S+::/g);
			element.className = 'style-scope maximo-table-editable x-scope '+element.tagName.toLowerCase()+'-0';
			if(matches){
				matches.forEach(function(match){
					var attribute = match.substring(2,match.length-2);
					var value = match;
					if(element._tableInfo.tableRecord.hasOwnProperty(attribute)){
						value = element._tableInfo.tableRecord[attribute];
						$j(element).attr('table-detail-attribute', attribute);
					}
					else if(table._schema){
						value = table._schema.properties;
						var split = attribute.split('.');
						split.forEach(function(element){
							value = value[element];
						});
					}
					item.value = value;
				});
			}
		}
	},
	_hasDetails: function(){
		return this._tableDetails !== null;
	},
	_addCellChildren: function(column, record, recordIndex){
		this.async(function(){
			var table = this;
			var cellId = this._getCellId(column, record);
			var cell = $j('#'+cellId);
			var row = cell.parent();
			if(row.length===1){
				row[0].recordIndex = recordIndex;
				if(column.childElements && column.childElements.length>0){
					var elements = [].slice.call(column.childElements);
					elements.forEach(function(childElement){
						if(childElement.allowedOnTable()){
							var newChild = $j(childElement).clone()[0];
							newChild.id = cellId + '_' + newChild.id; 
							newChild.readonly = table.readonly;
							cell.append(newChild);
							table._updateAttributes(newChild, childElement, column, record);
							newChild._tableInfo = {
								tableRecord : record,
								column : column,
								table : table,
								tableRow : row[0]
							};
							table._bindData(newChild);
							table._bindEvents(newChild);
							newChild.className = 'style-scope maximo-table-editable x-scope '+newChild.tagName.toLowerCase()+'-0';
						}
					});
				}
				else {
					var newChild = document.createElement('input');
					var value = record[column.dataAttribute];
					$j(newChild).attr({'readonly':'','title':value}).val(value);
					newChild._tableInfo = {
						tableRecord : record,
						column : column,
						table : table,
						tableRow : row[0],							
					};
					table._addClass(newChild, 'readonlyCell');
					$j(cell).append(newChild);
					table._bindData(newChild);
				}
				if(column.actions){
					$j(cell).append($j(this.$.tableDelete).clone()[0]); 
				}
			}
		});
	},
	_actionClass: function(column){
		return column.hasOwnProperty('dataAttribute')? 'dataColumn':'actions';
	},
	_getCellId: function(column, record){
		var middleName = column.dataAttribute;
		if(!middleName && column.hasOwnProperty('actions')){
			middleName = 'actions';
		}
		return this.id + '_' + middleName + '_' + this._getUniqueId(record);
	},
	_getColumnLength: function(){
		return this._childColumns.length + this.bufferColumns;
	},
	_highlight: function(e){
		$j(e.currentTarget).toggleClass('hover',e.type==='mouseenter'?true:false);
		if(this._hasDetails()){
			if(e.currentTarget.className.includes('dataRow')){
				var next = $j(e.currentTarget).next();
				if(next.hasClass('detailRow')){
					next.toggleClass('hover',e.type==='mouseenter'?true:false);
				}
			}
			else if(e.currentTarget.className.includes('detailRow')){
				$j(e.currentTarget).toggleClass('hover',e.type==='mouseenter'?true:false);
				$j(e.currentTarget).prev().toggleClass('hover',e.type==='mouseenter'?true:false);
			}
		}
	},
	_multiSelect: function(){
		return this.selectMode === 'multiple';
	},
	_singleSelect: function(){
		return this.selectMode === 'single';
	},
	_selectAll: function(e){
		$j(this.$.table).find('maximo-checkbox.selectRow').attr('checked',e.currentTarget.checked);
		var temp = {};
		if(e.currentTarget.checked){
			this._data.forEach(function(row,index){
				temp[index]=index;
			});
		}
		this._selectedIndexes = temp;	
	},
	_selectRow: function(e){
		var rowIndex = this.$.tableList.indexForElement(e.target);
		if($M.objectToArray(this._selectedIndexes).includes(rowIndex)){
			delete this._selectedIndexes[rowIndex];
		}
		else {
			this._selectedIndexes[Object.keys(this._selectedIndexes).length] = rowIndex;
		}

	},
	_selectedChanged: function(){
		this.domHost.fire('maximo-table-rows-selected', this);
	},
	_getAllColumns: function(_childColumns){
		return [{},{},{}].concat(_childColumns).concat([{}]);
	},
	_getColSpan: function(column){
		return this._childColumns.indexOf(column) === this._childColumns.length - 1?2:1; 
	},
	getTableDataBindInfo: function(){
		return {};
	},
	_radioButtonChanged: function(e){
		if(e.detail.groupId === this.id){
	  		this._selectRow(e.detail.event);
	  		$j(this.$.table).find('div[group-id="'+this.id+'"]').each(function(){
	  			if(this !== e.detail.event.currentTarget){
	  				this.parentNode.checked = false;
	  			}
	  		});
		}
	},
	_filterKey: function(e){
		if(e.keyCode===$M.keyCode.ENTER){
			this._applyFilter();
		}
	},
	_clearFilter: function(){
		if(this.getDirtyRecords().length>0){
			$M.notify(this.localize('uitext','mxapibase','noFilterSave'));
			return;
		}
		$j(this.$.filterRow).find('th.filterTh *[data-maximocomponent]').each(function(){
			var event = this.getTableDataBindInfo();
			switch(this.tagName){
				case 'MAXIMO-TEXT':
					$j(this).val('');
					break;
				case 'MAXIMO-CHECKBOX':
					this.set(event.value, false);
					this.set('_applied', false);
					break;
			}
		});
		this._childColumns.forEach(function(column, index){
			delete column.filterValue;
		});
		this.async(function(){
			this._applyFilter();			
		});
	},
	_applyFilter: function(){
		if(this.getDirtyRecords().length>0){
			$M.notify(this.localize('uitext','mxapibase','noFilter'));
			return;
		}
		this._removeDetails();
		var filterData = [];
		this._childColumns.forEach(function(column, index){
			if(column.dataAttribute && column.filterValue){
				//need to apply this column to a filter
				//do we need type?
				filterData.push({
						'filtertype': 'SIMPLE',
						'field': column.dataAttribute, 
						'availablevalues': [ {
							'value': column.filterValue,
							'description': column.title,
							'selected': true }
					]
				});
			}
		});
		if(this.collection){
			this.collection.set('filterData',filterData);
			this._refreshCollection();
		}
		else {
			var temp = [];
			if(filterData && filterData.length > 0){
				var data = this.items	;
				data.forEach(function(record){
					var matched = 0;
					filterData.forEach(function(filter){
						if(filter.filtertype.toUpperCase() === 'SIMPLE'){
							filter.availablevalues.forEach(function(filterValue){
								var included = (record[filter.field]).toString().toLowerCase().includes(filterValue.value.toLowerCase()); 
								if(included === filterValue.selected){
									matched++;
								}
							});
						}
					});
					if(filterData.length === matched){
						temp.push(record);
					}
				});
				this.renderWithArray(temp);
			}
			else {
				this.renderWithArray(this.items);
			}
		}
	},
	_refreshCollection: function(){
		this.toggleLoading(true);
		this.collection.refreshRecords().then(function(){
			this.toggleLoading(false);
		}.bind(this), function(error) {
			this.toggleLoading(false);
		});
	},
	_sortByColumn: function(e){
		if(!this._sortable){
			return;
		}
		if(this.getDirtyRecords().length>0){
			$M.notify(this.localize('uitext','mxapibase','noSortSave'));
			return;
		}
		this._removeDetails();
		var colIndex = parseInt(e.currentTarget.getAttribute('data-col-index'));
		var table = this;
		this._childColumns.forEach(function(column, index){
			column.sortIcon = 'Maximo:Sort';
			if(index===colIndex){
				switch(column.sortOrder){
					case '':
						column.sortIcon = 'Maximo:Sort-Ascending';
						column.sortOrder = 'asc';
						break;
					case 'asc':
						column.sortOrder = 'desc';
						column.sortIcon = 'Maximo:Sort-Descending';
						break;
					case 'desc':
						column.sortIcon = 'Maximo:Sort';
						column.sortOrder = '';
						break;
				}
				table.collection.groupBySortClause = column.dataAttribute + ' ' + column.sortOrder;
				table._refreshCollection();
			}
		});
		this.$.tableHeadings.items = [];
		this.async(function(){
			this.$.tableHeadings.items = this._childColumns;
			this.$.tableHeadings.render();	
		});
		
	},
	_sortClass: function(column){
		if(this._sortable && column.dataAttribute){
			return 'headerSpan sortable';
		}
		return 'headerSpan';
	},
	_columnSortable: function() {
		return this._sortable;
	},
	_sortType: function(column){
		if(column.dataAttribute){
			if(column.sortOrder === 'asc'){
				return 'Maximo:Sort-Ascending';
			}
			else if (column.sortOrder === 'desc'){
				return 'Maximo:Sort-Descending';
			}
			else {
				return 'Maximo:Sort';
			}
		}
		return '';
	},
	_sortLabel: function(){
		if(this._sortable){
			return this.localize('uitext','mxapibase','sort');
		}
		return '';
	},
	_filterInput: function(e){
		var column = this.$.tableFilters.itemForElement(e.target);
		var value;
		if(e.currentTarget.tagName === 'MAXIMO-CHECKBOX'){
			value = e.currentTarget.getChecked().toString();
			if(value === 'mixed'){
				value = '';
			}
		}
		else {
			value = e.target.value;
		}
		if(e.target.tagName==='MAXIMO-CHECKBOX'){
			column.filterValue = e.target._applied?value:'';		
		}
		else {
			column.filterValue = value;
		}
	},
	_filterField: function(column){
		return column.dataAttribute && (!column.schema || (column.schema.type !== 'boolean' || (column.childElements[0] && column.childElements[0].tagName !== 'MAXIMO-CHECKBOX')));
	},
	_filterCheckbox: function(column){
		return column.dataAttribute && column.schema && column.schema.type === 'boolean' && column.childElements.length>0 && column.childElements[0].tagName === 'MAXIMO-CHECKBOX' && !column.childElements[0].hasAttribute('slider');
	},
	_filterSlider: function(column){
		return column.dataAttribute && column.schema && column.schema.type === 'boolean' && column.childElements.length>0 && column.childElements[0].tagName === 'MAXIMO-CHECKBOX' && column.childElements[0].hasAttribute('slider');
	},
	_toggleSelectOn: function(on){
		$j(this.$.wrapper).toggleClass('selectable', on);
	},
	_toggleSortAndFilter: function(enabled){
		$j(this.$.filterRow).find('*[data-maximocomponent]').each(function(){
			if(!enabled){
				$j(this).attr('readonly',true);
			}
			else {
				$j(this).removeAttr('readonly');
			}
		});
		this.$.header.classList.toggle('disabledHeader', !enabled);
	},
	/*
	 * Return all records that have been modified based on modTypes passed in. If nothing passed records with any modifications will be returned. 
	 */
	getDirtyRecords: function(modTypes){
		if(!modTypes){
			modTypes = ['Delete','Update','Add'];
		}
		
		var modified = this._data.filter(function(record){
			for(var modIndex = 0;modIndex<modTypes.length;modIndex++){
				if(record._action === modTypes[modIndex]){
					return true;
				}
			}
		});
		return modified;
	},
	/*
	 * Return all records that marked as invalid. 
	 */
	getInvalidRecords: function(){
		var invalid = this._data.filter(function(record){
			if(record.__invalidAttributes__  && Object.keys(record.__invalidAttributes__).length>0){
				return true;
			}
		});
		return invalid;
	},
	/*
	 * Return all records that marked as modified. 
	 */
	getModifiedRecords: function(){
		return this.getDirtyRecords(['Update']);
	},
	/*
	 * Return all records that marked as deleted. 
	 */
	getDeletedRecords: function(){ //stored in separate array so not to be in render content
		return this.getDirtyRecords(['Delete']);
	},
	/*
	 * Return all records that marked as new. 
	 */
	getNewRecords: function(){
		return this.getDirtyRecords(['Add']);
	},
	/*
	 * Return all records that are selected. 
	 */
	getSelectedRecords: function(){
		var selected = [];
		var table = this;
		Object.keys(this._selectedIndexes).sort().forEach(function(key, index){
			selected.push(table._data[key]);
		});
		return selected;
	},
	_addExternalEvents: function(){
		var table = this;
		Object.keys(this._externalTableEvents).forEach(function(key){
			var value = table._externalTableEvents[key];
	  		$j(table.domHost).on(key, function(e){
	  			table[value].apply(table,[e]);
	  		});
		});
	},
	/*
	 * Used for two stage event to allow for validation prior to actions
	 * To use set table-tap="xxx-xxx-xxx" event on host, must contain '-', handle in host and if allowed use: e.detail.table.fire('table-action-allowed', e);
	 */
	_tableActionAllowed: function(e){
		var type = e.detail.type.substring(e.detail.type.lastIndexOf('-')+1);
		this._tableAction(type, e.detail.detail.originalEvent);	
	},
	/*
	 * To call this without two stage events, set table-tap="{actionType}"
	 */
	_tableAction: function(actionType, e){
		var table = this;
		switch(actionType){
			case 'add':
				if(this.readonly){
					this.log('Cannot add to a readonly table');
					return;
				}
				var newRecord = JSON.parse(JSON.stringify(this._templateRecord));
				newRecord._isNew = true;
				newRecord._action = 'Add';
				delete newRecord.__tableTemplate__;
				this.splice('_data',0,0,newRecord);
				this._toggleSortAndFilter(false);
				break;
			case 'delete':
				var row = e.currentTarget._tableInfo?e.currentTarget._tableInfo.tableRow:e.detail;
				this._toggleDetailsForRow(row, false);
				var record = e.currentTarget._tableInfo.tableRecord;
				record._action = 'Delete';
				this._toggleSortAndFilter(false);
				var rowPos = $j(row).position();
				
				var overlay = $M.createOverlay(row, this.localize('uitext','mxapibase','rowDeleted'),null, function(){//undelete
					$j(overlay).slideToggle('fast', function(){
						$j(overlay).remove();
						delete record._action;
						if(record._isNew){
							record._action = 'Add';
						}
						table._toggleSortAndFilter(table.getDirtyRecords().length===0);		
					});
				},{'remove':false,'noBR':true,'css':{'margin-top':'1px','top':'auto','left':rowPos.left,'height':$j(row).height()-2,'background':'rgba(255,255,255,.75)','opacity':'1'},'attributes':{'hidden':true}});
		        $j(overlay).slideToggle('fast');
		}
	}
});