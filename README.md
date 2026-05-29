#  frontend

项目原地址：https://github.com/LeoninCS/feedsystem_video_go.git 

对应后端地址：https://github.com/wtitdn/Short-video-project


前端由vue3+vite构建，AI生成，但是也写一个以防万一真的有人需要
```
npm i

npm run dev

#成功启动后ctrl c终止

npm run build
```
将dist文件夹转移到/srv/shortvideo下 新建文件夹front 将dist文件夹拷贝到该文件夹下
进入云服务器终端
```
apt install nginx

nginx -t
```
在确认NGINX安装完成后，在/etc/nginx/conf.d文件夹下新增名为shortvideo-frontend.conf的文件
```
server {
listen 1234;
server_name _;

    root /srv/shortvideo/front/dist;
    index index.html;

    client_max_body_size 300m;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:7878/;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
配置文件修改完成后，执行systemctl reload nginx重启nginx 即可在1234端口访问