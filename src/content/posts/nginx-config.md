---
title: Nginx配置
description: 'Nginx是一款特别牛逼的反向代理工具'

published: 2026-01-25
date: 2026-01-25
tags: ['Nginx']
category: '记录'
draft: false
pinned: false
# image: './img/defalut-cover.png'
---

# 安装Nginx

正常Linux发行版的软件包里自带Nginx，甚至有些发行版自己帮你装好了

```bash

# 对于Ubuntu
apt install -y nginx


# 启动nginx
systemctl start nginx
# nginx开机自启动
systemctl enable nginx

# 检查Nginx配置是否正确
nginx -t
```

# 一般配置

```sql

server {
    listen       7000;
    server_name  localhost;

	location / {
        root   /opt/hf-gps/html; # 路径
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

	# 反向代理
    location /api {
       proxy_set_header Host $http_host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_pass http://127.0.0.1:60000;
    }
}

```

# SSL配置

```sql

server {
	
	listen 10003 ;
    server_name  js.wxlxhf.com;
    listen 10004 ssl;
    
    ssl_certificate    /opt/cert/js.wxlxhf.com.pem;
    ssl_certificate_key    /opt/cert/js.wxlxhf.com.key;
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000";
    error_page 497  https://$host$request_uri;    

    # 管理-路由
    location / {
        root   /opt/hf-gps/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    # 后台地址
    location /prod-api/ {
       proxy_set_header Host $http_host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_pass  http://127.0.0.1:7001/ ;
    }
   
}

```

# 转发服务

## 添加stream模块

查看是否添加该模块

```bash
nginx -V
```

搜索是否包含`--with-stream`,如果包含则已添加过此模块。

如果没有需要编译添加

```bash
./configure  --prefix=/etc/nginx --with-stream
make && make install
```

注意

> `--prefix=/etc/nginx` 是nginx的执行文件位置，根据自己的服务器的实际情况配置。

## 转发TCP(Mysql)配置

假如Nginx的公网IP为`110.119.120.121`,Mysql所在的同一个内网的内网IP为`192.168.1.20`

```sql
#stream配置
stream {
    server {
       listen 13306; 
       proxy_connect_timeout 1s;
       proxy_timeout 3s;
       proxy_pass 192.168.1.20:3306;    
    }
}

http {
}
```

这样我们就能通过`110.119.120.121:13306`访问到Mysql服务了。

注意

> 1. stream配置项和http同级。
> 2. 不支持不同域名转发不同Mysql的功能。

这样做的好处

- 避免数据库服务器直接暴漏在公网
- 方便数据库秒级切换

## UDP负载均衡

下面就是UDP负载均衡的示例

```sql
#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;

events {
    worker_connections  1024;
}

stream {
    upstream dns {
       server 192.168.111.99:10086;
       server 192.168.111.100:10086;
    }

    server {
        listen 192.168.111.98:10086 udp;
        proxy_responses 1;
        proxy_timeout 20s;
        proxy_bind $server_addr:$remote_port;
        proxy_pass dns;
    }
}
```

## 反向代理Minio

:::tip

如果出现 页面上显示“ The request signature we calculated does not match the signature you provided. Check your key and signing method.”可以使用此配置文件解决

签名是放在header头当中的，所以一定要设置 `proxy_set_header`

:::

```sql

# minio-api反向代理配置
server {
    server_name  localhost;
    listen 9000; # 外网端口
    location / {
		proxy_set_header Host $http_host;
		proxy_pass  http://192.168.1.10:9001/;# minio地址
   }
}

```