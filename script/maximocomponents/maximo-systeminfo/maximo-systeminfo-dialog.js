/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-systeminfo-dialog>` element. Fetches and displays system information. 
*/ 

Polymer({

		is: 'maximo-systeminfo-dialog',
		
		properties: {	
			recordData: {
				type: Object,
				notify: true
			},
			
			refreshSystemData: {
				type: Boolean,
				value: false
			},
			
			maxData: {
				type: Object,
				notify: true
			},
		
		},
		
		behaviors: [BaseComponent],
		
		ready: function(){
			$j(this.$.browserinfo).text(navigator.appCodeName+' : '+navigator.vendor+' : '+navigator.userAgent);
			$j(this.$.screeninfo).text('PPI:'+$M.screenInfo.ppi + ' - Width:'+$M.screenInfo.width + 'in. - Height:'+$M.screenInfo.height+'in.');
		},
		
		ok: function(){
			this.container.close();
		},
		
		toggle: function(e)
		{		   
		   this._fetchSystemInfo();
		},
        
      	_fetchSystemInfo: function(e)
       	{
       		this.$.maxsysinfo.refreshSystemData().then(function(result){	
			   	this.maxData = result;
				this.$.mydialog.toggle();
			}.bind(this)  );
	   	}      
	});
	
