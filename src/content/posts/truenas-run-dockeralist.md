---
title: 使用TrueNAS运行Alist容器
description: '理论上你可以参考此教程运行各种容器'

published: 2025-11-12
date: 2025-11-12
tags: ['TrueNAS', 'Docker']
category: '教程'
draft: false
pinned: false
# image: './img/defalut-cover.png'
---


TrueNas是一个专注于存储的文件存储系统，不带有图形化界面，只提供了SMB、NFS、ISCSI等协议，如果想要访问里面的文件只能通过外部挂载的形式使用，非常不方便。

博主使用的是TrueNas Scale，使用了Docker作为应用插件的底层，所以可以配置一个自定义的容器使用。

> 这里使用的Alist v3.40.0-ffmpeg （Alist被收购之前的版本，已经托管在了阿里云的镜像仓库中）

---

镜像地址：crpi-xntgazlqn787usm7.cn-shanghai.personal.cr.aliyuncs.com/olinl/alist

版本：v3.40.0-ffmpeg

---

安装信息：

Repository：crpi-xntgazlqn787usm7.cn-shanghai.personal.cr.aliyuncs.com/olinl/alist

标签：v3.40.0-ffmpeg

网络配置：

端口/Host Port（宿主机端口）：5244

端口/Container Port（容器端口）：5244

Portal Configuration/端口：5244

存储/Mount Path（容器挂载路径）：/mnt/truenas

存储/Host Path（宿主机路径）：

> PS：TrueNAS的文件都在`/mnt/`下面，所以alist可以使用`本机存储`的方法创建存储归档文件夹。


:::note

目前OpenList官方文档已提供TrueNAS安装教程，点击前往：[使用 TrueNAS Scale - OpenList 文档](https://doc.oplist.org/guide/installation/truenas)
:::