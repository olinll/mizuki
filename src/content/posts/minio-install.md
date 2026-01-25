---
title: Minio对象存储
description: '一款开源的对象存储服务，可用于存储文件、图片、视频等'

published: 2025-11-11
date: 2025-11-11
tags: ['Minio']
category: '教程'
draft: false
pinned: false
image: './img/minio-install-170149.png'
---


Minio 是一个基于Apache License v2.0开源协议的对象存储服务，虽然轻量，却拥有着不错的性能。它兼容亚马逊S3云存储服务接口，非常适合于存储大容量非结构化的数据。

官网：[https://www.minio.org.cn](https://www.minio.org.cn)

部署参考：[布署单节点单磁盘的MinIO服务](https://www.minio.org.cn/docs/minio/container/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#id15)


因为Minio从RELEASE.2025-04-22T22-12-26Z版本就转收费了，所以我们部署使用最后一个版本：`RELEASE.2025-04-22T22-12-26Z`

# 使用docker部署

docker-compose.yaml配置文件

```yaml
services:
  minio:
    image: minio/minio:RELEASE.2025-04-22T22-12-26Z
    #image: 'minio/minio:RELEASE.2025-04-22T22-12-26Z-cpuv1'
    container_name: minio
    hostname: minio
    ports:
      - 9000:9000
      - 9001:9001
    volumes:
      - ./data:/data
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=Aa123456
    restart: always
    command: server --console-address ':9000' --address ':9001' /data
    networks:
      - app-net
networks:
  app-net:
    external: true
```


# 二进制文件部署

二进制文件地址：[minio-archive](https://dl.min.io/server/minio/release/linux-amd64/archive/)

使用版本：`minio.RELEASE.2025-04-22T22-12-26Z`

## 下载并配置minio

```shell
# 下载指定minio版本
wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio.RELEASE.2025-04-22T22-12-26Z
# 改名
mv minio.RELEASE.2025-04-22T22-12-26Z ./minio
# 添加执行权限
chmod +x minio
```

## 配置systemctl服务

可以配置systemctl服务，实现开机自启。


创建`minio.conf`文件，并添加以下内容：

> minio启动参数，用户名密码等参数存放在这个配置文件内。
> 
> 注意：请将`/opt/minio/data`修改为实际存放数据的目录。
```sql
# 数据存放目录
MINIO_VOLUMES="/opt/minio/data"
# 端口号设置
MINIO_OPTS="--address :9001 --console-address :9000"
# 用户名
MINIO_ROOT_USER="admin"
# 密码
MINIO_ROOT_PASSWORD="Aa123456"
```

创建`/etc/systemd/system/minio.service`文件，并添加以下内容：

```sql
[Unit]
Description=MinIO
Documentation=https://docs.min.io
Wants=network-online.target
After=network-online.target
#minio文件具体位置
AssertFileIsExecutable=/opt/minio/minio

[Service]
# User and group 用户 组
User=root
Group=root
#创建的配置文件 minio.conf
EnvironmentFile=/opt/minio/minio.conf
ExecStart=/opt/minio/minio server $MINIO_OPTS $MINIO_VOLUMES
Restart=always
LimitNOFILE=65536
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
```

然后将文件复制到指定位置

```shell
cp minio.service /etc/systemd/system/minio.service
```

重载并启动服务

```shell
systemctl daemon-reload    # 重新刷新系统服务
systemctl enable minio     # 设置开机自启动
systemctl start minio      # 启动服务
systemctl status minio     # 查看MinIO状态，输出应显示 active (running)。
journalctl -u minio.service -f    # 查看实时日志
```