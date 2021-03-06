var prevFound=-1;
var prevPrevFound=0;
var maxCopySize=200000;

function resultsFindAndScroll( next )
{
	if (next=='up') 
	{
		prevFound=prevPrevFound-1;
	}
	else
	if (next!='down') 
	{
		prevFound=0;
	}
	
	var s=$('#resultSearch').val().toLowerCase();
	var found=0;
	if (s.length==0)
	{
		$('#localresults').scrollTop(0);
	}
	else
	{
		var lines=latestResult.formatted.split('\n');
		var first=true;
		for(var i=0;i<lines.length;i++)
		{
			if (stripTags(lines[i]).toLowerCase().indexOf(s)>0)
			{
				if (i>prevFound && first)
				{
					$('#localresults').scrollTo( $('#rl'+i), 100, {axis: 'y'} );
					prevPrevFound=prevFound;
					prevFound=i;
					first=false;
				}
				found++;
			}
		}
	}
	
	$('#resultSearchCount').html(found);
	$('#resultSearchLine').html(prevFound);
}

function resultsCopyToClipboardGeneral( c )
{
	if (c.length>maxCopySize)
	{
		return false;
	}
	else
	{
		return copyToClipboard(c);
	}
}

function resultsCopyToClipboard()
{
	return resultsCopyToClipboardGeneral(JSON.stringify(latestResult.json, undefined, 4));
}

function resultsCopyJIRAToClipboard()
{
	return resultsCopyToClipboardGeneral( fetchTemplate( 'jiraNoFormatTpl' ).replace( '%QUERY%', JSON.stringify(latestResult.json, undefined, 4)));
}
