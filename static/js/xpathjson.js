var JSONpath="";

function clearJSONpathResults()
{
	$('#JSONpathResultsContent').html("");
}

function JSONresultPosition()
{
	var ele = activeWindowType=='localresults' ? $('#localresults') :  $('#iframe');

	$('#JSONpathResults')
		.css({
			'position':'absolute',
			'left': ( ele.width() + 25 ) + 'px',
			'top': ( $('#right').position().top + $('#right').height() ) + 'px'
		});	
		
	$( '#JSONpathResults' ).draggable({ handle: '#JSONpathResultsHeader' });
}

function findJSONpath()
{
	JSONpath = $('#JSONpath').val();

	if (JSONpath.length==0) 
	{
		clearJSONpathResults();
		return;
	}

	$('#JSONpathResultsContent').css("color","#000");

	var json = latestResult.json;
	
	/*
	var paths=Array();

	if (JSONpath.indexOf(",")!=false)
	{
		paths=path.split(",");
	}
	else
	{
		paths.push(JSONpath);
	}
	
	var out="";
	
	for (var i=0;i<paths.length;i++)
	{
		out += jsonPath(json, paths[i]);
	}
	*/
	
	out = jsonPath(json,JSONpath);
	
	if (out)
	{
		$('#JSONpathResultsContent').html(JSON.stringify(out,null,2));
		return true;
	}
	else
	{
		$('#JSONpathResultsContent').css("color","#a00");
		setTimeout(function() { $('#JSONpathResultsContent').css("color","#000"); }, 250);
		return false;
	}
}

function copyJSONpathResultToClipboard( includeQuery )
{
	copyToClipboard(
		( includeQuery ? JSONpath + "\n" : "" ) + 
		$('#JSONpathResultsContent').html()
	);
}

function addElementToJSONpath()
{
	if (!window.x)
	{
		x = {};
	}

	x.Selector = {};
	x.Selector.getSelected = function()
	{
		var t = '';
		if (window.getSelection) {
			t = window.getSelection();
		} else if (document.getSelection) {
			t = document.getSelection();
		} else if (document.selection) {
			t = document.selection.createRange().text;
		}
		return t;
	}

	
	var mytext = x.Selector.getSelected();
	var curr=$('#JSONpath').val();
	$('#JSONpath').val(curr + "." + mytext);
	
	if (!findJSONpath())
	{
		$('#JSONpath').val(curr);
		findJSONpath();
	}

}

function JSONpathDblClick()
{
	var curr=$('#JSONpath').val();
	if (curr.length==0)
	{
		$('#JSONpath').val('$.resultSet[*]');
	} 
	else
	{
		$('#JSONpath').val( curr.substr(0,curr.lastIndexOf(".") ) );
	}

	findJSONpath();
}
