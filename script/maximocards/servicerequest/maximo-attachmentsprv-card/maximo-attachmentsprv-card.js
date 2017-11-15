/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-attachmentsprv-card',
  	behaviors: [BaseComponent],
	properties : {
		recordData : {
			type: Object,
			notify : true
		},
		attachmentUrl :{
			type: String
		},
		attachmentFilename :{
			type: String
		},
		deletedFile : {
			type : Number
		},
		fileFormat :{
			type: String
		},
		supportSlide: {
			type: Boolean,
			value: false
		},
		downloadable: {
			type: Boolean,
			value: false,
			notify: true
		}
	},
	listeners:{
	},
  	created : function(){
  	},
  	ready : function(){
   	},
  	attached : function(){
  		this.hidden = false;
  		
  		if (this.supportSlide) {
  	  		var that = this;
  	  		$j(this).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
  				if (e.target === that) {
  					that.showAttachment();
  				}
  			});  		
  			this.async(function(){
  				$j(that).addClass('panel-slide-open');
  			}, 100);
  		}
  		else {
  			this.showAttachment();
  		}
  	},
	close : function() {
		var that = this;
  		if (this.supportSlide) {
			$j(this)
			.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
			 function(e){
				if (e.target === that) {
					$j(that).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
					that.hidden = true;
					$j(that).remove();
				}
			 }); 
			
			$j(this).removeClass('panel-slide-open');
  		}
  		else {
  			this.hidden = true;
  			$j(this).remove();
  		}
	},
	showAttachment : function(){
		var that = this;
		var format = this.fileFormat;
		var url = this.attachmentUrl;
		var checkAudFmt = this.attachmentFilename.toLowerCase();
		if(format.includes('image')){
			this.$.previewSpinner.hidden = false;
			var img = Polymer.Base.create('MAXIMO-IMAGE',{'src': url, 'id': 'attachmentPreviewImage'});
			img.setAttribute('class','previewItem maximo-attachmentsprv-card');
			img.children[0].style.maxHeight = (parseInt(this.offsetHeight)-180) + 'px';
			this.querySelector('.imageWrapper').appendChild(img);
			this.previewOpened = true;
			$j(img.children[0]).load(function(){
				that.$.previewSpinner.hidden = true;		
				that.querySelector('.overlayWrapper').style.display = 'table-cell';
				that.querySelector('.downloadButton').style.display ='block';
			}).error(function(e) {
				console.log('loading error'+e);
				that.$.previewSpinner.hidden = true;		
			});
		}
		else if(format==='video/mp4' || format === 'video/webm' || format === 'video/ogg'){
			this.$.previewSpinner.hidden = false;
			var vid = Polymer.Base.create('MAXIMO-VIDEO',{'src': url, 'id': 'attachmentPreviewVideo', 'width': parseInt(this.offsetWidth)-70});
			vid.setAttribute('class','previewItem maximo-attachmentsprv-card');
			vid.children[0].style.maxHeight = (parseInt(this.offsetHeight)-150) + 'px';
			this.querySelector('.imageWrapper').appendChild(vid);
			this.previewOpened = true;
			vid.children[0].onloadeddata = function(){
				that.$.previewSpinner.hidden = true;		
				that.querySelector('.overlayWrapper').style.display = 'table-cell';
				that.querySelector('.downloadButton').style.display ='block';
			};
		}
		else if(checkAudFmt.includes('.mp3') || checkAudFmt.includes('.wav') || checkAudFmt.includes('.ogg')){
			this.$.previewSpinner.hidden = false;
			var aud = Polymer.Base.create('MAXIMO-AUDIO',{'src': url, 'id': 'attachmentPreviewVideo'});
			aud.setAttribute('class','previewItem maximo-attachmentsprv-card');
			this.querySelector('.imageWrapper').appendChild(aud);
			this.previewOpened = true;
			
			aud.children[0].onloadeddata = function(){
				that.$.previewSpinner.hidden = true;		
				that.querySelector('.overlayWrapper').style.display = 'table-cell';
				that.querySelector('.downloadButton').style.display ='block';
			};
		}
	},
	onClickDownload : function(){
		var link = document.createElement('a');
		link.download = this.attachmentFilename;
		link.href = this.attachmentUrl;
		link.click();
	},
});
