/***
|''Name''|OptionalCommentsPlugin|
|''Version''|0.1.5|
|''Status''|beta|
|''Author''|Colm Britton|
|''Description''|Allows you to decide if you want to enable comments or not|
|''Requires''|CommentsPlugin|
|''Source''||

!Code
***/

//{{{
if(!version.extensions.optionalComments) { //# ensure that the plugin is only installed once
version.extensions.optionalComments = { installed: true };
	
(function() {
	
	var opts = config.options;
	config.optionsDesc.chkComments = "check box to enable comments";
	if(opts.chkComments === undefined) {
		opts.chkComments = false;
	}
	
	var macro = config.macros.optionalComments = {
		handler: function(place, macroName, params, wikifier, paramString, tiddler){
			if(opts.chkComments) {
				config.macros.comments.handler(place, macroName, params, wikifier, paramString, tiddler);
			}
		}
		
	};
})();
};
//}}}