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

!! To Do
* still needs the orderby part but this first needs the orderby to work properly
* better UI
* ability to order column order

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
				var item = $("<li>").bind("click",macro.itemClick);
				item.append($("<span>",{'class':'field'}).text(fields[i]))
					.append($("<span>",{'class':'filter inactive'}).text("where it equals").append($("<input>", {"type":'text'})));
				//	.append($("<span>",{'class':'orderby inactive'}).text("order dsc"));
				list.append(item);
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
				var rObj = {
					fields: [],
					filters: []
				};
				ttbuilder.find("li.selected").each(function(){
					var field = $(this).find(".field").text();
					rObj.fields.push(field);
					
					var filter = $(this).find(".filter");
					if(filter.hasClass("active")){
						// TODO: handle upper and lowercase
						var value = filter.find("input").val();
						// check if blank
						if(value == ""){
							filter.find("input").addClass("error").val("no value");
							return false;
						} else if(filter.hasClass("not")) {
							value = "!" + value;
						}
						reportFilter = [field, value];
						rObj.filters.push(reportFilter);	
					}
					
					// to do the order by once the order by works properly
					var orderby = $(this).find(".orderby");
					if(orderby.hasClass("active")){
						// to complete soon
					}
					
					//console.log(rObj);
				});
				// generate report macro
				var macrotext = macro.generateMacro(rObj);
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
		generateMacro: function(rObj) {
			var text = "<<TTReportView";
			var toDisplay = rObj.fields.join(',');
			text = text + ' DisplayFields:"' + toDisplay + '"';
			for(var i = 0; i < rObj.filters.length; i++){
				text = text + ' ' + rObj.filters[i][0] + ':"' + rObj.filters[i][1] + '"';
			}
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
		},
		itemClick: function(e) {
			
			var tag = e.target.tagName;
			var jEl = $(e.target); 
			if(tag == "LI" || (tag == "SPAN" && jEl.hasClass("field"))) {
				$(this).toggleClass('selected');
				// reset spans in the element
				console.log(e.target.tagName);
			} else if(tag == "INPUT") {
				var parentspan = jEl.parent("span.filter");
				if(!parentspan.hasClass("active")){
					parentspan.removeClass("inactive").addClass("active");
				}
			} else if($(this).hasClass("selected")) {
				if(jEl.hasClass("filter")) {
					var children = jEl.children();
					if(jEl.hasClass("inactive")) {
						jEl.removeClass("inactive").addClass("active");
					} else if(jEl.hasClass("active") && !jEl.hasClass("not")) {
						jEl.addClass("not").text("where it does not equal").append(children);
					} else {
						jEl.removeClass("not").removeClass("active").addClass("inactive").text("where it equals").append(children);
					}
				} else if(jEl.hasClass("orderby")) {
					if(jEl.hasClass("inactive")) {
						jEl.removeClass("inactive").addClass("active").addClass("dsc");
					} else if(jEl.hasClass("active") && jEl.hasClass("dsc")) {
						jEl.removeClass("dsc").addClass("asc").text("order asc");
					} else {
						jEl.removeClass("active").removeClass("asc").addClass("inactive").text("order dsc");
					}
				}
			} else {
				$(this).toggleClass('selected');
			}
			e.stopPropagation();
		}
	};

})(jQuery);

} //# end of 'install only once'	
//}}}
