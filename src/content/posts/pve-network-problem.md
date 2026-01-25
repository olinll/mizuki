---
title: PVE加网卡后无法进入后台及网络不通问题
description: ' '

published: 2025-10-09
date: 2025-10-09
tags:
  - ProxmoxVE
category: 教程
draft: false
pinned: false
# image: './img/defalut-cover.png'
---


# Shell 修改

首先查看网络配置：
```shell
vim /etc/network/interfaces
```
其中配有管理 IP 的 static 网桥就是当前管理端口。
```shell
auto vmbr2
iface vmbr2 inet static 
		address 192.168.1.100/24 
		gateway 192.168.1.1 
		bridge-ports enp67s0 # 绑定的物理网口，修改它； 
		bridge-stp off 
		bridge-fd 0
```
修改配置文件，把 bridge-ports 改成目标网卡，之后通过如下命令刷新网络。
```shell
systemctl restart networking
```
连接到目标网口，检查是否能连接。
```shell
ping <pve ip地址> -t
```