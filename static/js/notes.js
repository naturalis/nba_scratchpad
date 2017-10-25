function switchNotes(number)
{
	if ($('#notesDiv').is(':visible'))
	{
		showNotes(number,true);
	}
}

function showNotes( number, dontClose )
{
	var query=queryIndex[number].replace(/^query:/,"");
	if (activeQuery==query && !dontClose)
	{
		$('#notesDiv').toggle();
	}
	else
	{
		var newNotes = $('#notes').val().trim();
		if (newNotes!==oldNotes && !initialNote)
		{
			saveNotes();
		}
		activeQuery=query;
		oldNotes = getStoredItem("notes:"+activeQuery,"");
		$('#notes').val(oldNotes);
		$('#notesName').html(activeQuery);
		$('#notesDiv').toggle(true);
		setNoteSize();
		initialNote=false;
	}
}

function detectLinkInNotes()		
{
	var candidate=$('#notes').val().substring($('#notes').prop('selectionStart'),$('#notes').prop('selectionEnd'));
	var res = candidate.match(/((((http|https):(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/i);
	if (res)
	{
		$('#dynamicNotesOutLink').attr('href',candidate).attr('title',candidate).toggle(true);
	}
	else
	{
		$('#dynamicNotesOutLink').toggle(false);
	}
}

function saveNotes()
{
	var notes = $('#notes').val().trim();
	var index = "notes:"+activeQuery;

	if (oldNotes.length==0 && notes.length==0)
	{
		return;
	}
	else
	if (notes.length==0)
	{
		$.jStorage.deleteKey(index);
		setMessage("deleted notes");
	}
	else
	{
		$.jStorage.set(index,notes);
		setMessage("saved notes");
	}

	getQueryIndex();
	checkExampleQueries();
	drawQueryIndex();
	
}

function setNoteSize()
{
	$('#notesSize').html("("+$('#notes').val().trim().length+")");
}

function insertStringInNotes( str )
{
	var cursorPos = $('#notes').prop('selectionStart');
	var val = $('#notes').val();
	var text="";

	if (str=="%date%")
	{
		var date = new Date();
		text = date.toDateString() + ", " + date.getHours() + "h" + date.getMinutes() + ": ";
	} 
	else
	if (str=="%line%")
	{
		text = "-----------------------------------------\n";
	}
	else
	{
		text = str;
	}

	$('#notes').val(val.substring(0,cursorPos) + text + val.substring(cursorPos,val.length));
	setNoteSize();
}

function notesClose()
{
	$('#notesDiv').toggle(false);
}
