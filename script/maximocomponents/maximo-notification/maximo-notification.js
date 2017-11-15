/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A notification component.
 */
Polymer({
	is: 'maximo-notification',
  	behaviors: [BaseComponent],
  	attached : function(){
  		var notification = this;
		$j(this.$.close).click(function(){
			$M.workScape.removeNotification(notification.$.notification);
		});
  	}
});
