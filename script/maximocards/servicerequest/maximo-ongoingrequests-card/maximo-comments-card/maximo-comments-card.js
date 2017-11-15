/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-comments-card',
  	behaviors: [BaseComponent/*,Polymer.IronOverlayBehavior,Polymer.IronResizableBehavior*/],
	properties : {
		title : {
			type : String
		},
		count : {
			type: String
		},
		recordData : {
			type: Object,
			notify : true
		},
		sr : {
			type : Object
		},
		ticketIndex :{
			type : String,
			notify : true
		},    	
    	searchTerms: {
    		type: String
    	},
		recordCount: {
			type: String,
			value: '',
			notify: true
		}
	},
	listeners:{
		'dom-change' : 'updateScroll'
	},
  	created : function(){
  	},
  	ready : function(){
  		this.$.maxsynonymdomain.fetchValue(); 
  	},
  	attached : function(){
  	},
	_getDirection : function(wl){
		if(wl.createby === $M.userInfo.personid){
			return false;
		} else if (this.sr && (wl.createby === this.sr.reportedby)) {
			return false;
		} else if (this.sr && (wl.createby === this.sr.affectedperson)) {
			return false;
		}
		else {
			return true;
		}
	},
	updateScroll : function(){
		var element = this.querySelector('.commentPanel .panelInternal');
		element.scrollTop = element.scrollHeight;
	},
	open : function(callback) {
		var that = this;
		this.hidden = false;
		this._loadRecord();
		
		setTimeout(function() {
			if (callback) {
				$j(that)
				.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
				 function(e){
					if (e.target === that) {
						$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
						callback();
					}
				}); 
			}	
			$j(that).addClass('panel-slide-open');
		}, 100);
	},
	close : function() {
		var that = this;
		
		this.recordData = [];
		$j('.newComment').remove();
		
		$j(this)
		.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
		 function(e){
			if (e.target === that) {
				$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
				that.hidden = true;
			}
		 }); 
		$j(this).removeClass('panel-slide-open');
		this.fire('closecard', this.ticketIndex);
	},
	_getMessageWidth : function(){
		return (parseInt(this.querySelector('.commentPanel').offsetWidth) - 112) + 'px'; 
	},
	addChatbubble : function(comment){
		var newComment= Polymer.Base.create('MAXIMO-CHATBUBBLE',{'label': this._getDescription(comment), 'date': comment.createdate, 'direction':this._getDirection(comment),'maxwidth':this._getMessageWidth(),'personImage':$M.userInfo._imagelibref,'personFirstname':$M.userInfo.firstname});
		newComment.setAttribute('class','messageBubble newComment maximo-comments-card');
		this.querySelector('.panelInternal').appendChild(newComment);
		this.updateScroll();
	},
	_showPersonInfo : function(e) {
//		if ($M.userInfo.personid === e.target.additionalInfo.personid) {
//			return;
//		}

		if (e.target.direction) 
		{
			this.$.personInformation.style.top = (e.target.offsetTop - 8) + 'px';	// minus padding size
			this.$.personInformation.style.left = (e.target.offsetLeft - 8) + 'px';
			
			$j(this.$.personInfoPictureBorder).removeClass('personInfoRightPictureBorder');
			$j(this.$.personInfoContentWrapper).removeClass('personInfoRightContentWrapper');
			$j(this.$.personInfoPictureWrapper).removeClass('personInfoRightPictureWrapper');
			
			$j(this.$.personInfoContentWrapper).addClass('personInfoLeftContentWrapper');
		}
		else {
			this.$.personInformation.style.top = (e.target.offsetTop - 8) + 'px';	// minus padding size
			this.$.personInformation.style.left = '';
			this.$.personInformation.style.right = '8px';
			
			$j(this.$.personInfoContentWrapper).removeClass('personInfoLeftContentWrapper');
			
			$j(this.$.personInfoPictureBorder).addClass('personInfoRightPictureBorder');
			$j(this.$.personInfoContentWrapper).addClass('personInfoRightContentWrapper');
			$j(this.$.personInfoPictureWrapper).addClass('personInfoRightPictureWrapper');
		}
		
		{
			$j('.personInfoIconContainer').css('max-height', '72px');

			var name = '';
			if (e.target.additionalInfo.firstname && e.target.additionalInfo.lastname) {
				name = e.target.additionalInfo.firstname + ' ' + e.target.additionalInfo.lastname;
			} else if (e.target.additionalInfo.firstname) {
				name = e.target.additionalInfo.firstname;
			} else if (e.target.additionalInfo.lastname) {
				name = e.target.additionalInfo.lastname;
			}
			this.$.personInfoName.label = name;
			this.$.personInfoImage.image = e.target.personImage;
			
			var infoCount = 0;
			
			if (e.target.additionalInfo.primaryemail || e.target.additionalInfo.primaryphone) {
				if (e.target.additionalInfo.primaryemail) {
					$j('.personInfoEmailLink').show();
					$j('.personInfoEmailLink').attr('href', 'mailto:' + e.target.additionalInfo.primaryemail);
					this.$.personInfoEmailContent.innerHTML = e.target.additionalInfo.primaryemail;
					infoCount++;
				}
				else {
					$j('.personInfoEmailLink').hide();
				}
				if (e.target.additionalInfo.primaryphone) {
					$j('.personInfoPhoneLink').show();
					$j('.personInfoPhoneLink').attr('href', 'tel:' + e.target.additionalInfo.primaryphone);
					this.$.personInfoPhoneContent.innerHTML = e.target.additionalInfo.primaryphone;
					infoCount++;
				}
				else {
					$j('.personInfoPhoneLink').hide();
				}
			}
			else {
				$j('.personInfoEmailLink').hide();
				$j('.personInfoPhoneLink').hide();
			}
			
			if ($M.screenInfo.device === 'phone') {
				this.$.personInfoIconContainerPhone.hidden = false;
				this.$.personInfoIconContainerDesktop.hidden = true;
				if (infoCount === 0) {
					$j('.personInfoIconContainer').css('max-height', '12px');
				}
			} else {
				this.$.personInfoIconContainerPhone.hidden = true;
				this.$.personInfoIconContainerDesktop.hidden = false;
				
				$j('.personInfoIconContainer').css('max-height', (72-30*(2-infoCount)) + 'px');
			}

			this.$.personInformation.opened = true;
		}
	},
	
	_handleChange: function(e){
		if(e.keyCode===13){
			this._addComment();
		}
	},
	_loadRecord : function() {
		this.searchTerms = this.sr.ticketid;
		
		//Prepare child sort
		this.worklogSort = [{collection:'sr.worklog',attributes:'%2Bcreatedate'}];
		
		this.$.commentcollection.refreshRecords().then(function(result) {
//			console.log('result:'+result);
		});
	},
	_addComment : function() {
		var that = this;
		var responseProperties ='ticketid,worklog';
		var description = '';
		var description_longdescription = '';
		var merge = true;
	    var commentRequest = {
	    		'ticketid':'',
	    		'worklog' :[{}],
	    };
	    var newWorklog = {};

	    description_longdescription = this.$.inputComment.value.toString();
	    
	    if (description_longdescription) {
	    	var checkDescription = description_longdescription.trim();
		    
		    if (checkDescription.length === 0) {
		    	return;
		    }
	    }
	    else {
	    	return ;
	    }

	    description = description_longdescription.substr(0, 60);

	    if (description_longdescription.length > 60) {
	    	description += '...';
	    }
	    
		
		// ticketid of SR
		commentRequest.ticketid = this.sr.ticketid;

		// worklog data
		newWorklog.createby = $M.userInfo.personid;
		newWorklog.createdate = new Date();
		newWorklog.logtype = '!CLIENTNOTE!';
		newWorklog.description = description;
		newWorklog.description_longdescription = description_longdescription;
		newWorklog.class = this.classValue;
		newWorklog.clientviewable =  true;
		
		commentRequest.worklog.push(newWorklog);
		
		// merge is true
		this.$.commentResource.updateRecord(commentRequest, responseProperties, merge).then(function(result) {
			var count = that.recordCount;
			var comment = {description_longdescription:description_longdescription, createdate:newWorklog.createdate, createby:$M.userInfo.personid};
			that.addChatbubble(comment);
			that.recordCount = parseInt(count) + 1;
			this._updatecount();
			this.$.inputComment.value = '';
		}.bind(this), function(error) {
			$M.showResponseError(error);
		});
	},
	_handleRecordDataRefreshed: function()
	{
		this._updateRecordCount(this._getRecordCount());
	},
	_updateRecordCount : function(count) {
		this.recordCount = this.recordData.length;
	},
	_getRecordCount : function(){
		return this.$.commentcollection.totalCount;
	},
	_handleDataError : function(e){
		if (e.detail && e.detail.Error) {
			$M.alert(e.detail.Error.message);
		}
	},
	_updatecount : function() {
		this.fire('updatecommentcount', {'index':this.ticketIndex,'recordCount':this.recordCount});
	},
	_getDescription: function(wl) {
		if (wl.description_longdescription && wl.description_longdescription.length !== 0) {
			return wl.description_longdescription;
		} else if (wl.description && wl.description.length !== 0) {
			return wl.description;
		}
		return '';
	},
	_handleGetValueFromDomain: function(e) {
  		this.classValue = e.detail;
  	},
  	_handleGetValueFromDomainError: function(e) {
  		console.log(e);
  	}
});
