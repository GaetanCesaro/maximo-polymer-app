/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
var agent = navigator.userAgent.toLowerCase();

window.isChrome = agent.indexOf('chrome')>=0;
window.isEdge = agent.indexOf('edge')>=0;
window.isFirefox = agent.indexOf('firefox')>=0;
window.isWindows = navigator.platform.toLowerCase().indexOf('win')>=0;

function innerText(element){
	return element.textContent.replace(/(\r\n|\n|\r)/gm,"").trim();
}

function rgb2hex(rgb){
	 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	 return (rgb && rgb.length === 4) ? "#" +
	  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
	  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
	  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

function isTransparent(rgb){
	if(rgb.toLowerCase()==='transparent'){ //Firefox
		return true;
	}
	rgb = rgb.replace(/ /g, '').replace('rgba(','').replace(')','');
	var values = rgb.split(',');
	return values.length === 4 && values[3] === '0'
}

function getStyleProperty(element, property){
	var style = window.getComputedStyle(element)
	return style.getPropertyValue(property);
}


function getMockedMaximoContext()
{
	var mocked$M;
	var userinfo = {'postalcode':'01460','status_description':'Active','location':{},'transemailelection':'NEVER','lastname':'Seville','acceptingwfmail':true,'city':'Littleton','loctoservreq_localized':'Y','_rowstamp':'[0 0 0 0 0 26 -12 20]','_id':'THEO','maxuser':[{'forceexpiration':false,'defsite':'BEDFORD','failedlogins':0,'status_description':'Active','userid':'THEO','inactivesites_localized':'N','type':'TYPE 1','groupuser':[{'maxgroup':[{'authlaborsuper':false,'authallsites':false,'authlaborall':false,'sidenav':false,'authallgls':false,'_rowstamp':'[0 0 0 0 0 2 -69 -66]','authlaborsuper_localized':'N','sidenav_localized':'N','authpersongroup':false,'maxgroupid_localized':'68','_id':'EVERYONE','description':'All Maximo Users','authlaborself':false,'nullrepfac':true,'independent_localized':'N','authallstorerooms_localized':'N','href':'http://childkey#UEVSU09OL01BWFVTRVIvR1JPVVBVU0VSL01BWEdST1VQL0VWRVJZT05F','authlaborcrew':false,'authallsites_localized':'N','maxgroupid':68,'authallrepfacs':false,'authlaborself_localized':'N','authlaborcrew_localized':'N','authlaborall_localized':'N','localref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/0-1941/maxgroup/0-68','authpersongroup_localized':'N','nullrepfac_localized':'Y','authallstorerooms':false,'independent':false,'authallgls_localized':'N','authallrepfacs_localized':'N'}],'groupuserid_localized':'1,941','_rowstamp':'[0 0 0 0 0 22 59 -80]','groupuserid':1941,'_id':'EVERYONE-THEO','maxgroup_collectionref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/0-1941/maxgroup','localref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/0-1941','groupname':'EVERYONE','href':'http://childkey#UEVSU09OL01BWFVTRVIvR1JPVVBVU0VSL0VWRVJZT05FL1RIRU8-'},{'maxgroup':[{'authlaborsuper':false,'workcenter_description':'Supervisor Inspector','authallsites':true,'authlaborall':false,'sidenav':false,'authallgls':false,'_rowstamp':'[0 0 0 0 0 22 59 36]','authlaborsuper_localized':'N','sidenav_localized':'N','authpersongroup':false,'maxgroupid_localized':'572','_id':'INSPECTORSUP','description':'Inspector supervisor group','authlaborself':false,'nullrepfac':true,'independent_localized':'N','authallstorerooms_localized':'N','href':'http://childkey#UEVSU09OL01BWFVTRVIvR1JPVVBVU0VSL01BWEdST1VQL0lOU1BFQ1RPUlNVUA--','authlaborcrew':false,'authallsites_localized':'Y','maxgroupid':572,'authallrepfacs':false,'authlaborself_localized':'N','authlaborcrew_localized':'N','authlaborall_localized':'N','localref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/1-1943/maxgroup/0-572','authpersongroup_localized':'N','nullrepfac_localized':'Y','authallstorerooms':false,'independent':false,'workcenter':'inspectorsup','authallgls_localized':'N','authallrepfacs_localized':'N'}],'groupuserid_localized':'1,943','_rowstamp':'[0 0 0 0 0 22 59 -78]','groupuserid':1943,'_id':'INSPECTORSUP-THEO','maxgroup_collectionref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/1-1943/maxgroup','localref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/1-1943','groupname':'INSPECTORSUP','href':'http://childkey#UEVSU09OL01BWFVTRVIvR1JPVVBVU0VSL0lOU1BFQ1RPUlNVUC9USEVP'},{'maxgroup':[{'authlaborsuper':false,'maxschedreport':15,'authallsites':false,'authlaborall':true,'sidenav':true,'authallgls':false,'_rowstamp':'[0 0 0 0 0 11 118 -68]','authlaborsuper_localized':'N','sidenav_localized':'Y','authpersongroup':false,'maxgroupid_localized':'16','_id':'SCHEDULING','description':'Scheduling','authlaborself':false,'nullrepfac':true,'independent_localized':'N','authallstorerooms_localized':'Y','href':'http://childkey#UEVSU09OL01BWFVTRVIvR1JPVVBVU0VSL01BWEdST1VQL1NDSEVEVUxJTkc-','authlaborcrew':false,'authallsites_localized':'N','maxgroupid':16,'authallrepfacs':false,'authlaborself_localized':'N','authlaborcrew_localized':'N','authlaborall_localized':'Y','localref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/2-1942/maxgroup/0-16','authpersongroup_localized':'N','nullrepfac_localized':'Y','authallstorerooms':true,'independent':false,'authallgls_localized':'N','sctemplateid_localized':'11','sctemplateid':11,'maxschedreport_localized':'15','authallrepfacs_localized':'N'}],'groupuserid_localized':'1,942','_rowstamp':'[0 0 0 0 0 22 59 -79]','groupuserid':1942,'_id':'SCHEDULING-THEO','maxgroup_collectionref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/2-1942/maxgroup','localref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser/2-1942','groupname':'SCHEDULING','href':'http://childkey#UEVSU09OL01BWFVTRVIvR1JPVVBVU0VSL1NDSEVEVUxJTkcvVEhFTw--'}],'password':'','sidenav':0,'isconsultant_localized':'N','_rowstamp':'[0 0 0 0 0 22 59 -94]','sidenav_localized':'0','_id':'THEO','groupuser_collectionref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780/groupuser','type_description':'TYPE 1','href':'http://childkey#UEVSU09OL01BWFVTRVIvVEhFTw--','status':'ACTIVE','querywithsite_localized':'Y','maxuserid':780,'localref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user/0-780','maxuserid_localized':'780','loginid':'theo','forceexpiration_localized':'N','inactivesites':false,'sysuser_localized':'N','querywithsite':true,'sysuser':false,'screenreader':false,'failedlogins_localized':'0','storeroomsite':'BEDFORD','isconsultant':false,'screenreader_localized':'N'}],'acceptingwfmail_localized':'Y','loctoservreq':true,'href':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--','personuid_localized':'951','transemailelection_description':'Never Notify','maxuser_collectionref':'http://localhost:7001/maximo/oslc/os/mxapiperuser/_VEhFTw--/user','status':'ACTIVE','statusdate':'2017-02-01T12:25:19-05:00','statusdate_localized':'2/1/17 12:25 PM','firstname':'Theodore','country':'US','addressline1':'550 King Street','dfltapp':'INSPECTORSUP','wfmailelection_description':'Notify based on the process','personid':'THEO','personuid':951,'stateprovince':'MA','user':{'logouttracking':{'attemptdate_localized':'2/9/17 10:36 PM','attemptdate':'2017-02-09T22:36:51-05:00'}},'wfmailelection':'PROCESS','displayname':'Theodore Seville','locale':'en_US','_lang':'en','_country':'US'};

	$M.workScape = document.createElement('maximo-workscape');
	$M.userInfo = userinfo;
	
	mocked$M = sinon.mock($M);
	return mocked$M;
}
