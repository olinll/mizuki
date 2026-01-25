---
title: docker-compose 网络深究
description: '让你的多个docker-compose实例共同使用一个内部网络'

published: 2026-01-25
date: 2026-01-25
tags: []
category: ''
draft: false
pinned: false
# image: './img/defalut-cover.png'
---
# 创建容器内的网络

```yaml
services:
  app:
    networks:
      - net

networks:
  net:
    driver: bridge
    name: app-network
```

# 绑定容器外的网络

**这个网络必须存在**

```yaml
services:
  app:
    networks:
      - net

networks:
  net:
    external: true
    name: lin-net
```

# 绑定ip地址

```yaml
services:
  app:
    networks:
      net:
        ipv4_address: 172.20.0.102
```

# Docker网络允许外部访问

```shell

# 开放
iptables -A FORWARD -j ACCEPT


yum install iptables-services
sudo service iptables save
systemctl enable iptables 
systemctl start iptables 


```