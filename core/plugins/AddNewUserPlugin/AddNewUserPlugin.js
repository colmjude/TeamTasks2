/***
|''Name''|Add New User Plugin|
|''Description''||
|''Version''|0.2 - Tiddlywiki|
|''Status''|@@beta@@|
|''Author''|Colm Britton|
!To Do

* Allow configuration of what goes in user task view

!Code
***/

//{{{

(function($){
	
	var macro = config.macros.addNewUser = {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			if(!readOnly) {
				var btn = createTiddlyButton(place, "Add a New User", "Add a New User", this.onClick, "tt-newuser", null, null);
			}
		},
		onClick: function(e) {
			var txt = createTiddlyElement(e.target, 'input', null, 'newuser-input', null, {'type':'text', 'name':'newuser'});
			e.target.onclick = "";
			txt.onkeyup = macro.onKeyPress;
			return false;
		},
		onKeyPress: function(ev) {
			var e = ev || window.event;
			if(e.keyCode == 13) {
				var newuser = $(e.target).val();
				var nutid = new Tiddler(newuser);
				nutid.modifier = nutid.creator = config.options.txtUserName;
				nutid.text = '<<TTReportView DisplayFields:"Title,Status" User:' + newuser + '>>';
				
				var tid = store.getTiddler('UserDefinitions');
				var users = tid.text.split('\n');
				var count = users.length;
				var tmp = users[count-1];
				users[count-1] = "[[" + newuser + "]]";
				users[count] = "<<addNewUser>>"; 
				tid.text = users.join("\n");
				store.saveTiddler(tid);
				store.saveTiddler(nutid);
				autoSaveChanges(null, [tid, nutid]);
			}
		}
	};
	
})(jQuery);
	
//}}}