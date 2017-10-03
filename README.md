# nba_scratchpad

Python/Flask application that serves up NBA Scratchpad, a html/Javascript/CSS-based tool for use with the Netherlands Biodiversity API.

Environment variables:
NBA_ADDRESS: IP or domain of the NBA Server (required)
NBA_PORT: port at which to access the NBA Server (required)
NBA_TIMEOUT: timeout for communication with the NBA (seconds, default 10)
LISTENING_PORT: listening port of the Flask app
