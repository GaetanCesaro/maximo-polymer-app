/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */

/*
A rich text editor component.
 */
 Polymer({
    is: 'maximo-richtexteditor',
    behaviors : [ BaseComponent ],
    properties: {
    
      value: {
        type: String,
        readOnly: false
      },
 
      /**
       * Hide/Show Menubar
       */
      menubar: {
    	type: Boolean,
    	value : false
      },
      
      /**
       * Hide/Show statusbar which appears at bottom of textarea
       */
      statusbar: {
      	type: Boolean,
      	value : false
       },
      
       /**
        * Resize horizontal and Vertically
        */
      resize: {
        type: String,
        value: 'both'
      },
      
      /**
       * Text to appear in textarea describing the editable area
       */
      placeholder: {
        type: String,
        value: ''
      },
      
      /**
       * Css like selector expression
       */
      selector: {
          type: String,
          value: 'textarea'
        },
       
      /**
       * Define which buttons appear on the toolbar
       */  
      toolbar: {
          type: String,
          value: 'bold italic underline forecolor numlist bullist'
        },
      
        
      /**
       * The height of the editor.
       */
      height: {
        type: Number,
        value: 200
      },
      
      /**
       * The width of the editor.
       */
      width: {
        type: String,
        value: '100%'
      },
      
      /**
       * Uniqueid identifying each textarea
       * Needed if multiple textarareas exist
       */
      textareauniqueid: {
          type: String,
          value: ''
        },

    },
    observers: [
     
    ],
    
    ready: function(){	
	   	 tinymce.init({
      	   mode:'textareas',
      	   selector: this.selector,
      	   height: this.height,
      	   width: this.width,
      	   menubar: this.menubar,
      	   statusbar: this.statusbar,
      	   resize: this.resize,
      	   plugins: [
      	       'placeholder textcolor lists directionality'
   	       ],
      	   toolbar: this.toolbar
        });
	},
	
    attached: function(){
      tinymce.execCommand('mceRemoveEditor', true, this.textareauniqueid); 
      tinymce.execCommand('mceAddEditor', true, this.textareauniqueid);
    },
     
  });
