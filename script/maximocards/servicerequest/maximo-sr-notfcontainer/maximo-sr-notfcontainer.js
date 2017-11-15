/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016,2017
*/
Polymer({
    is: 'maximo-sr-notfcontainer',
    behaviors: [
        BaseComponent
    ],
    properties: {
        // binding item
        notf: {
            type: Object,
            notify: true,
            reflectToAttribute:true
        }
    },

    ready: function() {
    },

    _onViewTap: function(e) {
        this.fire('toggle-notf-overlay');
        this.fire('open-sr-details', {target: e.target, href: this.notf.notfeventmessage.href});
    },

    _onReopenTap: function() {
        this.fire('toggle-notf-overlay');
    },

    _formatMessage: function(ticketid) {
        return $M.localize('uitext', 'mxapisr', 'ServiceRequestComplete', [ticketid]);
    },

    _formatDetails: function(notfeventmessage) {
        var details = notfeventmessage.description;
        if (notfeventmessage.description_longdescription) {
            // // trick to strip html tags from rich text
            // var richText = document.createElement("div");
            // richText.innerHTML = notfeventmessage.description_longdescription;
            // var plainText = richText.textContent || richText.innerText;

            details += ' - ' + notfeventmessage.description_longdescription;
            // richText.remove();
            // richText = null;
        }
        return details;
    },

    // make date like "Wed Sep 14 2016"
    _formatDate: function(timestamp) {
        var date = new Date(timestamp);
        return date.toDateString();
    },

    // highlight unread
    _highlight: function(touched) {
        if (!touched) {
            return 'unread';
        };
    }
});
