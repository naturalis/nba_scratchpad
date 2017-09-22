var QUERY_EXECUTION='timerEventQueryExecution';
var runningTimers=[];
var prevService;
var timerCumulative=0;
var executionCount=0;
var timerVisible=false;

function timerReset( timer )
{
	for(var i=0;i<runningTimers.length;i++)
	{
		var r=runningTimers[i];
		if (r.timer==timer)
		{
			r.checkpoints.length=0;
		}
	}	
}

function timerCheckpoint( timer, event )
{
	for(var i=0;i<runningTimers.length;i++)
	{
		var r=runningTimers[i];
		if (r.timer==timer)
		{
			r.checkpoints.push( { event:event, timestamp:new Date().getTime() } );
			return;
		}
	}
	var c=[];
	c.push( { event:event, timestamp:new Date().getTime() } );
	runningTimers.push( { timer:timer, checkpoints:c } );
}

function timerShow( timer )
{
	var buffer=[];

	for(var i=0;i<runningTimers.length;i++)
	{
		var r=runningTimers[i];
		if (r.timer==timer)
		{
			if (r.checkpoints.length==0) return;
			var prev;
			for(var j=0;j<r.checkpoints.length;j++)
			{
				var c=r.checkpoints[j];
				buffer.push(
					fetchTemplate( 'timerCheckpointTpl' )
						.replace('%EVENT%',c.event)
						.replace('%TIMESTAMP%',c.timestamp)
						.replace('%DIFFERENCE%',(prev ? c.timestamp-prev : 0))
				);
				prev=c.timestamp;
			}

			var interval = r.checkpoints[r.checkpoints.length-1].timestamp - r.checkpoints[0].timestamp;
			if (prevService==service)
			{
				timerCumulative+=interval;
				executionCount++;
			}
			else
			{
				timerCumulative=interval;
				executionCount=1;
			}
		}
	}	

	var avg = Math.round((timerCumulative/executionCount) * 100) / 100;
	$('#timer').html(
		fetchTemplate( 'timerListTpl' )
			.replace(/%ITEMS%/g,buffer.join("\n")) 
			.replace(/%AVERAGE%/g,avg) 
			.replace(/%EXEC_COUNT%/g,executionCount) 
			.replace(/%SERVER%/g,server.label) 
			.replace(/%QUERY%/g,lastLoadedSavedQueryName.length>0 ? lastLoadedSavedQueryName : "") 
	);
	
	prevService=service;
}

function copyTimerAverage()
{
	copyToClipboard($('#timerClipboard').html().trim());
	setMessage('copied execution average to clipboard');
}

function clearTimer()
{
	timerCumulative=0;
	executionCount=0;
	prevService=null;

	$('#timer').html(
		fetchTemplate( 'timerListTpl' )
			.replace(/%ITEMS%/g,"") 
			.replace(/%AVERAGE%/g,0) 
			.replace(/%EXEC_COUNT%/g,executionCount)
			.replace(/%SERVER%/g,"")
			.replace(/%QUERY%/g,"") 
	);
}


