var outputHashes=[];
var hashesVisible=false;

function storeOutputHash( output )
{
	if (output)
	{
		var d = new Date();
		outputHashes.push( { hash: md5(output), timestamp: d.getTime() } );
	}
}

function removeOutputHash( i )
{
	if (i===parseInt(i,10))
	{
		outputHashes.splice(i,1);
	}
	else
	{
		outputHashes=[];
	}
}

function hashesToggle()
{
	if (!hashesVisible) removeOutputHash(null);
	$('.hashes').toggle(!hashesVisible);
	hashesVisible=!hashesVisible;
	if (hashesVisible) printOutputHashes();
	setMessage('output hashes ' + (hashesVisible ? 'on' : 'off') );	
}

function printOutputHashes()
{
	var buffer=[];

	for(var i=0;i<outputHashes.length;i++)
	{
		var d = new Date(outputHashes[i].timestamp);
		buffer.unshift( 
			fetchTemplate( 'hashTpl' )
				.replace('%I%',i)
				.replace('%HASH%',outputHashes[i].hash)
				.replace('%TIMESTAMP%',d.toLocaleTimeString())
				.replace('%CLASS%',(outputHashes[i-1] && outputHashes[i].hash!=outputHashes[i-1].hash ? 'diff' : '' ))
			);
	}
	
	$('#hashes').html(fetchTemplate( 'hashesTpl' ).replace(/%ITEMS%/g,buffer.join("\n")));
}
