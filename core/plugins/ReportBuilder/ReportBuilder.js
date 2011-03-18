/***
|''Name:''|ReportBuilderPlugin|
|''Description:''||
|''Author:''|Colm Britton|
|''CodeRepository:''||
|''Date:''|March 18, 2011|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |

''Usage examples:''

Create the UI to build a teamtask report
{{{
<<ReportBuilder>>
}}}

***/

//{{{
if(!version.extensions.ReportBuilderPlugin) {
version.extensions.ReportBuilderPlugin = {installed:true};

(function($){

	var macro = config.macros.reportbuilder = {
		stdfields: ["title", "modifier", "modified", "creator"],
		handler: function(place, macroName, params, wikifier, paramString, tiddler) {
			var fields = [];
			var controls = store.getTiddlerText("TaskTiddlerControls");
			var thtml = wikifyStatic(controls);
			jQuery(thtml).find('tr').each(function(){
			    fields.push(jQuery(this).first('td').text().trim());
			});
			fields = fields.concat(macro.stdfields);
			
			var container = $("<div />", {"class":"ttbuilder"}).appendTo(place);
			container
					.append($("<input>", {'type':"text", 'name':"title", 'class':"reporttitle"})
							.val('Report title')
							.focus(
								function() {
									$(this).removeClass('error');
									$(this).next(".message").text("");
								})
							)
					.append($("<div>", {"class":"message"}))
					.append(macro.createOpts(fields.sort()));
			var btn = createTiddlyButton(place, "Create", "Create", this.onCreate, "create-report", null, null);
			
			console.log(container);
		},
		createOpts: function(fields) {
			var list = $("<ul>", {'class':'builderlist'});
			for(var i = 0; i < fields.length; i++) {
				list.append(
					$("<li>")
						.text(fields[i])
						.bind("click",function(){
							$(this).toggleClass('selected');
						})
				);
			}
			return list;
		},
		onCreate: function(){
			var me = $(this);
			//console.log(me.prev(".ttbuilder"));
			var ttbuilder = me.prev(".ttbuilder");
			// get tiddler title to be
			var title = ttbuilder.find('input.reporttitle').val();
			if(title == "Report title") {
				ttbuilder.find('.message').text('no title entered');
				$('input.reporttitle').addClass("error");
			} else if(store.tiddlerExists(title)){
				// check whether tiddler exists
				ttbuilder.find('.message').text('tiddler of that title already exists');
				$('input.reporttitle').addClass("error");
			} else {
				// get selected fields
				var sfields = [];
				ttbuilder.find("li.selected").each(function(){
					sfields.push($(this).text());
				});
				// generate report macro
				var macrotext = macro.generateMacro(sfields);
				// create tiddler with macro as the text
				var reportTid = macro.createReportTiddler(title, macrotext);
				// add to the list of reports (if desired?)
				var taskViews = store.getTiddler("TaskViews");
				var reports = taskViews.text.split('\n');
				var count = reports.length;
				var tmp = reports[count-1];
				reports[count-1] = "[[" + title + "]]";
				reports[count] = tmp;
				taskViews.text = reports.join("\n");
				store.saveTiddler(taskViews);
				// save new tiddler
				autoSaveChanges(null, [reportTid, taskViews]);
			}
			
		},
		generateMacro: function(fields) {
			var text = "<<TTReportView";
			var toDisplay = fields.join(',');
			text = text + ' DisplayFields:"' + toDisplay + '"';
			text = text + ">>";
			return text;
		},
		createReportTiddler: function(title, text) {
			var tid = new Tiddler(title);
			tid.tags = ['report'];
			tid.text = text;
			tid.modifier = tid.creator = config.options.txtUserName;
			tid = store.saveTiddler(tid);
			story.displayTiddler(null, tid.title);
			return tid;
		}
	};

})(jQuery);

} //# end of 'install only once'	
//}}}
