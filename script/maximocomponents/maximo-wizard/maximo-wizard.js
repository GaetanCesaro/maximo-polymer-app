/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
`<maximo-wizard>` creates a wizard bar to help the user know where they are on while navigating a series of pre-determined steps.

Example:
```html
	<maximo-wizard>
		<maximo-wizard-step></maximo-wizard-step>
		<maximo-wizard-step></maximo-wizard-step>
		...
	</maximo-wizard>
```


### Accessibility
Tab into control. Use left and right arrow keys and enter/space to navigate and select.

@demo
 */
Polymer({
	is: 'maximo-wizard',
  	behaviors: [BaseComponent],
  	listeners: {
  		'set-step-state': 'setStepState' 
  	},
	properties : {
		/** Label to show for the wizard. */
    	label: {
    		type: String,
    		value: ''
    	},
    	/** Which step is selected from the start. */
		defaultIndex: {
			type: Number,
			value: 0
		},
		/** Which step is current. */
		currentIndex: {
			type: Number,
			value: -1,
			observer: '_changeIndex'
		},
		/** show help on steps. Set to true when any step has help-text. */
		_showHelp: {
			type: Boolean,
			value: false
		},
		_stepActions: {
			type: Array,
			value: '',
			observer: '_buildStepToolbar'
		},
		_stepTitle: {
			type: String,
			value: '',
			notify: true
		},
		_stepHelp: {
			type: String,
			value: '',
			notify: true
		},
		_stepInfo: {
			type: String,
			value: '',
			notify: true
		},
		_steps: {
			type: Object,
			value: function(){
				return {};
			}
		}
	},
	_toolbarButtons: [],
  	attached: function(){
  		var wizard = this;
		this.async(function(){
			wizard._setupLabels();
			wizard.disable(wizard.defaultIndex, false);
			wizard.currentIndex = wizard.defaultIndex;
			//$j(wizard.$.help).width($j(wizard.$.topWrapper).width());
			var width = $j(wizard.$.topWrapper).width();
			if(width>0){
				$j(wizard.$.help).width(width);
			}
  		}, 100);
	},
	_buildStepToolbar: function(newValue){
		this._toolbarButtons = [];
		if(newValue && newValue.length>0){
			var wizard = this;
			/* Cannot modify _toolbarbuttons until entire array is built or will get 'Cannot read property '0' of undefined' from Polymer as it tries to
			 * build controls when array is modified
			 */
			var tempButtons = [];
			var commonActions = $M.getCommonActions();
			newValue.forEach(function(action){
				var button, def;
				switch(typeof action){
					case 'object':
						def = action.action.split(':');
						if(def[0]==='common'){
							button = commonActions[def[1]];
							button.common = true;
							action = action.event?action.event:def[1];
						}
						break;
					case 'string':
						def = action.split(':');
						if(def[0]==='common'){
							button = commonActions[def[1]];
							button.common = true;
							action = def[1];
						}
						break;
					default:
						button = action;
						break;
				}
				//Should always come from UItext. Probably should be mxapibase. 
				button.label = $M.localize('uitext','mxapibase', button.label);
				if(!button.event){
					button.event = action;
				}
				tempButtons.push(button);
			});
			wizard._toolbarButtons = tempButtons;
		}
	},
	_setupLabels: function(){
		this._buildMap();
  		var labels = $j(this.$.maindiv).find('maximo-wizard-step');
  		var wizard = this;
  		labels.each(function(index, label){
  			label.onTap = function(){
  				if(!wizard._steps[index].hasAttribute('disabled')){
  					wizard.currentIndex = index;
  				}
  			};
  			label.listen(label, 'tap', 'onTap');
  			label.onKeyDown = function(e){
  				var step = e.currentTarget;
  				var direction = 0;
				switch(e.keyCode){
					case 13: //enter
					case 32: //space
						$j(e.currentTarget).trigger('click');
					break;
				case 37: //left
					direction = -1;
					break;
				case 39: //right
					direction = 1;
					break;
				}
				if(direction!==0){
					var newStep = direction===-1?$j(step).prev()[0]:$j(step).next()[0];
					if(newStep && newStep.tagName==='MAXIMO-WIZARD-STEP' && !newStep.hasAttribute('disabled')){
						$j(newStep.$.label).attr({'tabindex':'0'});
						$j(newStep.$.label).focus();
						$j(newStep.$.label).on('blur',function(e){
							e.currentTarget.removeAttribute('tabindex');
						});
					}
				}
  			};
  			label.listen(label, 'keydown', 'onKeyDown');
  			label.onBlur = function(e){
  				var myIndex = $j(e.currentTarget.parentElement.parentElement).attr('intvalue');
  				if(myIndex){
  					myIndex = parseInt(myIndex);
  					$j(e.currentTarget).attr('tabIndex', myIndex===wizard.currentIndex?'0':'');
  				}
  			};
  			label.listen(label.$.label, 'blur', 'onBlur');

  			$j(label.$.label).attr({'role':'button','title':label.label});
  			label.title = label.label;
  		});
  		wizard.length = labels.length;
  		wizard.lastLabel = labels[labels.length-1];
	},
  	_select: function(step){
  		if(step<0 || step>Object.keys(this._steps).length-1){
  			return;
  		}
  		if($j(this._steps[step]).attr('disabled')!==undefined){
  			this.disable(step, false);
  		}
		this.currentIndex = step;
		if(this._showHelp){
			this._stepActions = this._steps[step].actions;
			this._stepTitle = this._steps[step].helpTitle?this._steps[step].helpTitle:this._steps[step].label;
			this._stepHelp = this._steps[step].helpText;
			var key = 'Step0of1';
			if($M.demoMode){
				key = 'Step {0} of {1}';
			}
			this._stepInfo = $M.localize('uitext','mxapibase',key, [step+1, Object.keys(this._steps).length]);
		}
		var lists = $j(this.parentNode).find('iron-list');
		lists.each(function(index){
			lists[index].fire('iron-resize');
		});
		var wizard = this;
		$j(this.$.maindiv).find('maximo-wizard-step').each(function(index){
			if(index>step && !wizard._steps[step]._complete){
				wizard.disable(index, true);
			} 
		});
	},
	_fireEvent: function(e){
		var event = e.currentTarget.getAttribute('data-event');
		this.fire(event);
	},
	_changeIndex: function(newValue, oldValue){
		var wizard = this;
		$j(wizard.$.lineMarker).stop(true, true);
		if(!this._steps){
			return;
		}
		var step = this._steps[newValue];
		if(step){
			var time = Math.abs(newValue-oldValue)*400;
			var left = $j($j(step.$.state).find('div')[0]).position().left;
			wizard._select(newValue);
			$j(wizard.$.lineMarker).show();
			$j(wizard.$.lineMarker).animate({
				left: left
			}, 
			{
				duration: time,
				easing: 'swing',
				complete: function() {
					$j(wizard.$.lineMarker).hide();
					$j(wizard.$.maindiv).find('maximo-wizard-step').each(function(index){
						this.toggleClass('currentChoice',index===newValue);
						$j(this.$.label).attr('tabIndex', index===newValue?'0':'-1');
						if(index===newValue){
							$j(this.$.label).attr({'tabIndex':'0'});
						}
						else {
							$j(this.$.label).removeAttr('tabIndex');
						}
					});
				}
			});
		}
		this.fire('change-wizard-step', newValue);
	},
	_buildMap: function(){
		if(Object.keys(this._steps).length===0){
			var wizard = this;
			wizard._showHelp = false;
			$j(this.$.maindiv).find('maximo-wizard-step').each(function(index){
				wizard._steps[index] = this;
				if(this.helpText !== undefined && this.helpText !== ''){
					wizard._showHelp = true;
				}
			});
		}
	},
	
	/**
	 Mark a step as complete / incomplete.
	 @param {number} index which step.
	 @param {string} state - 'initial' or 'complete'.
	 */
	setStepState: function(e){
		var index = e.detail.index;
		var state = e.detail.state;
		if(index !==undefined && state!==undefined){
			var step = $j(this._steps[index])[0];
			switch(state){
				case 'complete':
					step.set('_initial', false);
					step.set('_complete', true);
					$j(step).toggleClass('complete', true);
					break;
				case 'initial':
					step.set('_initial', true);
					step.set('_complete', false);
					$j(step).toggleClass('complete', false);
					break;
				default:
					step.set('_initial', true);
					step.set('_complete', false);
					break;
			}
		}
	},
	/**
	 Reset to initial state.
	 */
	reset: function() {
		var wizard = this;
		$j(this.$.maindiv).find('maximo-wizard-step').each(function(index){
			$j(wizard._steps[index]).removeClass('currentChoice');
			wizard.setStepState({'detail':{'index':index,'state':'initial'}});
		});
		$j(this.$.lineMarker).css('opacity','0');
		$j(this.$.lineMarker).css({'left':'0'});
		$j(this.$.lineMarker).css('opacity','1');
		this.disable(this.defaultIndex, false);
		this.currentIndex = this.defaultIndex;
		
	},
	
	/**
	Set a step as enabled / disabled.
	@param {number} index
	@param {boolean} disabled
	*/
	disable: function(index, disabled){
		if(disabled){
			$j(this._steps[index]).attr({'disabled':true,'aria-disabled':true});
		}
		else {
			$j(this._steps[index]).removeAttr('disabled');
			$j(this._steps[index]).removeAttr('aria-disabled');
		}
	}
	
});