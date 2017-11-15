/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016, 2017
 */
Polymer({
  is: 'maximo-asset-failure',
    behaviors: [BaseComponent],
  properties : {
    assetdata1 : {
      type: Object
    },
    assetdata2 : {
      type: Object
    },
    groupByData1 : {
      type: Object
    },
    groupByData2 : {
      type: Object
    },
    chartdata : {
      type:Array,
      value:[]
    },
    labels : {
      type:Array
    },
    chartoptions: {
      type: Object,
      value: {}
    },
    isReady:{
      type:Number,
      value:0
    }
  },
    created : function(){
      
    },
    ready : function(){
      this.hovertemplates = [this.localize('uitext', 'mxapiwo', 'WorkType0'),this.localize('uitext', 'mxapiwo', 'BacklogLaborDays0')];      
      this.hovertemplates = [this.localize('uitext', 'mxapipo', 'Priority0'),this.localize('uitext', 'mxapipo', 'PercentageAssetsNoFailure0')];
    },
    attached: function(){
      
    },
    _handleAssetDataRefreshed1 : function() {
      this.isReady++;
      
      if(this.isReady>=2){
        this.generateChart();
      } 
    },
    _handleAssetDataRefreshed2 : function() {
      this.$.assetdata2.fetchGroupByData();
          
    },
    _handleGroupByDataRefreshed1 : function() {
    },
    _handleGroupByDataRefreshed2 : function() {
       this.isReady++;
       if(this.isReady>=2){
        this.generateChart();}
    },
    generateChart:function(){
      if(this.isReady===2){
        this.groupByData2.sort(function(a,b) {
        	return (b.count - a.count);
        });
        var ad1=this.$.assetdata1.totalCount;
        var count=$M.createAttrArrayFromRecords(this.groupByData2,'count');
        var factor;
        for(var i=0; i<count.length;i++){
        	factor=Math.round((count[i]/ad1)*100);
        	this.chartdata.push(factor);
        }
       
        this.labels =$M.createAttrArrayFromRecords(this.groupByData2,'priority');
        this.labels.sort(function(a,b) {
        return (a - b);
        });
        for (var i = 0; i < this.labels.length;i++) {
          if (this.labels[i]!==null) {
            this.labels[i] = "P"+this.labels[i];
          }
          else{
            this.labels[i] = "Blank";
          }
        }
        this.chartoptions = {};     
      this.chartoptions.rmargin = 30;
      this.chartoptions.tmargin = 0;
      this.chartoptions.bmargin = 25;
      this.chartoptions.lmargin = 50;        
        
        this.$.chart.showChart();
      }
    }
});