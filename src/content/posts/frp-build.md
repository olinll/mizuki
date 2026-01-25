---
title: 搭建Frp
description: 'Frp是一款不错的端口映射工具，可以将内部的端口映射到公网上'

published: 2025-11-10
date: 2025-11-10
tags: ['Frp']
category: '教程'
draft: false
pinned: false
image: './img/frp-build-196435.png'
---



# 前言

Frp可以通过有公网IP的的服务器将内网的主机暴露给互联网，从而实现通过外网能直接访问到内网主机；frp有服务端和客户端，服务端需要装在有公网ip的服务器上，客户端装在内网主机上。

因为博主有一个低配置的云服务器，需要将家里的高性能服务器一些端口映射到云服务，从而进行更高效的访问。

GitHub仓库地址：[github.com/fatedier/frp](https://github.com/fatedier/frp)

# 准备工作

Linux下载frp_xxxx_linux_amd64的

![分布](https://io.jianglin.cc:8443/img/20251110/6d7933f6e638fea4cd300267057f50d3.png)

frpc为客户端

frps为服务端

客户端不需要公网ip，服务端需要公网ip，并且将服务端口映射出来。

# 配置文件

```bash
# 赋予运行权限
chmod +x frps
```



**服务端配置**

```toml
bindPort = 65001 # 服务端与客户端通信端口

transport.tls.force = true # 服务端将只接受 TLS链接

auth.token = "token" # 身份验证令牌，frpc要与frps一致

# Server Dashboard，可以查看frp服务状态以及统计信息
webServer.addr = "0.0.0.0" # 后台管理地址
webServer.port = 65002 # 后台管理端口
webServer.user = "admin" # 后台登录用户名
webServer.password = "admin" # 后台登录密码


bindAddr = "0.0.0.0"
bindPort = 65001  # 服务端与客户端通信端口

auth.method = "token"
auth.token = "Aa135790Toekn"

webServer.addr = "0.0.0.0"
webServer.port = 65002
webServer.user = "jianglin"
webServer.password = "Frp65022"
```

**客户端配置**

```toml
transport.tls.enable = true # 从 v0.50.0版本开始，transport.tls.enable的默认值为 true
serverAddr = "47.101.69.145"
serverPort = 65001 # 公网服务端通信端口

auth.token = "Aa135790Toekn" # 令牌，与公网服务端保持一致

webServer.addr = "0.0.0.0"
webServer.port = 65002
#webServer.user = "admin" # 注释掉就没有账号密码了
#webServer.password = "admin"
webServer.pprofEnable = false

[[proxies]]
name = "bt"
type = "tcp"
localIP = "127.0.0.1" # 需要暴露的服务的IP
localPort = 65000
remotePort = 65100 # 暴露服务的公网入口

[[proxies]]
name = "web80"
type = "tcp"
localIP = "127.0.0.1" # 需要暴露的服务的IP
localPort = 80
remotePort = 80# 暴露服务的公网入口

[[proxies]]
name = "web443"
type = "tcp"
localIP = "127.0.0.1" # 需要暴露的服务的IP
localPort = 443
remotePort = 443# 暴露服务的公网入口
```

# 后台运行

## 宝塔面板

如果使用宝塔面板，可以使用**进程守护管理器**这个插件，配置一个守护进程

按照下图进行配置

![守护进程配置](https://io.jianglin.cc:8443/img/20251110/cfe0388fae52e3fe5df7a640f7620eb8.png)

## systemctl

使用systemctl 管理Frp

```bash
# frps配置
# 编写 frp service 文件，以 ubuntu 为例
vim /usr/lib/systemd/system/frps.service # 有时候需要手动创建system文件夹


# frps.service内容如下
[Unit]
Description=frps
After=network.target syslog.target
Wants=network.target
 
[Service]
TimeoutStartSec=30
ExecStart=/opt/frps/frps -c /opt/frps/frps.ini
ExecStop=/bin/kill $MAINPID
 
[Install]
WantedBy=multi-user.target
```

```bash
# frpc配置
# 编写 frp service 文件，以 ubuntu 为例
vim /usr/lib/systemd/system/frpc.service # 有时候需要手动创建system文件夹


# frps.service内容如下
[Unit]
Description=frpc
After=network.target syslog.target
Wants=network.target
 
[Service]
TimeoutStartSec=30
ExecStart=/opt/frpc/frpc -c /opt/frpc/frpc.ini
ExecStop=/bin/kill $MAINPID
 
[Install]
WantedBy=multi-user.target
```

管理

```bash
# 启动 frp 并设置开机启动
systemctl enable frps
systemctl start frps
systemctl status frps

# 部分服务器上,可能需要加 .service 后缀来操作,即:
systemctl enable frps.service
systemctl start frps.service
systemctl status frps.service
```

至此，配置完成