/*
 * Licensed Materials - Property of IBM
 *
 * 5724-U18
 *
 * (C) Copyright IBM Corp. 2017 All Rights Reserved
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

var mockEvent = document.createEvent('Event');
mockEvent.detail = {'inspectionformstatus_collectionref':'http://localhost:7001/maximo/oslc/os/mxapiinspform/inspectionformstatus',
		'status_description':'Inactive',
		'createdate':'2017-01-26T13:16:12-05:00',
		'orgid':'EAGLENA','originalformnum':0,
		'revision':1,'langcode':'EN','inspectionformid':504,
		'isrevision':false,'hasld':false,'hasrevision':false,
		'href':'http://localhost:7001/maximo/oslc/os/mxapiinspform',
		'inspquestion_collectionref':'http://localhost:7001/maximo/oslc/os/mxapiinspform/inspquestion',
		'status':'INACTIVE'};


var mockedSynonymObj = document.createEvent('Event');
mockedSynonymObj.detail = {
	'_selectedRecords': [
		  {
		    'defaults': true,
		    '_rowstamp': '736019',
		    'valueid': 'INSPFIELDTYPE|TR',
		    '_id': 'INSPFIELDTYPE-TE-~NULL~-~NULL~-TR',
		    'description': 'Text Response',
		    'maxvalue': 'TE',
		    'value': 'TR',
		    'synonymdomainid': 2456,
		    'localref': 'http://192.168.99.100:7001/maximo/oslc/os/mxdomain/_SU5TUEZJRUxEVFlQRQ--/synonymdomain/5-2456',
		    'synonymdomainid_localized': '2,456',
		    'href': 'http://childkey#TUFYRE9NQUlOL1NZTk9OWU1ET01BSU4vSU5TUEZJRUxEVFlQRS9URS9_TlVMTH4vfk5VTEx_L1RS',
		    'defaults_localized': 'Y',
		    '__itemIndex__': 9
		  }
	]
};

var mockedModel = document.createEvent('Event');
mockedModel.model = {
	'index': 0,
	'field': {
		'object': {
			'fieldType': 'TR'
		},
		'title': 'Text Response'
	}
};

var mockedElement = {};

var mockedDomain = {
	    'defaults': true,
	    '_rowstamp': '736019',
	    'valueid': 'INSPFIELDTYPE|TR',
	    '_id': 'INSPFIELDTYPE-TE-~NULL~-~NULL~-TR',
	    'description': 'Text Response',
	    'maxvalue': 'TE',
	    'value': 'TR',
	    'synonymdomainid': 2456,
	    'localref': 'http://192.168.99.100:7001/maximo/oslc/os/mxdomain/_SU5TUEZJRUxEVFlQRQ--/synonymdomain/5-2456',
	    'synonymdomainid_localized': '2,456',
	    'href': 'http://childkey#TUFYRE9NQUlOL1NZTk9OWU1ET01BSU4vSU5TUEZJRUxEVFlQRS9URS9_TlVMTH4vfk5VTEx_L1RS',
	    'defaults_localized': 'Y',
	    '__itemIndex__': 9
	  };
