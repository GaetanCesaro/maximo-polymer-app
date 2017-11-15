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

var mockRecord = {
		  'changedate': '2017-01-26T17:57:46+00:00',
		  'inspectionformid': 2,
		  'status_description': 'Inactive',
		  'createdate': '2017-01-26T17:57:46+00:00',
		  'revision': 0,
		  'orgid': 'EAGLENA',
		  'name': 'VnF1R0',
		  'isrevision': false,
		  'status_maxvalue': 'INACTIVE',
		  'changeby': 'THEO',
		  'status': 'INACTIVE',
		  'createdby': 'THEO'
		};
var mockRecord_active = {
		  'changedate': '2017-01-26T17:57:46+00:00',
		  'inspectionformid': 2,
		  'status_description': 'Inactive',
		  'createdate': '2017-01-26T17:57:46+00:00',
		  'revision': 2,
		  'orgid': 'EAGLENA',
		  'name': 'VnF1R0',
		  'isrevision': false,
		  'status_maxvalue': 'ACTIVE',
		  'changeby': 'THEO',
		  'status': 'ACTIVE',
		  'createdby': 'THEO'
		};

var mockFormStatusSet = [{'_rowstamp':'[0 0 0 0 0 30 -68 117]','synonymdomainid':16011,'valueid':'INSPECTFORMSTATUS|ACTIVE','maxvalue':'ACTIVE','localref':'http://localhost:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-/synonymdomain/0-16011','defaults':true,'defaults_localized':'Y','description':'Active','synonymdomainid_localized':'16,011','href':'http://localhost:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-#TUF…9OWU1ET01BSU4vSU5TUEVDVEZPUk1TVEFUVVMvQUNUSVZFL35OVUxMfi9_TlVMTH4vQUNUSVZF','_id':'INSPECTFORMSTATUS-ACTIVE-~NULL~-~NULL~-ACTIVE','value':'ACTIVE'},
                         {'_rowstamp':'[0 0 0 0 0 30 -68 118]','synonymdomainid':16012,'valueid':'INSPECTFORMSTATUS|INACTIVE','maxvalue':'INACTIVE','localref':'http://localhost:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-/synonymdomain/1-16012','defaults':true,'defaults_localized':'Y','description':'Inactive','synonymdomainid_localized':'16,012','href':'http://localhost:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-#TUF…1BSU4vSU5TUEVDVEZPUk1TVEFUVVMvSU5BQ1RJVkUvfk5VTEx_L35OVUxMfi9JTkFDVElWRQ--','_id':'INSPECTFORMSTATUS-INACTIVE-~NULL~-~NULL~-INACTIVE','value':'INACTIVE'},
                         {'_rowstamp':'[0 0 0 0 0 30 -68 120]','synonymdomainid':16014,'valueid':'INSPECTFORMSTATUS|PNDREV','maxvalue':'PNDREV','localref':'http://localhost:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-/synonymdomain/2-16014','defaults':true,'defaults_localized':'Y','description':'Inactive Revision','synonymdomainid_localized':'16,014','href':'http://localhost:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-#TUF…9OWU1ET01BSU4vSU5TUEVDVEZPUk1TVEFUVVMvUE5EUkVWL35OVUxMfi9_TlVMTH4vUE5EUkVW','_id':'INSPECTFORMSTATUS-PNDREV-~NULL~-~NULL~-PNDREV','value':'PNDREV'},
                         {'_rowstamp':'[0 0 0 0 0 30 -68 119]','synonymdomainid':16013,'valueid':'INSPECTFORMSTATUS|REVISED','maxvalue':'REVISED','localref':'http://localhost:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-/synonymdomain/3-16013','defaults':true,'defaults_localized':'Y','description':'Revised','synonymdomainid_localized':'16,013','href':'http://localhost:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-#TUF…1ET01BSU4vSU5TUEVDVEZPUk1TVEFUVVMvUkVWSVNFRC9_TlVMTH4vfk5VTEx_L1JFVklTRUQ-','_id':'INSPECTFORMSTATUS-REVISED-~NULL~-~NULL~-REVISED','value':'REVISED'}
                        ];
