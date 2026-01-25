---
title: JumpServer开源堡垒机
description: ' '

published: 2025-11-12
date: 2025-11-12
tags: ['JumpServer']
category: '教程'
draft: false
pinned: false
image: './img/jumpserver-install-695979.png'
---


![](./img/jumpserver-install-695979.png)

JumpServer 是一款由开源中国（OSCHINA）旗下团队使用python开发的开源堡垒机系统，遵循 Apache 2.0 开源协议。作为企业级的运维安全审计解决方案，它主要用于解决复杂环境下的服务器、网络设备、云资源等资产的集中管理、权限控制、操作审计等问题，帮助企业实现合规性管理并降低运维风险。

JumpServer分为开源版和企业版，开源版仅提供基础功能，适合中小企业或技术团队自主搭建，而企业版则支持集群部署，高可用（HA），多云管理，定制化开发等高级功能，适合企业和复杂场景

JumpServer 官网：[jumpserver](https://www.jumpserver.org/)

使用文档：[JumpServer使用文档](https://docs.jumpserver.org/zh/v4/)

# 部署

不推荐在已有的机器上面进行部署，创建一个干净的机器，然后按照文档进行安装。

Linux单机部署文档：[Linux单机部署](https://docs.jumpserver.org/zh/v4/installation/setup_linux_standalone/requirements/)

最小化硬件配置：2核CPU 8G内存 60G硬盘

> 官网的部署文档非常全面，可以前往官方文档进行查看。

# 问题

1、如果启动了很久还是无法访问，请查找问题，如果因为redis容器无法启动，并且报下面的问题，可以使用这种方式处理
```shell
WARNING Memory overcommit must be enabled! Without it, a background save or replication may fail under low memory condition. 
Being disabled, it can can also cause failures without low memory condition, see https://github.com/jemalloc/jemalloc/issues/1328. 
To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
```

处理方式：

```shell
echo 'vm.overcommit_memory = 1' | sudo tee -a /etc/sysctl.conf
```

2、创建应用发布机时可能会出现无法连接到Windows Server RDP远程桌面的问题

[远程应用 - JumpServer](https://docs.jumpserver.org/zh/v4/manual/admin/system_settings/remote_apps/?h=%E5%8F%91%E5%B8%83)


如果资产设置了 远程(RDP)连接要求使用指定的连接层 SSL

- 在 JumpServer 资产管理 - 平台列表 创建一个新的平台模板
- 名称: Windows-SSL
- 基础: Windows
- 编码: UTF-8 如果复制粘贴乱码可以改成 GBK
- RDP security: TLS
- RDP console: 默认
- 提交后, 修改资产的系统平台为 Windows-SSL
