# 使用nginx代理
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/
COPY dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
