function rawurlencode (str) {
  //       discuss at: http://locutus.io/php/rawurlencode/
  //      original by: Brett Zamir (http://brett-zamir.me)
  //         input by: travc
  //         input by: Brett Zamir (http://brett-zamir.me)
  //         input by: Michael Grier
  //         input by: Ratheous
  //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      bugfixed by: Joris
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //           note 1: This reflects PHP 5.3/6.0+ behavior
  //           note 1: Please be aware that this function expects \
  //           note 1: to encode into UTF-8 encoded strings, as found on
  //           note 1: pages served as UTF-8
  //        example 1: rawurlencode('Kevin van Zonneveld!')
  //        returns 1: 'Kevin%20van%20Zonneveld%21'
  //        example 2: rawurlencode('http://kvz.io/')
  //        returns 2: 'http%3A%2F%2Fkvz.io%2F'
  //        example 3: rawurlencode('http://www.google.nl/search?q=Locutus&ie=utf-8')
  //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8'

  str = (str + '')

  // Tilde should be allowed unescaped in future versions of PHP (as reflected below),
  // but if you want to reflect current
  // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

$.fn.selectRange = function(start, end) {
    if(end === undefined) {
        end = start;
    }
    return this.each(function() {
        if('selectionStart' in this) {
            this.selectionStart = start;
            this.selectionEnd = end;
        } else if(this.setSelectionRange) {
            this.setSelectionRange(start, end);
        } else if(this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

function copyToClipboard(text)
{
	var t=$('<textarea>');
	$('body').append(t);
	t.val(text).select();
	var res=document.execCommand('copy');
	t.remove();
	if (ctrlPressed)
	{
		console.log(text);
	}
	return res;
}

function regExpEscape(s)
{
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function findAllSubstrings(string,substring,start,matches)
{
	if (!start) start=0;
	var p=string.indexOf(substring,start)
	if (p!=-1)
	{
		matches.push(p);
		findAllSubstrings(string,substring,p+1,matches)
	}
	return matches;
}

function htmlEncode(value)
{
	// Create a in-memory div, set its inner text (which jQuery automatically encodes)
	// Then grab the encoded contents back out. The div never exists on the page.
	return $('<div/>').text(value).html();
}

function htmlDecode(value)
{
	return $('<div/>').html(value).text();
}

function doubleQuoteText( str, dontSplit=false )
{
	if (dontSplit)
	{
		return '"'+str+'"';
	}
	else
	{
		str=str.replace(/"/g,'');
		var bits=(str.split(/(\s|,)/));
		for(var i=0;i<bits.length;i++)
		{
			if (bits[i].length>0 && bits[i]!="," && bits[i]!=" ")
			{
				var re = new RegExp("\\b"+regExpEscape(bits[i])+"\\b","g");
				str=str.replace(re, '"'+bits[i]+'"');
			}
		}
		return str;
	}
	return '""';
}

function addCommentCharToText( str, commentstr )
{
	return commentstr + str.replace(/(\n)/g,"\n"+commentstr);
}

function removeCommentCharFromText( str, commentstr )
{
	var s=commentstr.replace("/","\/");
	var re = new RegExp("\\n"+s,"g");
	str=str.replace(re,"\n");
	var re = new RegExp("^"+s);
	str=str.replace(re,"");
	return str;
}

function syntaxHighlight(json)
{
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
		function (match)
		{
			var cls = 'number';
			if (/^"/.test(match))
			{
				if (/:$/.test(match))
				{
					cls = 'key';
				} 
				else 
				{
					cls = 'string';
				}
			}
			else 
			if (/true|false/.test(match))
			{
				cls = 'boolean';
			}
			else 
			if (/null/.test(match))
			{
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
}

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

function stripTags( str )
{
	return str.replace(/(<([^>]+)>)/ig,"");
}

function arrayFilterOnlyUnique(value, index, self)
{ 
	return self.indexOf(value) === index;
}