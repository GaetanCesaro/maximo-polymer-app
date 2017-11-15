/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A tree grid component.
 */
Polymer({
	    is: 'maximo-treegrid',
   		properties: {            
            //bind the style passed in to the div of the treegrid.
            style:{
                type: String
            },
            //id of the treegrid. This must be unique. Do not modify directly. Pass in a config object instead.
   			_tgId: {
                type: String,
                value: null
            },
            //Object Structure that we would like to load. Do not modify directly. Pass in a config object instead.
            _osName:{
                type: String,
                value: null
            },

            _collectionUri:{
                type: String,
                value: null
            },

            //Attribute names along with their column metadata
            /**
             * [
             * {Name: attributeName, meta:{RelWidth: 1, CanEdit: 0}],
             * {Name: attributeName} //will default to RelWidth: 1 and CanEdit: 0
             * {Name: 'ahrraction', isObject: true, 
             * 
                 attributeMeta:[ //the attribute meta structure is repeated again. This is for the ahrraction table.
                    {Name: action, meta:{RelWidth: 1, CanEdit: 0}}
                 ]
                } 
             * ]
             */
            _attributeMeta:{
                type: Array,
                value: null
            },

            _attributeNames:{
                type: String,
                value: null
            },

            _rowMeta:{
                type: Object,
                value: null
            },

            //Treegrid Cfg. Can be overwriteable with user configuration
            _tgCfg: {
                type: Object,
                value: function(){
                    return{
                        Code:'GTXDVWLEAORYUB',
                        ColAdding: '7',
                        ColDeleting: '1',
                        Dragging: '0',
                        //MainCol: 'assetnum',
                        StandardFilter:'3',
                        Style:'GMA',
                        FastPanel: 0, //disables rendering the checkbox with fastpanel icons
                        MaxSort: 1,
                        Paging: 3,
                        SuppressCfg:'3',
                        ResizingMain: '3',
                        ConstHeight:'1',
                        ConstWidth:'1'
                    };
                }
            },

            _savedQuery:{
                type: String,
                value: null
            },

            //if we need to do a subselect query
            _subselects:{
                type: String,
                value: null
            },

            //Schema for creating translated table headers and defining how search/filter works and defining col types
            schema:{
                type: Object,
                value: null
            },

            //TreeGrid instance for this element
            _tg: {
                type: Object,
                value: function(){
                    return null;
                }
            },

            _childObjectName:{
                type: String,
                value: null
            },

            //the index of the child object in the attribute meta
            _childObjectIndex:{
                type: Number,
                value: null
            },

            //An empty string turns off Debug
            //An example of a debug string is: 'Info,Error,Problem,Check'
            tgDebugOptions: {
                type: 'String',
                value: ''
            },

            _cfgMeta:{
                type: Object,
                value: null
            },

            rejectChangesOnError:{
                type: Boolean,
                value: false
            },
            /**
             * Information we need in order to configure the element
            *every property is required
            *
            *Saved query relevant props from API:
            {
                osname: 'MXAPIOPERLOC' //object structure name
                savedquery: 'RUL5' //query name
            }

            - Either osName or collectionUri is required. collectionUri takes precedence.
            - If attributeNames exists, then it will take precendence over the queryTemplate attributenames
            - If attributeNames does not exist, then queryTemplate is required and the attributenames from the queryTemplate will be used.

            rowMeta is required to indicate focusrow, candelete, etc. Must be defined in accordance with the hierarchy if we have child tables.
            {
                CanDelete: 0,
                FocusRow: 0,
                child:{
                    objectName: ahrraction
                    CanDelete: 1,
                    CanAdd: 1

                    child:{
                        ...
                    }
                }                
            }
            *
            */
            config:{
                type: Object,
                value: function(){
                    return {
                        tgId: null,
                        osName: null,
                        attributeMeta: null,
                        rowMeta: null,
                        queryTemplate: null,
                        collectionUri: null,
                        //repair and replace actions view requires this
                        subselects: null
                    };
                },
                observer: '_handleConfigChanged'
            },

            /**
             * For child tables. Currently supports only one nested table.
             */
            Root:{
                type: Object,
                value:function(){
                    return{
                    //<Root CDef='MAIN' AcceptDef='MAIN'/>
                    CDef:'MAIN'
                    };

                }
            },

            /**
             * Store the treegrid Source object for later
             * 
             */
            _Source:{
                type: Object,
                value: null
            },

            Def:{
                type: Array,
                value: function(){
                    return [
                        {
                            //Def[1].Cfg
                            //<D Name='MAIN' CDef='DETAIL' Expanded='0'/>
                            Name: 'MAIN',
                            CDef:'DETAIL',
                            Expanded:'0',
                            Format: 'JSON'
                        },
                        //<D Name='DETAIL' DetailCol='NAME' DetailLayout='01-Detail.xml' Spanned='1' NAMESpan='4' CanExport='0' Expanded='0' CanExpand='0' CanFilter='0' CDef='DETAILROW' AcceptDef='DETAILROW'/>
                        {
                            Name: 'DETAIL',
                            DetailLayout: {
                                Cfg:{
                                    Dragging:'0',
                                    Dropping:'0',
                                    Code:'GTXDVWLEAORYUB',
                                    Style:'GMA',
                                    FastPanel: 0, //disables rendering the checkbox with fastpanel icons
                                    MaxSort: 1,
                                    //Paging: 3,
                                    SuppressCfg:'3',
                                    //ResizingMain: '3',
                                    ConstHeight:'0',
                                    ConstWidth:'1',
                                    AutoUpdate: 0,
                                    Format: 'JSON'
                                    //Detail: 1
                                },
                                Cols:[
                                    //{Name: 'rraction', Type:'Text', RelWidth: 1},
                                    //{Name: 'description', Type:'Text', RelWidth: 1}
                                    {Name: '_parentObj', Type:'Text', IsVisible: 0},
                                    {Name: '_href', Type:'Text', IsVisible: 0}
                                ],
                                Header:{
                                    CanDelete: 0,
                                    CanSelect: 0
                                },
                                Toolbar:{
                                    Visible: 0
                                }
                            },
                            Spanned: 1,
                            //assetnumSpan: 999,
                            Expanded:'0',
                            CanExpand:'0',
                            Format: 'JSON'
                        }
                    ];
                }
                    
            },

            isAttached:{
                type: Boolean,
                value: false
            },

            tgRenderWaiting:{
                type: Boolean,
                value: false
            }
        },

        /**
         * We use this to generate the table on the main div, since we know the DOM is ready at this point. Sometimes the config meta is modified
         * before the dom is ready, in which case the table will try to render without the main tag being present.
         */
        attached: function(){
            this.set('isAttached', true);

            //if a treegrid render is waiting for the dom to complete, then we go ahead and push to the render queue.
            if(this.tgRenderWaiting){

                //DOM is ready, so now fire the render request
                this.fire('tg-queue-for-render', this._tgId);
                this.set('tgRenderWaiting', false);
            }
        },

        /**
         * Exposes treegrid's reload function
         */
        reload: function(){
            if(this._tg){
                this._tg = this._tg.Reload(this._Source);
            }            
        },

        /**
         * Converts a treegrid changeset to a maximo-collection style bulk request
         */
        convertChangeSet: function(changeSet, grid){
        	var postBulkArray = [];
            var self = this;
        	if(changeSet){
        		changeSet.forEach(function(change, i){
        			var postObject = self.convertChangeToPostJson(change, grid);

                    //in the case where the changeset is actually just an empty row (for example, when we create the first child row)
                    //then we skip. Otherwise we push.
                    if(!$j.isEmptyObject(postObject._data)){
                        postBulkArray.push(postObject);
                    }
        			
                });
            }

            return postBulkArray;
        },

        /**
         * 
         */
        convertChangeToPostJson: function(change, grid){
        	var object = {};
        	var parenthref;
        	var parentMethod;
            var self = this;
            var objName;

        	var row = grid.GetRowById(change.id);
            	//delete object.id;

            var postObject = {};

        	if(row.Level === 2){
                object = {};
        		parentMethod = 'PATCH';

                //iterate through nested attributes and pick the ones that we want
                //we need to iterate over the row rather than the changeset because the changeset does not contain the complete set of information on all the
                //changes for child rows
                $j.each(row, function(key,value){                    
                    //iterate through the child meta
                    //attributemeta for asset then use index of ahrraction to iterate through attributemeta of ahrraction
                    self._attributeMeta[self._childObjectIndex].attributeMeta.forEach(function(attr){

                        //do not add to payload if we can't edit anyway. Does not apply to add, as we may add a row and then be unable to edit later.
                        if(!attr.meta.CanEdit && !change.Added){
                            return;
                        }

                        var unformatted = row[attr.Name];
                        var childSchema = self.schema[self._childObjectName].items.properties;
                        
                        if(row[attr.Name] === '' || !row[attr.Name]){
                            object[attr.Name] = unformatted;
                        }else if(childSchema[attr.Name].subType === 'DATE'){
                            //if date time, we need to convert from epoch time to iso date. Treegrid stores changes as epoch time.
                            object[attr.Name] = moment(unformatted).utc().format($M.getMaxauth().whoami.dateformat.toUpperCase());  
                        }
                        else if(childSchema[attr.Name].type === 'string'){
                            object[attr.Name] = String(row[attr.Name]);
                        }else if(childSchema[attr.Name].type === 'integer'){
                            object[attr.Name] = parseInt(unformatted);
                        }else if(childSchema[attr.Name].type === 'number'){
                            object[attr.Name] = parseFloat(unformatted);
                        }else{
                            object[attr.Name] = unformatted;
                        }
                    });
                });

        		//object.href = row._href;
                if(change.Changed == 1){
                    object._action = 'Update';
                    object.href = row._href;
                    //delete object.Changed;
                }else if(change.Added == 1){
                    object._action = 'Add';
                    //delete object.Added;
                }else if(change.Deleted == 1){
                    object._action = 'Delete';
                    object.href = row._href;
                    //delete object.Deleted;
                }
        		var parentTable = row.parentNode;
        		var parentRow = parentTable.parentNode;
        		postObject.href = parentRow._href;
                object._bulkid = change.id;
        	     //   var childName = row._objectName;
        		/** Need to work with **/
        		postObject[this._childObjectName] = [object];
        	}
        	if(row.Level === 0){
                if(change.Changed == 1){
                    parentMethod = 'PATCH';
                    //this is an edit, so the href is already in the grid.
                    object.href = row._href;
                }else if(change.Added == 1){
                    parentMethod = 'POST';
        	 	}else if(change.Deleted == 1){
                    parentMethod = 'DELETE';
                }
                $j.each(change, function(key,value){                 
                    //go through attribute meta
                    self._attributeMeta.forEach(function(attr){
                        if(!attr.isObject && (change[attr.Name] || change[attr.Name] === '')){
                            //we have to check the schema to see the type. If it is supposed to be a string type, we need to cast it to a string.
                            //for example, without casting, an assetnum of 1001 is sent as 1001 not '1001'.

                            //first check for dataPostFix.
                            var unformatted = change[attr.Name];

                            if(attr.dataPostFix){
                                var strVersion = unformatted.toString();
                                unformatted = strVersion.slice(0, strVersion.indexOf(attr.dataPostFix));
                            }

                            //unformatted is now either the original type or a string.

                            if(change[attr.Name] === ''){
                                object[attr.Name] = unformatted;
                            }else if(self.schema[attr.Name].subType === 'DATE'){
                                //if date time, we need to convert from epoch time to iso date. Treegrid stores changes as epoch time.
                                //unformatted = moment(unformatted).toISOString();
                                //we need to pull from timestamp

                                object[attr.Name] = moment(row[attr.Name]).utc().format($M.getMaxauth().whoami.dateformat.toUpperCase());
                                
                            }
                            else if(self.schema[attr.Name].type === 'string'){
                                object[attr.Name] = String(change[attr.Name]);
                            }else if(self.schema[attr.Name].type === 'integer'){
                                object[attr.Name] = parseInt(unformatted);
                            }else if(self.schema[attr.Name].type === 'number'){
                                object[attr.Name] = parseFloat(unformatted);
                            }else{
                                object[attr.Name] = unformatted;
                            }
                        }                            
                    });
                    
                });
                object._bulkid = change.id;                
        		postObject = object;
        	}

        	parenthref = postObject.href;

        	var bulkObject = {};
        	bulkObject._data = postObject;
        	if(parentMethod !== undefined && parentMethod !== 'POST'){
            		var bulkObjectMetaData = {};
            		bulkObjectMetaData.uri = parenthref;
            		bulkObjectMetaData.method = parentMethod;
            		if(parentMethod === 'PATCH'){
            			bulkObjectMetaData.patchtype = 'MERGE';
            		}
                    //if we are adding to a child row (objName is defined in row.Level == 2) then we only want the child row subset
                    if(objName){
                        bulkObjectMetaData.properties = objName+'{*}';
                    }else{
                        //otherwise get the parent level subset. TODO: needs to be a subset
                        bulkObjectMetaData.properties = '*';
                    }
            		bulkObject._meta = bulkObjectMetaData;
        	}
        	return bulkObject;
        }, 

        /**
         * We create the attribute names string through metadata by looping through the array. This is a recursive function
         * in order to create the appropriate expansions, such as oslc.select=assetname, ahrraction{action, description}
         * @param attributeMeta: The metadata for attributes
         */
        _getAttributeNamesString: function(attributeMeta){
            var attributeString = '';
            var self = this;

            //loop through all attribute metas
            attributeMeta.forEach(function(metaItem){
                //if we find that we are at an item that is actually a parent, go into it
                if(metaItem.isObject){
                    attributeString += metaItem.Name + '{' + self._getAttributeNamesString(metaItem.attributeMeta) + '},';
                }else{
                    //otherwise we just append 
                    attributeString += metaItem.Name + ',';
                }
            });

            //remove the last comma
            return attributeString.substring(0, attributeString.length - 1);
        },

        /**
         * These are props that, when changed, should invoke either a construction of the table or reload of the data,
         * depending on whether or not the table already exists. We put an observer on the object rather than each prop
         * because we only make changes to the grid based on all props at the same time 
         */
        _handleConfigChanged: function(){

            //these properties are required
            if(!this.config || !this._tgCfg){
                return;
            }

            var isValidConfig = false; 

            //first we clear out all all existing attributes
            this._attributeMeta = null;
            this._attributeNames = null;
            this._rowMeta = null;
            this._osName = null;
            this._collectionUri = null;
            this._savedQuery = null;
            this._subselects = null;
            this._childObjectName = null;
            this._cfgMeta = null;

            //we can only construct or recreate the tree if all of these attributes are present     
            //we first check for the presence of the osname and attribute names. If they exist, we manually construct the table
            //rather than going through query template   
            if(this.config.tgId && (this.config.osName || this.config.collectionUri) && this.config.attributeMeta){

                //first we set the private props
                this.set('_tgId',this.config.tgId);                
                this.set('_attributeMeta',this.config.attributeMeta);

                //set the appropriate object, either through osname or collectionuri
                if(this.config.osName){
                    this.set('_osName',this.config.osName);
                }else{
                    this.set('_collectionUri',this.config.collectionUri);
                }

                //it is ok not to check for null, because a null saved query will work fine
                //this.set('_savedQuery',this.config.savedQuery)
                if(this.config.queryTemplate){
                    this.set('_savedQuery', this.config.queryTemplate.savedquery);
                }

                //save the row meta
                if(this.config.rowMeta){
                    this.set('_rowMeta', this.config.rowMeta);
                }

                if(this.config.subselects){
                    this.set('_subselects', this.config.subselects);
                }

                //save the cfg meta
                if(this.config.cfgMeta){
                    this.set('_cfgMeta', this.config.cfgMeta);
                }   

                isValidConfig = true;
            }else if(this.config.queryTemplate){
                //if the passed in config has a query template, we try that next
                //TODO: need to remove using attributenames

                //since the query template can give us all the information we need, we look one at a time for the existence
                //of required attributes
                
                //auto populate osname
                if(this.config.osName){
                    this.set('_osName',this.config.osName);
                }else{
                    this.set('_osName',this.config.queryTemplate.osname);
                } 

                this.set('_savedQuery' , this.config.queryTemplate.savedquery);

                isValidConfig = true;
            }

            //then we create the Source object required for TreeGrid if the config object was valid
            if(isValidConfig){
                // when we have any cfgMeta from external, override or add new key to the existing cfg object
            	if(this._cfgMeta && this._cfgMeta !== null){
            		for(var key in this.config.cfgMeta){
            			this._tgCfg[key] = this._cfgMeta[key];
            		}
            	}

                this._tgCfg.CSS= this.resolveUrl('../../libraries/treegrid/Grid/Iot/Grid.css');

                var baseurl = this.resolveUrl('../../');
                var basepath = baseurl+'libraries/treegrid/Grid/';

                //Source object is used by TreeGrid to render
                var Source = {
                    Debug: this.tgDebugOptions,
                    BasePath:basepath
                };

                this._attributeNames = this._getAttributeNamesString(this._attributeMeta);
                
                Source.Data = {
                                Url:'maximocollection',
                                Method: 'GET',
                                Format: 'JSON',
                                maximoCollection: this.$.collection,
                                maximoAttributeMeta: this._attributeMeta,
                                treegridCfg: this._tgCfg,
                                //maximoParent: this
                };
                
                Source.Page = {
                                Url:'maximocollectionpage',
                                Method: 'GET',
                                Format: 'JSON',
                                maximoCollection: this.$.collection,
                                maximoAttributeMeta: this._attributeMeta,
                                treegridCfg: this._tgCfg,
                                //maximoParent: this
                };

                Source.Upload={
                    Format: 'JSON',  
                    Method: 'POST', 
                    Url:'maximoupload'
                };

                var self = this;

                this.$.maxschema.fetchSchema().then(function(){
                    Source.Data.maximoSchema = self.schema;
                    Source.Page.maximoSchema = self.schema;

                    //first we check to see if any other treegrids with this id exist
                    var foundGrid = false;
                    var gridInstance = null;

                    Grids.forEach(function(grid){
                        if(grid && grid.id === self._tgId){
                            foundGrid = true;
                            gridInstance = grid;
                        }
                    });

                    self.set('_Source',Source);

                    if(!self.isAttached){
                        self.set('tgRenderWaiting', true);
                    }else{
                        self.fire('tg-queue-for-render', self._tgId);
                    }                 
                });
            }
        },

        /**
         *  We create the treegrid and add in all event handlers. We wrap the event handlers so they can fire polymer events
         */
        createTreeGrid: function(){

            //first we check to see if any other treegrids with this id exist
            var foundGrid = false;
            var self = this;

            Grids.forEach(function(grid){
                if(grid && grid.id === self._tgId){
                    foundGrid = true;
                    //gridInstance = grid;
                }
            });
            
            if(foundGrid){
            	//this._tg = gridInstance;    
                //this._tg.ActionClearFilters();            
                //if we find the grid, rather than create a new treegrid, we reload the original. 
                this._tg = this._tg.Reload(this._Source);                
            }else{
                TGSetEvent('OnCustomAjax',this._tgId,this.onCustomAjax.bind(this));
                TGSetEvent('OnDataGet',this._tgId,this.onDataGet.bind(this));
                TGSetEvent('OnSelect',this._tgId,this.onSelect.bind(this));
                TGSetEvent('OnRenderStart',this._tgId,this.onRenderStart.bind(this));
                TGSetEvent('OnRenderFinish',this._tgId,this.onRenderFinish.bind(this));
                TGSetEvent('OnSave',this._tgId,this.onSave.bind(this));
                TGSetEvent('OnClickCell',this._tgId,this.onClickCell.bind(this));
                TGSetEvent('OnFilter',this._tgId,this.onFilter.bind(this));
                TGSetEvent('OnReload',this._tgId,this.onReload.bind(this))
                //TGSetEvent('OnLinkClick',this._tgId,this.onClickCell.bind(this));

                var treegrid = TreeGrid(
                    self._Source,'main_'+self._tgId,self._tgId
                );
    
                self.set('_tg', treegrid);
            }          
        },

        onReload: function(grid){
            grid.ActionClearFilters();
            //this._tg = grid;
        },

        /**
         * Need to pass a prop that says whether or not to proceed with filter if there are changes still to be made
         */
        onFilter: function(grid,type){
            this._tg = grid;
            var changes = JSON.parse(this._tg.GetChanges());            

            if(changes.Changes.length > 0){
                //notify that we have some changes
                this.fire('tg-unsaved-filter-change');

                //do not filter
                //return true;
            }
        },

        onClickCell: function(grid,row,col,x,y){
            var data = {
                grid: grid,
                row: row,
                col: col,
                x: x,
                y: y
            };

            this.fire('tg-on-click-cell', data);
        },

        tgInstance: function(){
            return this._tg;
        },

        onSave: function(grid, row, autoupdate){
            var data = {
                grid: grid,
                row: row,
                autoupdate: autoupdate
            };

            //TODO: Check if we have a flag for custom saving. If we don't, then use our default bulk api.
            if(true){

                //grid.AcceptChanges();

                //we need to loop through the changeset to accept changes in all child rows too                
                var parsed = JSON.parse(grid.GetChanges());
                var payload = this.convertChangeSet(parsed.Changes, grid);
                this.$.collection.createRecordBulk(payload);
            }else{
                this.fire('tg-on-save', data);
            }

            return true;                   
        },

        /**
         * When we save to the collection successfully, we tell treegrid to accept all changes.
         */
        _handleRecordCreatedBulkSuccess: function(e){
            //we need to loop through all metas to see if we have an error

            var self = this;
            var parsed = JSON.parse(this._tg.GetChanges());

            //TODO: ensure the order of changes is the same as the order of returned responses. We have to get the orderby.

            //we need to keep track of a responseIndex because there are some grid changes that we need to ignore.
            var responseIndex = 0;
            //var resLength;
            var errors = [];

            //use parsed.Changes.Change to get the actual add/edit status.

            parsed.Changes.forEach(function(change, index){
                var res = e.detail[responseIndex];
                var row = self._tg.GetRowById(change.id);
                var statusInt = parseInt(res._responsemeta.status);

                if(row._hierarchy.includes('detail')){
                    //this is just a detail row for treegrid, we do not include this when comparing against the response changeset
                    //just accept the detail row and return
                    self._tg.AcceptChanges(row);
                    return;
                }

                //we accept when status code is in 200 range
                if(statusInt >= 200 && statusInt < 300){

                    //first check if this is an existing parent row or child row
                    if(row._hierarchy.includes('child') && change.Changed){
                        //if it includes |, then it is the child. We know there is a detail grid.
                        //TODO: do the dependency validation for child rows too
                        row.DetailGrid[0].AcceptChanges(row.DetailRow[0]);
                    }else if(row._hierarchy.includes('parent') && change.Changed){
                        //otherwise, it is the parent, and we don't need to deal with detail grids
                        self._attributeMeta.forEach(function(attr){

                            var rowData = row[attr.Name];
                            var responseData = res._responsedata[attr.Name];
                            var responseDataParent = res._responsedata;

                            //set the value of the relevant attribute
                            if(rowData != responseData && !attr.isObject){
                                //loop through all relevant attributes and populate the properties from the server

                                //if there is no value for this attribute, it may have been blanked out. Include it as blank.
                                if(!responseData){
                                    self._tg.SetValue(row, attr.Name, null, 1);
                                }else{
                                    //for date types, we need to convert to epoch time
                                    if(self.schema[attr.Name].subType === 'DATE'){
                                        //var epoch = moment(responseData).valueOf();
                                        //TODO: Change this so we update the date format to only show a specific format based on subtype. For now, we
                                        //remove -

                                        var momentDateFormat = $M.getMaxauth().whoami.dateformat.toUpperCase();

                                        var convertedDate = moment(responseData).utc().format(momentDateFormat);
                                        self._tg.SetValue(row, attr.Name, convertedDate, 1);
                                        
                                        //then check for any postfix data, in which case we have to add that in
                                    }else{
                                        if(attr.dataPostFix){
                                            responseData = responseData + attr.dataPostFix;
                                        }

                                        if(attr.useDesc){
                                            responseData = responseDataParent[attr.Name+'_description'];
                                        }
                                        //otherwise just use the value the server gives us
                                        self._tg.SetValue(row, attr.Name, responseData, 1);
                                    }
                                }                                                          
                            }
                        });
                        
                    }else if(row._hierarchy.includes('child') && change.Added){
                        //we are dealing with child rows, so we automatically assume there is a childobjectname to refer to
                        //var resLength = res._responsedata[self._childObjectName].length;
                        //var childHref = res._responsedata[self._childObjectName][resLength - 1].href; //We need a better way to figure out which row this corresponds to. Right now we just take the last from response and assume that is the one we want.
                        
                        //var childMaximoRow = res._responsedata[self._childObjectName][resLength - 1];

                        var maxId;
                        var childMaximoRow;
                        res._responsedata[self._childObjectName].forEach(function(resChildRow){
                            //if there is no maxId yet or if maxId is less than the response maxId
                            if(!maxId){
                                maxId = resChildRow[self._childObjectName+'id'];
                                childMaximoRow = resChildRow;
                            }else if(maxId < resChildRow[self._childObjectName+'id']){
                                maxId = resChildRow[self._childObjectName+'id'];
                                childMaximoRow = resChildRow;
                            }                            
                        });

                        var childHref = childMaximoRow.href;

                        //var parentHref = row.parentNode.parentNode._href;
                        //this is a newrow
                        //if this row contains a detail grid already
                        if(row.DetailGrid){

                            //look for any usedesc
                            self._attributeMeta[self._childObjectIndex].attributeMeta.forEach(function(attr){
                                if(attr.useDesc){
                                    row.DetailGrid[0].SetValue(row.DetailRow[0], attr.Name, childMaximoRow[attr.Name+'_description'], 1);
                                }
                            });

                            //then we accept this change to the detail grid and provide it a new href, since server information should have it now
                            row.DetailGrid[0].SetValue(row.DetailRow[0], '_href', childHref, 1);
                            //row.DetailGrid[0].SetValue(row.DetailRow[0], 'id', parentHref + '|' + childHref, 1);
                            row.DetailGrid[0].AcceptChanges(row.DetailRow[0]);
                            row.DetailGrid[0].AcceptChanges(row);
                        }else{
                            //look for any usedesc
                            self._attributeMeta[self._childObjectIndex].attributeMeta.forEach(function(attr){
                                if(attr.useDesc){
                                    self._tg.SetValue(row, attr.Name, childMaximoRow[attr.Name+'_description'], 1);
                                }
                            });
                            //we are trying to add a new child row, but this row either has not been expanded or has no children yet
                            self._tg.SetValue(row, '_href', childHref, 1);
                            //self._tg.SetValue(row, 'id', parentHref + '|' + childHref, 1);
                        }
                    }else if(row._hierarchy.includes('parent') && change.Added){
                        //we are dealing with a new parent level row.
                    }

                    self._tg.AcceptChanges(row);
                }else{
                    errors.push(res);

                    if(row._hierarchy.includes('child') && change.Added){
                        if(self.rejectChangesOnError && row.DetailGrid){
                            row.DetailGrid[0].AcceptChanges(row.DetailRow[0]);                                    
                            row.DetailGrid[0].RemoveRow(row.DetailRow[0]);
                        }
                        
                        if(self.rejectChangesOnError){
                            //if no detail grid, then this is the first child
                            self._tg.AcceptChanges(row);
                            self._tg.RemoveRow(row);
                        }
                        
                    }else if(change.Changed){
                        //if this is actually a change, we can just reject the change
                        if(row._hierarchy.includes('parent')){
                            //console.log(row);
                        }
                    }
                }               
                //this will get all changes for the table, including rows and nested rows. We don't care about the intermediate
                //rows, so only deal with the child nodes

                 responseIndex++;                          
            });

            if(errors.length === 0){
                //we need to do this because treegrid does not recursively inspect when we accept changes at the child level.
                //so we need to notify of the accept changes at the top level too.
                self._tg.AcceptChanges();
                self.fire('tg-save-success', errors); 
            }else{
                self.fire('tg-save-error', errors);
            }

            //always send an array out with errors, even if empty.
            self.fire('tg-save-errors', errors);
           
        },

        /**
         * Wrapper for OnRenderStart event of TreeGrid.
         */
        onRenderFinish: function(grid){
            var data = {
                grid: grid,
            };

            //when a render finishes, we set the grid to our internal grid instance
            this._tg = grid;

            this.fire('tg-on-render-finish', data);
        },

        /**
         * Wrapper for OnRenderStart event of TreeGrid.
         */
        onRenderStart: function(grid){
            var data = {
                grid: grid,
            };
            this.fire('tg-on-render-start', data);
        },

        /**
         * Wrapper for the OnSelect event of TreeGrid.
         */
        onSelect: function(grid,row,deselect,cols){
            var data = {
                grid: grid,
                row: row,
                deselect: deselect,
                cols: cols
            };
            this.fire('tg-on-select', data);
        },

        onCustomAjax: function(grid, source, data, callback){

            if(source.maximoCollection){

               var maximoAttributeMeta = source.maximoAttributeMeta;

                //we check to see if we are sorting by anything
                if(data){
                    var dataObj = JSON.parse(data);

                    var sort = dataObj.Cfg.SortCols;
                    if(sort){
                        if(dataObj.Cfg.SortTypes === ''){
                            source.maximoCollection.set('orderByAttributeNames','%2B'+sort);
                        }else if(dataObj.Cfg.SortTypes === '1'){
                            source.maximoCollection.set('orderByAttributeNames','-'+sort);
                        }
                    }

                    var filters = dataObj.Filters;
                    //all filters stored in one object
                        if(filters.length > 0){
                        /*
                            The filters array looks like
                            [
                            {
                                id: Filter
                                assetnum: '1000'
                                installdate: '2016-12-01'
                            }
                            ]
                        */
                        //loop through each filter and only care about the ones that we have

                        var additionalParams = [];
                        var oslcWhere = '';
                        var isFirst = true;

                        var self = this;

                        $j.each(filters[0], function(key,value){
                            //if this key matches one of the attributenames that we care about
                            var relevantAttribute = false;
                            for(var i = 0; i < maximoAttributeMeta.length; i++){
                                //TODO: add child inspection back in
                                if(maximoAttributeMeta[i].Name === key && !maximoAttributeMeta[i].isObject){
                                    relevantAttribute = true;
                                    break;
                                }
                            }

                            if(relevantAttribute){
                                //we set a maximo-collection filter clause
                                //additionalParams.push('oslc.where='+key+'='+'%22%25'+value+'%25%22')
                                if(value !== ''){
                                    if(isFirst){
                                    isFirst = false;
                                    oslcWhere = 'oslc.where='+ key;//+'='+'%22%25'+value+'%25%22'
                                }else{
                                    oslcWhere += ' and ' + key;//+'='+'%22%25'+value+'%25%22'
                                }

                                switch(filters[0][key+'Filter']){
                                    //like
                                    case '11':
                                        oslcWhere += '=' + self.getCorrectWhere('%25'+value+'%25', key, source.maximoSchema);
                                        break;
                                    case '1':
                                        oslcWhere += '=' + self.getCorrectWhere(value, key, source.maximoSchema);
                                        break;
                                    case '2':
                                        oslcWhere += '!=' + self.getCorrectWhere(value, key, source.maximoSchema);
                                        break;
                                    case '3':
                                        oslcWhere += '<' + self.getCorrectWhere(value, key, source.maximoSchema);
                                        break;
                                    case '4':
                                        oslcWhere += '<=' + self.getCorrectWhere(value, key, source.maximoSchema);
                                        break;
                                    case '5':
                                        oslcWhere += '>' + self.getCorrectWhere(value, key, source.maximoSchema);
                                        break;
                                    case '6':
                                        oslcWhere += '>=' + self.getCorrectWhere(value, key, source.maximoSchema);
                                        break;
                                    }
                                }

                            }
                        });

                        additionalParams.push(oslcWhere);

                        source.maximoCollection.set('additionalParams',additionalParams);
                    }

                }

                //we communicate with the collection
                if(source.Name === 'Data'){
                    return source.maximoCollection.refreshRecords().then(function(e){
                        callback(0, e.response.member);
                        return true;
                    }).catch(function(ex){
                        //one of the filters was most likely invalid
                        callback(0, []);
                        return true;
                    });
                }else if(source.Name === 'Page'){
                    var dataRes = JSON.parse(data);
                    //first we need to see if there exists any pages
                    //var numPages = source.maximoCollection.getTotalPages();
                    return source.maximoCollection.refreshPage(parseInt(dataRes.Body[0].Pos) + 1).then(function(e){
                        callback(0, e.response.member);
                        return true;
                    }).catch(function(ex){
                        //probably ran into no pages
                        callback(0, []);
                        return true;
                    });

                }
            }

        },

        /**
         Gets the correct type for putting in the oslc where clause. If number, we don't use %22
        **/
        getCorrectWhere: function(value, attributeName, schema){
            var type = schema[attributeName].type;
            if(type === 'integer'){
                return value;
            }else if(type === 'number'){
                if(schema[attributeName].subType === 'AMOUNT'){
                    return value;
                }
            }
            else{

                if(schema[attributeName].subType === 'DATE'){
                    //TODO: change this so the date value is correct in the filter... seems to default to MM/DD/YYYY
                    value = moment(value,'MM/DD/YYYY').utc().format($M.getMaxauth().whoami.dateformat.toUpperCase());
                    //value = 
                }
                return '%22' + value + '%22';
            }
        },



        /**
         * Parses the response data against the maximoAttributeMeta. We do this recursively 
         * in the case where we encounter an attributeMeta where isObject is true. We recursively
         * break down the schema so the child has exactly what they need
         * 
         * @param {Object} maximoAttributeMeta - Object that contains the attributeMetaData
         * @param {Object} schema - Schema from maximo-schema. Must resolve all child subschemas if applicable
         * 
         * TODO: Need to get schema for each child. Possibly list object names in attribute meta?
         */
        _createTableHeadersAndCols: function(maximoAttributeMeta, schema, isChild){
            
            //this.

            var header = {CanDelete: 0};
            var cols = [];
            var head = 	[{Kind:'Filter', FocusRow: '', PanelVisible:0}];            
            
            //used for nested children
            // var root = {
            //                 //<Root CDef='MAIN' AcceptDef='MAIN'/>
            //                 CDef:'MAIN'
            //             };
            //var def;
           // var hasChild = false;

           var self = this;

            maximoAttributeMeta.forEach(function(attributeObj, index){     
                //TODO: attributeObj.isObject to check for nested tables
                if(!header[attributeObj.Name] && !attributeObj.isObject){
                    var col = {
                        Name: attributeObj.Name
                    };

                    //for each piece of metadata, we update the treegrid col metadata.
                    //we expect the metadata properties to match the treegrid metadata properties.
                    $j.each(attributeObj.meta, function(key, val){
                        col[key]=val;
                    });

                    //we then check for some important meta. If these are not present, we default them.
                    col.RelWidth = col.RelWidth === 0 ? 0 : 1;
                    col.CanEdit = col.CanEdit ? col.CanEdit : 0;
                    col.Align = 'Left';                    

                    header[attributeObj.Name] = schema[attributeObj.Name].title;
                    //header[attributeObj.Name + 'Wrap'] = 1;

                    //check for date subtype first
                    if(schema[attributeObj.Name].subType === 'DATE'){
                        //if this is a date, we need to specify the column as a date type
                        // head[0][attributeObj.Name+'FilterMenu'] = {
                        //     ShowCursor:0,
                        //     Items:[
                        //         { Name:0},
                        //         //strings normally shouldn't compare greater or less than, but we support it through oslc
                        //         {Columns:1, Items:[1,2,3,4,5,6,7,9,11]}
                        //     ]
                        // };

                        col.Type = 'Date';
                        //TODO: change format to match whoami local setting
                        col.Format = $M.getMaxauth().whoami.dateformat;
                        col.EditFormat = $M.getMaxauth().whoami.dateformat;
                        head[0][attributeObj.Name+'Format'] = $M.getMaxauth().whoami.dateformat;
                        head[0][attributeObj.Name+'EditFormat'] = $M.getMaxauth().whoami.dateformat;

                        //do check for whoami                       
                    }
                    else if(schema[attributeObj.Name].type === 'number'){
                        col.CanEmpty = 1;
                        //this is currency
                        if(schema[attributeObj.Name].subType === 'AMOUNT'){
                            col.Type = 'Float';
                        }if(schema[attributeObj.Name].subType === 'DURATION'){
                            col.Type = 'Int';
                        }
                    }
                    //we also add the appropriate filter based on schema
                    else if(schema[attributeObj.Name].type === 'string'){
                        head[0][attributeObj.Name+'FilterMenu'] = {
                            ShowCursor:0,
                            Items:[
                                { Name:0},
                                //strings normally shouldn't compare greater or less than, but we support it through oslc
                                {Columns:1, Items:[1,2,3,4,5,6,7,9,11]}
                            ]
                        };
                    }else if(schema[attributeObj.Name].type === 'integer'){
                        col.CanEmpty = 1;

                        //if we are appending something to the value (ex. % for 95%), the col type is actually a string according to treegrid.
                        //putting 95% in an Int cell will make it render as NaN
                        if(attributeObj.dataPostFix){
                            head[0][attributeObj.Name+'FilterMenu'] = {
                                ShowCursor:0,
                                Items:[
                                    { Name:0},
                                    {Columns:1, Items:[1,2,3,4,5,6]}
                                ]
                            };
                            head[0][attributeObj.Name+'DefaultFilter'] = 1;
                        }else{
                            col.Type = 'Int';
                        }

                    }

                    cols.push(col);
                }else if(attributeObj.isObject){
                    //if it is an object, then we assign child variable
                    self._childObjectName = attributeObj.Name;
                    self._childObjectIndex = index;
                }
            });

            if(self._rowMeta){
                if(isChild && self._rowMeta.child){
                    if(self._rowMeta.child.CanSelect === 0){
                        header.CanSelect = 0;
                    }                    
                }else if(!isChild && self._rowMeta){
                    if(self._rowMeta.CanSelect === 0){
                        header.CanSelect = 0;
                    }                    
                }
            }

            return {header: header, cols: cols, head: head};    
        },

        onDataGet: function(grid, source, data, io){
            if(Array.isArray(data)){
                //now we parse the returned data to ensure that it fits the treegrid format.
                var body = [{
                    Name: 'Page 1'
                }];
                var bodyItems = [];
                var cols = [];
                var header = {CanDelete: 0};
                var head = 	[{Kind:'Filter', FocusRow: ''}];

                var childCols = [];
                var childHeader = {CanDelete: 0};
                var childHead = 	[{Kind:'Filter', FocusRow: ''}];

                var maximoAttributeMeta = source.maximoAttributeMeta;
                var self = this;

                /**
                 * We configure nested tables through Root and Def tags. We need to merge them.
                 */
                //var nested = this._configureNestedTables(this._attributeMeta)

                //we create the columns and headers on the first run and only if they don't exist
                
                var ret = this._createTableHeadersAndCols(maximoAttributeMeta, source.maximoSchema, false);
                cols = ret.cols;
                header = ret.header;
                head = ret.head;

                //get all relevant child attributes
                
                var relevantChildAttributes;
                var childObject;

                maximoAttributeMeta.forEach(function(attributeObj){
                    if(attributeObj.isObject){
                        childObject = attributeObj;
                        relevantChildAttributes = attributeObj.attributeMeta;
                    }
                });

                if(relevantChildAttributes){                    
                    ret = this._createTableHeadersAndCols(relevantChildAttributes, source.maximoSchema[childObject.Name].items.properties, true);
                    childCols = ret.cols;
                    childHeader = ret.header;
                    childHead = ret.head;    
                }                

                //loop through each row of the dataset
                data.forEach(function(maximoCollectionRow, parentIndex){

                    //we compose a row on the treegrid by going through the attributes one at a time
                    var treegridRow = {};

                    //we still need to consider the attributes that are not returned by maximo-collections but are referenced by attributenames
                    var remainingAttributeMeta = maximoAttributeMeta.slice();

                    //we only care about the attributes that are searched for in maximo collections
                    maximoAttributeMeta.forEach(function(attributeObj){

                        //when we encounter an attribute that is actually an object. This can only happen once.
                        if(maximoCollectionRow[attributeObj.Name] && attributeObj.isObject){                               
                            // treegridRow['Items'] = [
                            //   {
                            //     CanDelete: 0,
                            //     CanSelect: 0,
                            //     Items:[
                            //       {action: 'refurbish', status:'needs repair'},
                            //       {action: 'replace', status:'needs replacement'}
                            //     ]
                            //   }
                            // ]

                            //treegridRow needs to know to expect child rows
                            treegridRow.Items = [
                                {
                                    _objectName: attributeObj.Name,
                                    CanDelete: 0,
                                    CanSelect: 0,
                                    Items:[]
                                }
                            ];

                            //get all relevant child attributes
                            var relevantChildAttributes = attributeObj.attributeMeta;


                            // var ret = self._createTableHeadersAndCols(relevantChildAttributes, source.maximoSchema[attributeObj.Name].items.properties, true);
                            // childCols = ret.cols;
                            // childHeader = ret.header;
                            // childHead = ret.head;                            

                            //loop through the child dataset
                            //ahrraction: [{rraction: action, description:description}, {rraction: action, description:description}]
                            maximoCollectionRow[attributeObj.Name].forEach(function(maximoChildRow, childIndex){
                                //the child row we are creating for treegrid    
                                var childRow = {};  

                                $j.each(maximoChildRow, function(attribute,val){                                  
                                    //go through the metadata for child attributes. If it is a match, we add it
                                    for(var i = 0; i < relevantChildAttributes.length; i++){
                                        //if one of the attributes from maximo collection row is a relevant child
                                        if(relevantChildAttributes[i].Name === attribute){
                                            if(relevantChildAttributes[i].useDesc){
                                                childRow[attribute] = maximoChildRow[attribute+'_description'];
                                            }else{
                                                childRow[attribute] = val;
                                            }                                            

                                            //if we have a dataPostFix configuration, append it now.
                                            if(relevantChildAttributes[i].dataPostFix){
                                                childRow[attribute] = childRow[attribute] + relevantChildAttributes[i].dataPostFix;
                                            }                                          
                                        }
                                    }                                                                  
                                });

                                //add the mandatory href and parentObj
                                childRow._objectName = attributeObj.Name;
                                childRow._href = maximoChildRow.href;
                                childRow._parentId = maximoCollectionRow.href;
                                childRow._hierarchy = 'child';
                                //childRow._id = maximoChildRow.href;
                                
                                //| denotes this is a child row
                                //childRow.id = maximoCollectionRow.href + '|' + maximoChildRow.href;                                

                                //if there is row meta information for the child, apply it now
                                if(self._rowMeta.child){
                                    $j.each(self._rowMeta.child, function(key, val){
                                        childRow[key] = val;
                                    });
                                }

                                 treegridRow.Items[0].Items.push(childRow); 
                            });                            
                        }

                        //when we have found an attribute in the row that matches with the attributenames we want to display
                        else if(maximoCollectionRow[attributeObj.Name] && !attributeObj.isObject){
                            treegridRow[attributeObj.Name] = maximoCollectionRow[attributeObj.Name];

                            if(attributeObj.useDesc){
                                                                //store the original value for reference later
                                treegridRow[attributeObj.Name+'_orig'] = maximoCollectionRow[attributeObj.Name];

                                treegridRow[attributeObj.Name] = maximoCollectionRow[attributeObj.Name+'_description'];

                                //store original desc to check if we actually had a change to this value
                                treegridRow[attributeObj.Name+'_origdesc'] = maximoCollectionRow[attributeObj.Name];
                            }

                            //TODO: if date, we should get the localized version
                             if(source.maximoSchema[attributeObj.Name].subType === 'DATE'){
                                 treegridRow[attributeObj.Name] = maximoCollectionRow[attributeObj.Name + '_localized'];

                                // var momentDateFormat = $M.getMaxauth().whoami.dateformat.toUpperCase();
                                // //convert from ISO time UTC to locale
                                // treegridRow[attributeObj.Name] = moment(maximoCollectionRow[attributeObj.Name]).utc().format(momentDateFormat);
                                // treegridRow[attributeObj.Name+'Format'] = $M.getMaxauth().whoami.dateformat;
                                // treegridRow[attributeObj.Name+'EditFormat'] = $M.getMaxauth().whoami.dateformat;
                            }

                            if(maximoCollectionRow[attributeObj.Name + '_maxvalue']){
                            	treegridRow[attributeObj.Name + '_maxvalue'] = maximoCollectionRow[attributeObj.Name + '_maxvalue'];
                            }
                            
                            //if we have a dataPostFix configuration, append it now.
                            if(attributeObj.dataPostFix){
                                treegridRow[attributeObj.Name] = treegridRow[attributeObj.Name] + attributeObj.dataPostFix;
                            }  

                            treegridRow[attributeObj.Name + 'CanFocus'] = 0;
                            
                            if(attributeObj.meta){
                                if(attributeObj.meta.CanEdit == 1){
                                    treegridRow[attributeObj.Name + 'CanFocus'] = 1;
                                }

                                
                                $j.each(attributeObj.meta, function(key,val){
                                    treegridRow[attributeObj.Name + key] = val;
                                });
                            }           

                            //remove from remaining attribute names, since we have already looked at it
                            for(var i = 0; i < remainingAttributeMeta.length; i++){
                                if(remainingAttributeMeta[i].Name === attributeObj.Name){
                                    remainingAttributeMeta.splice(i, 1);
                                    break;
                                }
                            }
                            
                        }
                    });

                    //if we have some remaining attribute names, set default params for them.
                    //this enables focus customization for attributes that did not have values.
                    if(remainingAttributeMeta.length > 0){
                        remainingAttributeMeta.forEach(function(attributeObj){
                            if(!attributeObj.isObject){
                                treegridRow[attributeObj.Name + 'CanFocus'] = 0;
                                if(attributeObj.meta){
                                    if(attributeObj.meta.CanEdit == 1){
                                        treegridRow[attributeObj.Name + 'CanFocus'] = 1;
                                    }

                                    $j.each(attributeObj.meta, function(key,val){
                                        treegridRow[attributeObj.Name + key] = val;
                                    });
                                }   
                            }
                        });
                    }

                    //now we update the treegrid row metadata
                    if(self._rowMeta){
                        //TODO: Need to account for nested children
                        $j.each(self._rowMeta, function(key,value){
                            if(key != 'child'){
                                treegridRow[key]=value;
                            }                            
                        });
                    }

                    treegridRow._href = maximoCollectionRow.href;
                    treegridRow.FocusRow = treegridRow.FocusRow ? treegridRow.FocusRow : 'Color';
                    treegridRow.CanDelete = treegridRow.CanDelete ? treegridRow.CanDelete : 0;
                    treegridRow._hierarchy = 'parent';
                    //treegridRow.Detail = 'DetailNested';
                    //treegridRow.id=maximoCollectionRow.href;
                    //treegridRow._id=maximoCollectionRow.href;

                    bodyItems.push(treegridRow);
                });

                //Generate the configuration
                var root = {};
                root.Cfg = source.treegridCfg;
                //set the main column to the first attribute
                root.Cfg.MainCol = this._attributeMeta[0].Name;
                root.Cols = cols;

                /*
                Body:[
                {name: first page, Items: bodyItems}
                ]
                */
                body[0].Items = bodyItems;

                //we get the total number of pages
                var totalPages = source.maximoCollection.getTotalPages();

                for(var i = 1; i < totalPages; i++){
                    body.push({Name: 'Page ' + (i+1)});
                }

                root.Body = body;

                root.Head = head;

                root.Header = header;
                root.Pager = {Visible: 0};
                root.Root = this.Root;

                
                if(typeof(this.Def[1].DetailLayout) === 'string'){
                    this.Def[1].DetailLayout = JSON.parse(this.Def[1].DetailLayout);
                }

                this.Def[1].DetailLayout.Cfg.CSS = this.resolveUrl('../../libraries/treegrid/Grid/Iot/Grid.css');
                this.Def[1].DetailLayout.Cols = childCols;
                this.Def[1].DetailLayout.Header = childHeader;
                this.Def[1].DetailLayout.Head = childHead;
                this.Def[1].DetailCol = this._attributeMeta[0].Name;
                this.Def[1][this._attributeMeta[0].Name + 'Span'] = 999;

                this.Def[1].DetailLayout.CanDelete = childCols; 

                //must be overriden at the row level
                //This controls how new child rows look.
                this.Def[1].CanDelete = 1;
                this.Def[1].CanSelect = 0;

                //stringify nested
                this.Def[1].DetailLayout = JSON.stringify(this.Def[1].DetailLayout);         

                root.Def = this.Def;

                return JSON.stringify(root);
            }
        }
});