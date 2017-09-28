#!/usr/bin/python

import cgi, cgitb 
form = cgi.FieldStorage() 

query = form.getvalue('query')

print """\
Content-Type: text/html\n
<html>
<body>
   <p>%s</p>
</body>
</html>
""" % (query,)