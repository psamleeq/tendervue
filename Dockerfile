# 使用nginx代理
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist /usr/share/nginx/html
EXPOSE 80 8080
CMD ["nginx", "-g", "daemon off;"]
