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

var emptyMockList = [];

var mockRecord = {
		   'defaults': true,
		   '_rowstamp': '955597',
		   'valueid': 'INSPECTFORMSTATUS|INACTIVE',
		   '_id': 'INSPECTFORMSTATUS-INACTIVE-~NULL~-~NULL~-INACTIVE',
		   'description': 'Inactive',
		   'maxvalue': 'INACTIVE',
		   'value': 'INACTIVE',
		   'synonymdomainid': 2801,
		   'localref': 'http://192.168.99.100:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-/synonymdomain/1-2801',
		   'synonymdomainid_localized': '2,801',
		   'href': 'http://192.168.99.100:7001/maximo/oslc/os/mxdomain/_SU5TUEVDVEZPUk1TVEFUVVM-#TUFYRE9NQUlOL1NZTk9OWU1ET01BSU4vSU5TUEVDVEZPUk1TVEFUVVMvSU5BQ1RJVkUvfk5VTEx_L35OVUxMfi9JTkFDVElWRQ--',
		   'defaults_localized': 'Y'
		 };

var mockList = [
{
    'status_description': 'Pending',
    'asset': {
      'description': 'HVAC System- 50 Ton Cool Cap/ 450000 Btu Heat Cap'
    },
    'status': 'PENDING',
    'inspresultstatus': [
      {
        'changedate': '2017-02-23T17:34:31-05:00',
        'changedate_localized': '2/23/17 5:34 PM',
        'status_description': 'Pending',
        'status': 'PENDING',
        'changeby': 'ALVIN',
        'localref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDAzL0JFREZPUkQ-/inspresultstatus/0-2',
        '_rowstamp': '[0 0 0 0 0 30 -82 -14]',
        'inspresultstatusnum': '1001',
        '_id': '1001-EAGLENA-BEDFORD',
        'inspresultstatusid': 2,
        'href': 'http://childkey#SU5TUEVDVElPTlJFU1VMVC9JTlNQUkVTVUxUU1RBVFVTLzEwMDEvRUFHTEVOQS9CRURGT1JE',
        'inspresultstatusid_localized': '2',
        'status_maxvalue': 'PENDING'
      }
    ],
    'inspectionresultid': 4,
    'createdate': '2017-02-23T17:34:31-05:00',
    'createdby': 'ALVIN',
    'resultnum': '1003',
    '$alias_this_attr$asset': '11200',
    'inspectionresultid_localized': '4',
    'createdate_localized': '2/23/17 5:34 PM',
    'referenceobject': 'ASSET',
    'revision': 1,
    '_rowstamp': '[0 0 0 0 0 30 -82 -15]',
    '_id': 'EAGLENA-1003-BEDFORD',
    'orgid': 'EAGLENA',
    'locations': {
      
    },
    'inspectionform': {
      'name': 'ABC'
    },
    'revision_localized': '1',
    'siteid': 'BEDFORD',
    'inspformnum': '1001',
    'inspfieldresult_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDAzL0JFREZPUkQ-/inspfieldresult',
    'status_maxvalue': 'PENDING',
    'href': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDAzL0JFREZPUkQ-',
    'inspresultstatus_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDAzL0JFREZPUkQ-/inspresultstatus'
  },
  {
    'asset': {
      
    },
    'status_description': 'Pending',
    'status': 'PENDING',
    'location': 'BR200',
    'inspresultstatus': [
      {
        'changedate': '2017-02-23T17:34:45-05:00',
        'changedate_localized': '2/23/17 5:34 PM',
        'status_description': 'Pending',
        'status': 'PENDING',
        'changeby': 'ALVIN',
        'localref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA1L0JFREZPUkQ-/inspresultstatus/0-3',
        '_rowstamp': '[0 0 0 0 0 30 -82 -1]',
        'inspresultstatusnum': '1002',
        '_id': '1002-EAGLENA-BEDFORD',
        'inspresultstatusid': 3,
        'href': 'http://childkey#SU5TUEVDVElPTlJFU1VMVC9JTlNQUkVTVUxUU1RBVFVTLzEwMDIvRUFHTEVOQS9CRURGT1JE',
        'inspresultstatusid_localized': '3',
        'status_maxvalue': 'PENDING'
      }
    ],
    'inspectionresultid': 6,
    'createdate': '2017-02-23T17:34:45-05:00',
    'createdby': 'ALVIN',
    'resultnum': '1005',
    'inspectionresultid_localized': '6',
    'createdate_localized': '2/23/17 5:34 PM',
    'referenceobject': 'LOCATION',
    'revision': 1,
    '_rowstamp': '[0 0 0 0 0 30 -82 -3]',
    '_id': 'EAGLENA-1005-BEDFORD',
    'orgid': 'EAGLENA',
    'locations': {
      'description': 'HVAC System- Main Office'
    },
    'inspectionform': {
      'name': 'ABCD'
    },
    'revision_localized': '1',
    'siteid': 'BEDFORD',
    'inspformnum': '1002',
    'inspfieldresult_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA1L0JFREZPUkQ-/inspfieldresult',
    'status_maxvalue': 'PENDING',
    'href': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA1L0JFREZPUkQ-',
    'inspresultstatus_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA1L0JFREZPUkQ-/inspresultstatus'
  },
  {
    'asset': {
      
    },
    'status_description': 'Pending',
    'status': 'PENDING',
    'location': 'BR450',
    'inspresultstatus': [
      {
        'changedate': '2017-02-23T17:38:05-05:00',
        'changedate_localized': '2/23/17 5:38 PM',
        'status_description': 'Pending',
        'status': 'PENDING',
        'changeby': 'ALVIN',
        'localref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA3L0JFREZPUkQ-/inspresultstatus/0-4',
        '_rowstamp': '[0 0 0 0 0 30 -81 -5]',
        'inspresultstatusnum': '1003',
        '_id': '1003-EAGLENA-BEDFORD',
        'inspresultstatusid': 4,
        'href': 'http://childkey#SU5TUEVDVElPTlJFU1VMVC9JTlNQUkVTVUxUU1RBVFVTLzEwMDMvRUFHTEVOQS9CRURGT1JE',
        'inspresultstatusid_localized': '4',
        'status_maxvalue': 'PENDING'
      }
    ],
    'inspectionresultid': 8,
    'createdate': '2017-02-23T17:38:04-05:00',
    'createdby': 'ALVIN',
    'resultnum': '1007',
    'inspectionresultid_localized': '8',
    'createdate_localized': '2/23/17 5:38 PM',
    'referenceobject': 'LOCATION',
    'revision': 1,
    '_rowstamp': '[0 0 0 0 0 30 -81 -6]',
    '_id': 'EAGLENA-1007-BEDFORD',
    'orgid': 'EAGLENA',
    'locations': {
      'description': 'Feed Water Pump- Centrifugal/100GPM/60FTHD'
    },
    'inspectionform': {
      'name': 'Third Form'
    },
    'revision_localized': '1',
    'siteid': 'BEDFORD',
    'inspformnum': '1003',
    'inspfieldresult_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA3L0JFREZPUkQ-/inspfieldresult',
    'status_maxvalue': 'PENDING',
    'href': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA3L0JFREZPUkQ-',
    'inspresultstatus_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA3L0JFREZPUkQ-/inspresultstatus'
  },
  {
    'asset': {
      
    },
    'status_description': 'Pending',
    'status': 'PENDING',
    'location': 'BR450',
    'inspresultstatus': [
      {
        'changedate': '2017-02-23T17:39:07-05:00',
        'changedate_localized': '2/23/17 5:39 PM',
        'status_description': 'Pending',
        'status': 'PENDING',
        'changeby': 'ALVIN',
        'localref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA5L0JFREZPUkQ-/inspresultstatus/0-5',
        '_rowstamp': '[0 0 0 0 0 30 -80 74]',
        'inspresultstatusnum': '1004',
        '_id': '1004-EAGLENA-BEDFORD',
        'inspresultstatusid': 5,
        'href': 'http://childkey#SU5TUEVDVElPTlJFU1VMVC9JTlNQUkVTVUxUU1RBVFVTLzEwMDQvRUFHTEVOQS9CRURGT1JE',
        'inspresultstatusid_localized': '5',
        'status_maxvalue': 'PENDING'
      }
    ],
    'inspectionresultid': 10,
    'createdate': '2017-02-23T17:39:07-05:00',
    'createdby': 'ALVIN',
    'resultnum': '1009',
    'inspectionresultid_localized': '10',
    'createdate_localized': '2/23/17 5:39 PM',
    'referenceobject': 'LOCATION',
    'revision': 1,
    '_rowstamp': '[0 0 0 0 0 30 -80 73]',
    '_id': 'EAGLENA-1009-BEDFORD',
    'orgid': 'EAGLENA',
    'locations': {
      'description': 'Feed Water Pump- Centrifugal/100GPM/60FTHD'
    },
    'inspectionform': {
      'name': 'ABC'
    },
    'revision_localized': '1',
    'siteid': 'BEDFORD',
    'inspformnum': '1001',
    'inspfieldresult_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA5L0JFREZPUkQ-/inspfieldresult',
    'status_maxvalue': 'PENDING',
    'href': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA5L0JFREZPUkQ-',
    'inspresultstatus_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDA5L0JFREZPUkQ-/inspresultstatus'
  },
  {
    'status_description': 'Pending',
    'asset': {
      'description': 'HVAC System- 50 Ton Cool Cap/ 450000 Btu Heat Cap'
    },
    'status': 'PENDING',
    'inspresultstatus': [
      {
        'changedate': '2017-02-23T18:02:49-05:00',
        'changedate_localized': '2/23/17 6:02 PM',
        'status_description': 'Pending',
        'status': 'PENDING',
        'changeby': 'ALVIN',
        'localref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDEyL0JFREZPUkQ-/inspresultstatus/0-6',
        '_rowstamp': '[0 0 0 0 0 30 -73 57]',
        'inspresultstatusnum': '1005',
        '_id': '1005-EAGLENA-BEDFORD',
        'inspresultstatusid': 6,
        'href': 'http://childkey#SU5TUEVDVElPTlJFU1VMVC9JTlNQUkVTVUxUU1RBVFVTLzEwMDUvRUFHTEVOQS9CRURGT1JE',
        'inspresultstatusid_localized': '6',
        'status_maxvalue': 'PENDING'
      }
    ],
    'inspectionresultid': 13,
    'createdate': '2017-02-23T18:02:49-05:00',
    'createdby': 'ALVIN',
    'resultnum': '1012',
    '$alias_this_attr$asset': '11200',
    'inspectionresultid_localized': '13',
    'createdate_localized': '2/23/17 6:02 PM',
    'referenceobject': 'ASSET',
    'revision': 1,
    '_rowstamp': '[0 0 0 0 0 30 -73 56]',
    '_id': 'EAGLENA-1012-BEDFORD',
    'orgid': 'EAGLENA',
    'locations': {
      
    },
    'inspectionform': {
      'name': 'Third Form'
    },
    'revision_localized': '1',
    'siteid': 'BEDFORD',
    'inspformnum': '1003',
    'inspfieldresult_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDEyL0JFREZPUkQ-/inspfieldresult',
    'status_maxvalue': 'PENDING',
    'href': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDEyL0JFREZPUkQ-',
    'inspresultstatus_collectionref': 'http://localhost:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDEyL0JFREZPUkQ-/inspresultstatus'
  }
];
