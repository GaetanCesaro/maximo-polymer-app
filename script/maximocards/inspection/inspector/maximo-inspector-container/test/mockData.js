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


var mockedQSetTabTest1 = [
       {'_done': true},
       {'_done': true},
       {'_done': true},
       {'_done': false},
       {'_done': true},
       {'_done': false},
       {'_done': true}
   ];

var mockedQSetTabTest2 = [
                          {'name': 'q1', '_done': true},
                          {'name': 'q2', '_done': true},
                          {'name': 'q3', '_done': true},
                          {'name': 'q4', 'groupid': '4', 'sequence': 0, '_done': false, 'children': [{'name': 'q4.1', '_done': true},
                                                                      {'name': 'q4.2', '_done': false},
                                                                      {'name': 'q4.3', '_done': true}]},
                          {'name': 'q5', '_done': true},
                          {'name': 'q6', '_done': false},
                          {'name': 'q7', '_done': true, 'groupid': '7', 'sequence': 0, 'children': [{'name': 'q7.1', '_done': true},
                                                                     {'name': 'q7.2', '_done': true}]}
                      ];

var mockedQuestionSetToggleTest = [{'_required': true},{'_required': true},{'_required': true},{'_required': false},{'_required': true}];
                          

var mockedQuestionSet = [
                         {
                        	    'groupseq_localized': '1,00',
                        	    'groupseq': 1,
                        	    'hasld_localized': 'N',
                        	    'localref': 'http://192.168.99.100:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDAyL0JFREZPUkQ-/inspectionform/0-2/inspquestion/0-1',
                        	    'langcode': 'EN',
                        	    'inspquestionnum': '1001',
                        	    'inspfield': [],
                        	    '_rowstamp': '931327',
                        	    'inspquestionid_localized': '1',
                        	    '_id': '1001-1001-EAGLENA-1',
                        	    'sequence': 1,
                        	    'description': 'Q1',
                        	    'sequence_localized': '1',
                        	    'inspquestionid': 1,
                        	    'inspfield_collectionref': 'http://192.168.99.100:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDAyL0JFREZPUkQ-/inspectionform/0-2/inspquestion/0-1/inspfield',
                        	    'href': 'http://childkey#SU5TUEVDVElPTlJFU1VMVC9JTlNQRUNUSU9ORk9STS9JTlNQUVVFU1RJT04vMTAwMS8xMDAxL0VBR0xFTkEvMQ--',
                        	    'hasld': false,
                        	    'required': true,
                        	    '_done': true,
                        	    '_icon': 'Maximo:Confirm',
                        	    'listdesc': '1. Q1',
                        	    '_required': true,
                        	    '__itemIndex__': 0
                        	  },
                        	  {
                        	    'groupseq_localized': '2,00',
                        	    'groupseq': 2,
                        	    'hasld_localized': 'N',
                        	    'localref': 'http://192.168.99.100:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDAyL0JFREZPUkQ-/inspectionform/0-2/inspquestion/1-2',
                        	    'langcode': 'EN',
                        	    'inspquestionnum': '1002',
                        	    'inspfield': [],
                        	    '_rowstamp': '931373',
                        	    'inspquestionid_localized': '2',
                        	    '_id': '1001-1002-EAGLENA-1',
                        	    'sequence': 2,
                        	    'description': 'Q2',
                        	    'sequence_localized': '2',
                        	    'inspquestionid': 2,
                        	    'inspfield_collectionref': 'http://192.168.99.100:7001/maximo/oslc/os/mxapiinspresult/_RUFHTEVOQS8xMDAyL0JFREZPUkQ-/inspectionform/0-2/inspquestion/1-2/inspfield',
                        	    'href': 'http://childkey#SU5TUEVDVElPTlJFU1VMVC9JTlNQRUNUSU9ORk9STS9JTlNQUVVFU1RJT04vMTAwMS8xMDAyL0VBR0xFTkEvMQ--',
                        	    'hasld': false,
                        	    '_done': false,
                        	    '_icon': 'Maximo:Circle',
                        	    'listdesc': '2. Q2',
                        	    '_required': false,
                        	    '__itemIndex__': 1
                        	  }
                        	];
