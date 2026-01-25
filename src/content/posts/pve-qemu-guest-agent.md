---
title: 开启QEMU Guest Agent
description: ' '
published: 2025-10-10
date: 2025-10-10
tags:
  - ProxmoxVE
category: 教程
draft: false
pinned: false
# image: ./img/defalut-cover.png
---
pve虚拟机安装guest agent，使web平台可以直接显示虚拟机的ip，方便管理。


## Ubuntu

```shell
apt install -y qemu-guest-agent

systemctl enable qemu-guest-agent
systemctl start qemu-guest-agent
systemctl status qemu-guest-agent
```