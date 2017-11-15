/*
 * IBM Confidential
 *
 * OCO Source Materials
 *
 * 5724-U18
 *
 * Copyright IBM Corp. 2017
 *
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 */
		loadLoginResources = function(){
			if(fillResources){
				var resourceComments = ['\/\/START NON-TRANSLATABLE','\/\/END NON-TRANSLATABLE'];
				var userLang = '/'+(navigator.language || navigator.userLanguage).split('-')[0];
				if(userLang === '/en'){
					userLang = '';
				}
				var maximoLoginProp = 'script/maximocomponents/maximo-login/translation'+userLang+'/resources.json';
				var login = this;
				$.ajax({
					url: maximoLoginProp,
					headers: {
					    'Accept-Language': userLang
					},
					lang: userLang,
					data: {
						format: 'text'
					},
					error: function(jqXHR, textStatus, errorThrown ) {
						if(retry){
							console.log('An error has occured while loading the login resources for '+this.lang+'. Reverting to English.');	
							loadResources('en');
						}
						else {
							loadResources('/'+this.lang.substring(1).split('-')[0], true);
						}
					},
					dataType: 'text',
					success: function(resources, textStatus, jqXHR) {
						resourceComments.forEach(function(comment){
							resources = resources.replace(new RegExp(comment, 'g'),'');
						});
						fillResources(JSON.parse(resources));
					},
					type: 'GET'
				});
			}
		};
