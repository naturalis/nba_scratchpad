FROM nginx 
COPY scratchpad /usr/share/nginx/html/
RUN rm /etc/nginx/conf.d/default.conf
COPY conf/nginx.conf /etc/nginx/default.conf
