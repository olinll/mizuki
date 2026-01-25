---
title: Linux服务器配置校时
description: '数据查不出来？找了半天，md是因为时间不对'

published: 2025-11-12
date: 2025-11-12
tags: []
category: ''
draft: false
pinned: false
image: './img/liunx-chrony-690707.png'
---


在使用服务器时，时间同步很重要，因为很多服务依赖时间，比如数据库、缓存、日志、监控等等。

但是随着运行时间的增长，时间同步的精度会越来越差，因此，建议将服务器的时钟同步到公网时间服务器。

# 将时区设置为上海

```shell
sudo timedatectl set-timezone Asia/Shanghai
```


# 安装时间同步工具 chrony
```shell
# 代理配置
#export http_proxy=http://192.168.1.87:3128
#export https_proxy=http://192.168.1.87:3128
yum install chrony -y
# apt install chrony -y
```

# 配置国内 NTP 服务器/配置内网ntp服务器

```shell
sudo vim /etc/chrony.conf


server 192.168.1.244 iburst

server ntp.aliyun.com iburst
server time1.cloud.tencent.com iburst
server ntp1.aliyun.com iburst
server ntp.sjtu.edu.cn iburst
server cn.ntp.org.cn iburst
```

# 启动并启用 chronyd 服务\验证 chrony 是否运行

```shell
systemctl enable chronyd --now
systemctl start chronyd
systemctl status chronyd
```

# 检查时间同步状态
```shell
## 查看跟踪状态
chronyc tracking
## 查看时间源
chronyc sources -v
```
# 设置 timedatectl 使用 NTP
```shell
timedatectl set-ntp true
```
# 再次查看时间状态
```shell
timedatectl
```
