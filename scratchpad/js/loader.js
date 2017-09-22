//var timeoutHandle;

function toggleElementsDisabled( state )
{
	$('input,textarea,select').each(function(ele,index)
	{
		$(this).prop('disabled',state);
	});
}

function disablePage()
{
	setMessage('loading');
	$('#loader').toggle( true );
	toggleElementsDisabled( true );
	// specific override for iframe
	$('#iframe').css( "background-color", "#f0f0f0" );
//	timeoutHandle=setTimeout(function(){ enablePage( 'time out' ); }, 10000);
}

function enablePage( msg )
{
//	clearTimeout( timeoutHandle );
	if (!msg) msg='done loading';
	// specific override for iframe
	$('#iframe').css( "background-color", "#fff" );
	toggleElementsDisabled( false );
	$('#loader').fadeOut(1000);
	setMessage(msg,5000);
}