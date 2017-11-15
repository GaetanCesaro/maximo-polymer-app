/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-submitsr-wizard',
  	behaviors: [BaseComponent],
	properties : {
    	selectedtab: {
    		type: Number,
    		value: 0,
    		notify: true    	
    	},
    	newSrHref:{
			type: String,
			notify: true
		}
	},
  	created : function() {
  	},
  	ready : function() {
  		this.$.maxsynonymdomain.fetchValue(); 
  	},
  	attached: function() {
  		this._submitInfo = {};
  		this._stackData = [];
  		if($M.screenInfo.device === 'desktop'){
  			$j(this.$.panelHeader).addClass('panelHeaderDesktop');
  		} 	
  	},
  	open: function(ccid, callback) {
  		var that = this;
  		$j(this).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
  		  		
  		this.hidden = false;
  		if (ccid) {
  			this._issueSkipped = false;
  			this.$.defineissue.getIssues(ccid);
  			this.$.defineissue.renderPage(this._submitInfo, this._stackData);
  		} else {
  			this._issueSkipped = true;
  	  		this.$.submitsrWizard.fire('set-step-state',{'index':0, 'state':'complete'});
  	  		this.$.submitsrWizard.currentIndex = 1;
  		}
		this.$.csrcollection.createNewRecord();
 		
		this.async(function() {
			if (callback) {
				$j(that).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
					if (e.target === that) {
						$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
						callback();
						return false;
					}
				}); 
			}
			
			$j(that).addClass('panel-slide-open');
		}, 100);
  	},
  	close: function(slidingEffect, callback) {
		this.$.submitsrWizard.reset();
		var steps = $j(this).find('maximo-wizard-step');
		for (var i = 0; i < steps.length; i++) {
			this.$.submitsrWizard.fire('set-step-state', {index: i, state:'initial'});
		}
		var childPages = this.$.pages.children;
		for (i = 0; i < childPages.length; i++) {
			childPages[i].initPage();
		}
		this._submitInfo = {};
		this._stackData = [];

  		if (slidingEffect) {
			var that = this;
			
			$j('maximo-button button').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
				e.stopPropagation();
			});
			$j('maximo-button').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
				e.stopPropagation();
			});
			$j('.maximo-wizard-step').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
				e.stopPropagation();
			});

			$j(this).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
				if (e.target === that) {
					$j('maximo-button button').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
					$j('maximo-button').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
					$j('.maximo-wizard-step').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
					$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
					
					that.hidden = true;
					
					if (callback) {
						callback();
					}
				}
			});
  		}
  		else {
  			this.hidden = true;
			if (callback) {
				callback();
			}
  		}
  		
		$j(this).removeClass('panel-slide-open');
  		this.fire('close-wizard');
  	},
	addSubmitInfo: function(info) {
		if (info instanceof Array) {
			for (var idx in info) {
				if (info[idx].step) {
					if (!this._submitInfo[info[idx].step]) {
						this._submitInfo[info[idx].step] = {};
					}
					this._submitInfo[info[idx].step].contents = info[idx].value;
					this._addStackData(info[idx].step, info[idx].value);
				}  				   					 
			}
		}
		else {
			if (info.step) {
				if (!this._submitInfo[info.step]) {
					this._submitInfo[info.step] = {};
				}
				this._submitInfo[info.step].contents = info.value;
				this._addStackData(info.step, info.value)
			}  				 
		}  		
  	},
  	_addStackData: function(step, contents) {
 		var data;
  		
  		switch (step) {
  		case 'Category' : 
  			if (contents && contents.classstructureid) {
  				data = contents.description;
  			}else{
  				data = '--';
  			}
  			break;
  		case 'Description' : 
  			if (contents && contents.description) {
  				data = contents.description;
  			}else{
	
  				data = '';
  			}
  			break;
  		case 'Location' :
  			if(contents && contents.location) {
  				data = contents.description;
  			}
  			else {
  				data = '--';
  			}
  			break;
  		default : 
  			if(contents) {
  				if (contents.description) {
  					data = contents.description;	
  				} else {
  	  				data = '--';
  				}
  			}else{
  				data = '';
  			}
  			break;
  		}
		
  		if (typeof this._submitInfo[step].stackListIndex === 'undefined') {
  	  		var newStackData = {'step':step ,'topic': $M.localize('uitext','mxapisr',step), 'data':data};	
  			var idx = this._stackData.push(newStackData);
  	  		this._submitInfo[step].stackListIndex = idx - 1;
  		} else {
  			this._stackData[this._submitInfo[step].stackListIndex].data = data;
  		} 		
  	},
  	_prevStep: function(){
  		if ((this.$.submitsrWizard.currentIndex-1) < 0) {
  			this.$.csrcollection.removeNewRecordFromMemory();
  			this.close(true);
  		} else {
  			var retValue = this.$.pages.children[this.selectedtab].goBack();

	  		if (retValue) {
	  		    this.$.submitsrWizard.currentIndex--;
	  		    
	  		    if (this.$.submitsrWizard.currentIndex === 0 && this._issueSkipped) {
	  		    	this.$.csrcollection.removeNewRecordFromMemory();
	  		    	this.close(true);
	  		    }
	  		} 
  		}
  	},  	
  	_nextStep: function(e){
  		if (e.detail) {
  			this.addSubmitInfo(e.detail);
  		}
  		
  		// change tab
  		this.$.submitsrWizard.fire('set-step-state',{'index':this.$.submitsrWizard.currentIndex, 'state':'complete'});
  		this.$.submitsrWizard.currentIndex++;
  	},
  	_onSubmitInfo: function(e) {
  		 if (e.detail) {
  			 this.addSubmitInfo(e.detail);
  		 } 		 
  	},
  	_onSrSubmit: function(e) {
  		var newSR = {};
  		
  		this.fire('show-wait-spinner', true);

  		newSR.class = this.classValue;
  		newSR.description = '';
  		
  		if (this._submitInfo.Issue && this._submitInfo.Issue.contents && this._submitInfo.Issue.contents.templateid) {
  	  		if (this._submitInfo.Category && this._submitInfo.Category.contents && this._submitInfo.Category.contents.classstructureid) {
  	  			newSR.classstructureid = this._submitInfo.Category.contents.classstructureid;
  	  		}

  			newSR.description = this._submitInfo.Issue.contents.description;
  		}
  		else if (this._submitInfo.Description && this._submitInfo.Description.contents && this._submitInfo.Description.contents.description) {
  			newSR.description = this._submitInfo.Description.contents.description;
  		}
		
  		newSR.reportedby = $M.userInfo.personid;
  		if (this._submitInfo.AdditionalCommentsStep && this._submitInfo.AdditionalCommentsStep.contents && this._submitInfo.AdditionalCommentsStep.contents.description) {
  			newSR.description_longdescription = this._submitInfo.AdditionalCommentsStep.contents.description;
  		}
  		if (this._submitInfo.Location && this._submitInfo.Location.contents && this._submitInfo.Location.contents.location) {
  			newSR.location = this._submitInfo.Location.contents.location;
  		}
  		if (this._submitInfo.Asset && this._submitInfo.Asset.contents && this._submitInfo.Asset.contents.assetnum) {
  			newSR.assetnum = this._submitInfo.Asset.contents.assetnum;
  		}
  		newSR.reportedpriority = 2;
  		if (e.detail) {
  			newSR.reportedpriority = e.detail;
  		}
  		
  		if (this._submitInfo.Issue && this._submitInfo.Issue.contents && this._submitInfo.Issue.contents.templateid) {
  			newSR.templateid = this._submitInfo.Issue.contents.templateid;
  		}
  		
  		this.$.csrcollection.saveNewRecord(newSR, 'ticketid,description');
  	},
  	_handleNewRecordCreated: function(e) {
  		console.log('create success : ' + e.detail.href);
  		this.newSrHref = e.detail.href;
  	},
  	_handleNewRecordSaved: function(e) {
  		console.log('save success');
  		this.fire('sr-created', e.detail.ticketid);
  	},
  	_handleRecordCreationFailure: function() {
  		this.fire('show-wait-spinner', false);
  		console.log('fail');
  	},
  	_handleNewRecordRemoved: function() {
  		console.log('removed');
  	},
  	_handleGetValueFromDomain: function(e) {
  		this.classValue = e.detail;
  	},
  	_handleGetValueFromDomainError: function(e) {
  		console.log(e);
  	},
  	_changeTab : function(e) {
		if (typeof e.detail !== 'undefined' && e.detail !== null) {
			this.selectedtab = e.detail;
			this.$.pages.children[this.selectedtab].renderPage(this._submitInfo, this._stackData);
		}
  	}
});
