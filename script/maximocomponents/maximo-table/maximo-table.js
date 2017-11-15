/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
 /*
`<maximo-table>` element. A table display of data.

Example:
```html
	<maximo-table id="tableid" collection="{{getLocalObject('collection_short')}}" selected-index="[0]" summary="demo table 1"
	columns='[{"attribute":"first_name","title":"First Name"},{"attribute":"last_name"},{"attribute":"first_name","title":"First Name"},
	{"attribute":"last_name"},{"attribute":"first_name","title":"First Name"},{"attribute":"last_name"},{"attribute":"first_name","title":"First Name"},
	{"attribute":"last_name"}]'></maximo-table>
```

### Accessibility
&#8593; or &#8592; Choose previous radio button(wraps to beginning)<br>
&#8595; or &#8594; Choose next radio button(wraps to end)

@demo

*/

Polymer({
	is: 'maximo-table',
  	behaviors: [BaseComponent,DragScrollComponent,ArrowKeys],
  	listeners: {
  		'collection-data-refreshed':'_collectionDataRefreshed'
  	},
	properties : {
		/** Column definitions passed as a property. This will take precedence over internal column definitions.  */
		columns: {
			type: Array,
			value: function(){
				return [];
			},
			notify:true
		},
		/** data to display */
		items: {
			type: Array,
			value: function(){
				return [];
			},
			observer: '_itemsChanged'
		},
		/** Collection to use for display data */
		collection: {
			type: Object,
			observer: '_setCollection'
		},
		/** Summary to set on the table. This will give a summary of what this table shows and is required for accessibility. */
		summary: {
			type: String
		},
		/** Height to set on the table body */
		maxHeight: {
			type: String,
			value: '300px'
		},
		/** Width to set on the table */
		width: {
			type: String,
			value: 'auto'
		},
		whiteSpace: {
			type: String,
			value: 'nowrap'
		},
		/** Column definitions to use when building */
		_displayColumns: {
			type: Array,
			computed: '_getMyColumns(columns)'
		},
		_loading: {
			type: Boolean,
			value: true
		},
		_noRecords: {
			type: Boolean,
			value: false
		},
		/** Index of selected record */
		selectedIndex: {
			type: Array,
			value: function(){
				return [];
			}
		},
		/** Select mode ('single' or 'multiple') */
		selectMode: {
			type: String,
			value: 'none'
		},
		_arrowKeyInfo: {
			type: Object,
			value: function(){
				return {'selector':'tr'};
			}
		},
		_ready: {
			type: Boolean,
			value: false
		},
		/**
			This is the object used to populate the actions column.
			header:{
				width: width as px e.g. 500px
			}
			list:[
				{
					'icon': icon-path // optional, will default to button if no path is specified (icons:arrow-drop-up)
					label: label text
					'action': actionName//required, id for this action. This will be how we figure out what was clicked when listening for the event.
					''
				}
			]

			if there is no icon, then a button will be generated with the selected label
		**/
		actions:{
			type: Object,
			value: function(){
				return {}
			}
		},

		/*
			the attribute with which to order the collection by. Will notify the parent property.
		*/
		collectionOrderBy:{
			type: String,
			notify: true
		},
	},

	/**
		Method for determining whether or not we have actions to display
	**/
	_hasActions: function(actions){
		//TODO: check if null
		return !$j.isEmptyObject(actions);
	},
	/**
		We indicate if an action has an icon through the presence of the icon property
	**/
	_actionHasIcon: function(action){
		return action.icon ? true : false;
	},
	_getMyColumns: function(columns){
		return this.columns && this.columns.length>0?this.columns:this.childColumns;
	},
	_getTitle: function(record,datacolumn){
		var value = record[datacolumn.attribute];
		if(value){
			return value;
		}
		return '';
	},
	_getData: function(record,datacolumn,trunc){
		return record[datacolumn.attribute];
	},
	_getColumnTitle: function(column){
		if(column.title){
			return column.title;
		}
		return '';
	},
	_getColWidth: function(column,index){
		if(column.width){
			return column.width;
		}
		var length = this._displayColumns.length;
		if(this._hasActions(this.actions)){
			length++;
		}
		return 100/length+'%';
	},
	_keyHandler: function(e){
		this._rowTapHandler(e);
	},
	_setSelected: function(indexes){
		if(!this._selectable()){
			this.selectMode = indexes.length===1?'single':'multiple';
		}
	},
	_rowTapHandler: function(e){
		if(!this._selectable()){
			return;
		}
		var ctrlKey = e.detail?e.detail.sourceEvent.ctrlKey:e.ctrlKey;
		var shiftKey = e.detail?e.detail.sourceEvent.shiftKey:e.shiftKey;
		var last;
		if(this.selectedIndex.length>0){
			last = this.selectedIndex[this.selectedIndex.length-1];
		}
		if(last>=0 && this.selectMode === 'multiple' && (ctrlKey || shiftKey)){
			var selected = $j(e.currentTarget).attr('aria-selected') === 'true';
			var index = this.$.rowRepeat.indexForElement(e.currentTarget);
			if(ctrlKey){
				if(selected){
					$M.arrayRemove(this.selectedIndex,index);
				}
				else {
					this._selectRecord(index);
				}
			}
			else if(shiftKey){
				var move = index-last;
				var start = move>0?last:index;
				move = Math.abs(move)+start;
				this.selectedIndex = [];
				for(var addIndex = start; addIndex<=move;addIndex++){
					this._selectRecord(addIndex);
				}
			}
		}
		else { //single select
			this.selectedIndex = [];
			this._selectRecord(this.$.rowRepeat.indexForElement(e.currentTarget));
		}
		this._selectRows(this.selectedIndex, true);
	},
	_selectRecord: function(index){
		if(this.collection){
			this.collection.selectedRecordIndex = index;
		}
		this.selectedIndex.push(index);
	},
  	created : function(){
  		this.childColumns = [];
		var table = this;
		$j(this.childNodes).each(function(){
			var child = $j(this)[0];
			if(child.tagName==='MAXIMO-TABLECOL'){
				var col = {};
				for (var index = 0; index < child.attributes.length; index++){
					var item = child.attributes.item(index);
					col[item.name] = item.value;
				}
				table.childColumns.push(col);
			}
		});
  	},
		/**
			Checks the column metadata for a sortable property. If it exists, use the boolean from that. Otherwise, we set this column
			to not sortable
		**/
		_isColumnSortable: function(sortable){
			return sortable ? sortable : false
		},
		/**
			Called when a table header is clicked. The column information was stored in data-args as an attribute.
			Fires an event with the column information so we are able to call the data from the server again, this time
			with a different sorting.
		**/
		_headerClicked: function(e){
			//if the data is based on a collection and we are using the orderby parameter
			if(this.collectionOrderBy !== undefined && !e.target.dataArgs.clientSide){
				this.collectionSort(e.target.dataArgs);
			}else{
				//otherwise, let the calling code handle it for us. It could either be from a resource or
				//a client side operation, in which case we must manually sort.
				this.fire('table-header-clicked',e.target.dataArgs);
			}

		},
		/**
			Called when rendering each table header item. Will change the filter icon based on the column metadata.
			ascending
			descending
			null - neutral
		**/
		sortType: function(column, displayColumns){
			if(column.sortType === "ascending"){
				return "Maximo:Sort-Ascending";
			}else if (column.sortType === "descending"){
				return "Maximo:Sort-Descending";
			}else{
				return "Maximo:Sort"
			}
		},
		/**
			Retrieve the default next sort type. The order is:
			1. Neutral
			2. Ascending
			3. Descending

			Once we are at descending, we loop back to neutral.
		**/
		nextSortType: function(column){
			switch(column.sortType){
				case "neutral":
					return "ascending";
				case "ascending":
					return "descending";
				case "descending":
					return "neutral";
				default:
					//we assume no sort type is neutral, so the next step would be ascending.
					return "ascending";
			}
		},

		/**
			If the column is sortable, the cursor should become a pointer when hovering over
		**/
		_isCursorPointer: function(column){
			return column.sortable ? "cursor: pointer" : ""
		},

		/**
			Fires an event indicating that an action was done. The parent element can handle it however they want.
		**/
		tableActionClicked: function(e){
			var toSend = {
				action: e.model.action,
				record: e.model.record,
				source: e.srcElement
			}
			return this.fire('table-action-clicked',toSend);
		},

  	ready : function(){
  		this._ready = true;
  		if(!this.summary){
  			console.error('maximo-table '+this.id+ ' requires a summary attribute that describes this table.');
  		}
  		this.dragScrollElement = this.$.body;
  	},
  	attached: function(){
		if(this.height==='auto'){
			$j(this.$.body).css({'overflow-y':'auto'});
		}
		if(!this.collection){
			this._collectionDataRefreshed();
		}
		if(this.width === '100%'){
			var tableComponent = this;
			$j(window).on('resize', function(){
				window.clearTimeout(tableComponent.resizeTimer);
				tableComponent.resizeTimer = setTimeout(function(){
					tableComponent._sizeTable();
				}, 150);
			});
		}
  	},
  	_tabIndex: function(index){
  		return this._isSelected(index)?'0':'-1';
  	},
  	_isSelected: function(index){
  		return (this._selectable() && $M.arrayContains(this.selectedIndex,index))?'true':'false';
  	},
  	_selectable: function(){
  		return this.selectMode === 'single' || this.selectMode === 'multiple';
  	},
  	_selectRows: function(indexes, multi){
		if(!this._selectable()){
			return;
		}
  		var rows = $j(this.$.body).find('tr');
  		rows.removeAttr('aria-selected');
  		rows.attr({'tabindex':'-1'});
  		indexes.forEach(function(index){
  	  		var selectedRow = rows[index];
  			if(selectedRow){
  				$j(selectedRow).attr({'aria-selected':'true','tabindex':'0'});
  			}
  		});
  		this.fire('maximo-table-rows-selected', this);
  	},
  	_sizeTable: function(){
  		return;
		var tableComponent = this;
		var headerWidths = [];
		var total = 0;
		if(this.width === '100%'){
			$j(this.$.header).css('width','100px');
		}
		
		$j(tableComponent.$.body).find('tr:not(.stopHover)').each(function(){
			$j(this).find('td').each(function(index){
				$j(this).find('div').css({'width':'auto'});
				$j(this).css({'width':'auto'});
			});
		});
		
		this.async(function(){
			$j(this.$.header).css('width','100%');
			$j(this.$.header).find('th').each(function(){
				var headerWidth = this.offsetWidth;
				//console.log(headerWidth);
				if($j(this).text().trim()===''){
					headerWidth = 50;
				}
				headerWidths.push(headerWidth);
				total+= headerWidth;
				//TODO: Why are we doing this set? We have defined width already through a function. By assigning it this way,
				//we effectively ignore our property.
				//$j(this).width($j(this).width());
			});
			//$j(this.$.header).width(total);
			if(this.$.body.scrollHeight > this.$.body.offsetHeight){
				total = total + getScrollbarWidth();
			}
			$j(this.$.body).width(total);
	
			$j(tableComponent.$.body).find('tr:not(.stopHover)').each(function(){
				$j(this).find('td').each(function(index){
					var width = headerWidths[index];
					$j(this).find('div').css({'width':width+'px'});
					$j(this).css({'width':width+'px'});
				});
			});
	
			$j(this.$.wrapper).css({'max-width':$j(this.$.wrapper).parent().width()+'px'});
		});
  	},
  	_itemsChanged: function(){
  		if(!this._ready){
  			return;
  		}

		//we clear the selected rows when a new set of items is found
		this._selectRows([], true);
		//we need to clear the selected index as well
		this.set('selectedIndex', []);

		if(this.items.length===0){
			 this._noRecords = false;
			 this._loading = true;
			 if(this.collection === undefined){
				 this.async(function(){
					 if(this.items.length===0){
						 this._noRecords = true;
						 this._loading = false;
					 }
				 },1000);
			 }
		}
		if(this.items.length>0){
			this._noRecords = false;
			this._loading = false;
	 		var tableComponent = this;
	 		this.async(function(){
	 			this._sizeTable();
	 		},400);
		}

  	},
  	_collectionDataRefreshed: function(e){
  		if(this.collection && e.detail===this.collection){
			var schema = this.collection.get('schema');
			if(schema){
				var table = this;
				$j(this.$.header).find('th').each(function(index){
					if($j(this).text().trim()===''){
						var attribute = table._displayColumns[index].attribute;
						if(schema.properties && schema.properties[attribute]){
							var property = schema.properties[attribute];
							$j(this).text(property.title);
						}
					}
				});
			}
	  		this.items = this.collection.collectionData;
	  		this._setSelected([this.collection.selectedRecordIndex]);
  		}
  	},
  	_setCollection: function(collection){
  		if(this.selectMode==='multiple'){
  			this.selectMode='single';
  		}
  		collection.addComponentListener(this, 'collection-data-refreshed');
  	},
  	getSelected: function(){
  		if(this.collection){
  			return this.collection.selectedRecord;
  		}
  		var temp = [];
  		var items = this.items;
  		this.selectedIndex.forEach(function(index){
  			temp.push(items[index]);
  		});
  		return temp;
  	},

		//common sort case specifically done through the collection itself
		/**
			Typical usage is to call table.collectionSort in the event handler
		**/
		collectionSort: function(clickedColumn){
			//determine the next sort type
			if(!clickedColumn.sortable){
				return;
			}

			var attribute = clickedColumn.attribute;

			//store the next sort type
			var nextSortType;
			var self = this;

			var toSet = []

			//update the columns and reset all sort types except the chosen one. The chosen one progresses to the next sort type.
			this.columns.forEach(function(col){

				//if the clicked column attribute is the same as the current attribute in the loop
				if(clickedColumn.attribute === col.attribute){
					//change to the next sort type.
					col.sortType = self.nextSortType(col);
					nextSortType = col.sortType;
				}else{
					//otherwise, we set the sort type to neutral. All other columns besides the selected one are reset
					col.sortType = "neutral";
				}

				//TODO: allow table to detect which sort type should be next
				toSet.push(col);
			})

			//when descending, the attribute type must have a - in front for a standard maximo collection
			if(nextSortType === 'descending'){
				attribute = "-" + attribute;
			}
			//when ascending, the attribute type must have a + in front for a standard maximo collection
			else if(nextSortType === 'ascending'){
				attribute = "%2B" + attribute;
			}
			//when neutral, we don't need anything
			else if(nextSortType === 'neutral'){
				//remove attribute
				attribute = ""
			}

			//TODO: default sorting: ascending(encoded +), descending(encoded -), neutral = nothing

			//first set the search query, then set the columns
			this.set('collectionOrderBy',attribute);
			//now we set the columns and the search query and return the new search query. The search query must be
			this.set('columns',toSet);
		},
		_getActionLabel: function(action, record){
			if(action){
				if(action.labelattribute !== undefined && record !== undefined){
					return record[action.labelattribute];
				}else{
					return action.label;
				}
			}
		}
});
