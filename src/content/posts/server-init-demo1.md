---
title: 服务器初始化配置（全）
description: 某单位服务器初始化配置脚本明细

published: 2025-10-01
date: 2025-10-01
tags: ['Linux']
category: '碎碎念'
draft: false
pinned: false
# image: './img/defalut-cover.png'
---

# 1. 扩容硬盘

# 2. 换源

# 3. 时间时区配置

# 4. 其他



```shell
# 修改服务器名称
hostnamectl set-hostname

# 修改hosts配置
vim /etc/hosts

# -------chengyun-------
172.172.254.104	cydb01
172.172.254.105	cydb02
172.172.254.106	cydb03
172.172.254.107	cydata
172.172.254.100	cyweb
172.172.254.101	cyapp01
172.172.254.102	cyapp02
172.172.254.103	cymgr
# -------chengyun-------
 
```

# 5. 安装k8s集群
```shell
# 配置config.yaml文件 当前文件配置为cy-config-k8s.yaml
# 将ks-core-1.1.3.tgz、kubesphere-4.1.tar.gz、kk、create_project_harbor.sh 和上面的文件上传到管理节点服务器

# 安装必要组件
apt install -y socat conntrack


# 修改docker配置
mkdir -p /etc/docker
vim /etc/docker/daemon.json

{
  "log-opts": {
    "max-size": "5m",
    "max-file":"3"
  },
  "exec-opts": ["native.cgroupdriver=systemd"],
  "data-root": "/opt/docker"
}


# 创建镜像仓库
./kk init registry -f cy-config-k8s.yaml -a kubesphere-4.1.tar.gz

# 创建仓库
sh create_project_harbor.sh

# 推送镜像至镜像仓库
./kk artifact image push -f cy-config-k8s.yaml -a kubesphere-4.1.tar.gz

# 创建Kubernetes集群
./kk create cluster -f cy-config-k8s.yaml -a kubesphere-4.1.tar.gz --with-local-storage
 
# 安装Kubesphere
helm upgrade --install -n kubesphere-system --create-namespace ks-core ks-core-1.1.3.tgz \
     --set global.imageRegistry=harbor.chengyun.local/ks \
     --set extension.imageRegistry=harbor.chengyun.local/ks \
     --set ksExtensionRepository.image.tag=v1.1.2 \
     --debug \
     --wait



---------------------------------
# 卸载集群
./kk delete cluster -f cy-config-k8s.yaml
```


# 6. 安装Minio

资源地址：https://dl.min.io/server/minio/release/linux-amd64/archive/

使用版本：minio.RELEASE.2025-04-22T22-12-26Z

```shell
# 下载指定minio版本
wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio.RELEASE.2025-04-22T22-12-26Z
# 改名
mv minio.RELEASE.2025-04-22T22-12-26Z ./minio
# 添加执行权限
chmod +x minio

# 配置 Systemd 服务
## minio.conf
## minio.service
cp minio.service /etc/systemd/system/minio.service

# ### 重载并启动服务​
systemctl daemon-reload    # 重新刷新系统服务
systemctl enable minio     # 设置开机自启动
systemctl start minio      # 启动服务
systemctl status minio     # 查看MinIO状态，输出应显示 active (running)。
journalctl -u minio.service -f    # 查看实时日志

```
# 7. 搭建Redis集群

```shell
wget http://172.172.254.107:9001/default-bucket/redis-7.4.6.tar.gz
tar -zxvf redis-7.4.6.tar.gz
# 安装gcc环境
apt install gcc make -y

# 编译
cd src/ 
make MALLOC=libc

# 运行
./redis-server ../redis.conf

# 修改redis密码
vim redis.conf
#找到901行，找到 requirepass
requirepass CyRedis

# 外部访问Redis
#找到75行，找到 bind 127.0.0.1
bind 0.0.0.0

# Redis以后台方式运行
#找到257行，找到 daemonize no
daemonize no

# 开机自启动
## 新建一个服务文件
vim /etc/systemd/system/redis.service
## 内容如下

[Unit]
Description=redis-server
After=network.target

[Service]
Type=forking
ExecStart=/opt/redis-7.4.6/src/redis-server /opt/redis-7.4.6/redis.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target

## 重载系统服务
systemctl daemon-reload
### 启动
systemctl start redis
### 停止
systemctl stop redis
### 重启
systemctl restart redis
### 查看状态
systemctl status redis




# -a 密码认证，若没写密码无效带这个参数
# --cluster create 创建集群实例列表 IP:PORT IP:PORT IP:PORT
# --cluster-replicas 复制因子1（即每个主节点需1个从节点）
./bin/redis-cli  --cluster create --cluster-replicas 1 192.168.100.101:8001 192.168.100.101:8002 192.168.100.102:8003 192.168.100.102:8004 192.168.100.103:8005 192.168.100.103:8006
```

```bash
wget http://172.172.254.107:9001/default-bucket/redis-7.4.6.tar.gz
tar -zxvf redis-7.4.6.tar.gz
# 安装gcc环境
apt install gcc make -y
# 编辑安装
make && sudo make install

# 创建 Redis 集群目录结构（每台机器）
sudo mkdir -p /opt/redis/cluster/{7001,7002}
cd /opt/redis/cluster/

# 配置 Redis 实例
## 创建 7001 配置文件
# /opt/redis/cluster/7001/redis.conf
port 7001
bind 0.0.0.0
daemonize no
pidfile /var/run/redis_7001.pid
cluster-enabled yes
cluster-config-file nodes-7001.conf
cluster-node-timeout 5000
dir /opt/redis/cluster/7001
dbfilename dump.rdb
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfilename "appendonly.aof"
logfile /opt/redis/cluster/7001/redis.log
requirepass redisCy

## 创建 7002 配置文件
# /opt/redis/cluster/7002/redis.conf
port 7002
bind 0.0.0.0
daemonize no
pidfile /var/run/redis_7002.pid
cluster-enabled yes
cluster-config-file nodes-7002.conf
cluster-node-timeout 5000
dir /opt/redis/cluster/7002
dbfilename dump.rdb
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfilename "appendonly.aof"
logfile /opt/redis/cluster/7002/redis.log
requirepass redisCy

# 启动所有 Redis 实例
## 启动 7001 实例
redis-server /opt/redis/cluster/7001/redis.conf
## 启动 7002 实例
redis-server /opt/redis/cluster/7002/redis.conf
## 关闭所有进程
pkill redis-server

# 创建 Redis 集群（使用 redis-cli）
## 在任意一台机器上执行（比如 cydb01）
## --cluster-replicas 1 表示每个主节点配一个从节点，共 3 主 3 从。
redis-cli --cluster create \
172.172.254.104:7001 \
172.172.254.105:7001 \
172.172.254.106:7001 \
172.172.254.104:7002 \
172.172.254.105:7002 \
172.172.254.106:7002 \
--cluster-replicas 1 \
-a redisCy

# 验证集群状态
redis-cli -c -h 172.172.254.104 -p 7001 cluster nodes
redis-cli -c -h 172.172.254.104 -p 7001 -a redisCy cluster nodes
## 你应该看到 6 个节点，3 个 master，3 个 slave，且 slave 指向正确的 master。
## 查看集群信息
redis-cli -c -h 172.172.254.104 -p 7001 cluster info

# 测试写入数据（自动重定向）
redis-cli -c -h 172.172.254.104 -p 7001
> set name "zhangsan"
> get name
## 使用 -c 参数启用集群模式，支持自动跳转。

# 开机自启
#/etc/systemd/system/redis-7001.service
[Unit]
Description=Redis 7001
After=network.target

[Service]
ExecStart=/usr/local/bin/redis-server /opt/redis/cluster/7001/redis.conf
ExecStop=/usr/local/bin/redis-cli -p 7001 shutdown
Restart=always
User=redis

[Install]
WantedBy=multi-user.target

#/etc/systemd/system/redis-7002.service
[Unit]
Description=Redis 7002
After=network.target

[Service]
ExecStart=/usr/local/bin/redis-server /opt/redis/cluster/7002/redis.conf
ExecStop=/usr/local/bin/redis-cli -p 7002 shutdown
Restart=always
User=redis

[Install]
WantedBy=multi-user.target

# 重载服务
systemctl daemon-reload
systemctl start redis-7001
systemctl start redis-7002

systemctl status redis-7001
systemctl status redis-7002

systemctl restart redis-7001
systemctl restart redis-7002
```



# 8. 搭建mysql单节点

Mysql官网：https://downloads.mysql.com/archives/community/
```shell
# 下载8.1 ubuntu 的mysql
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.1.0-1ubuntu22.04_amd64.deb-bundle.tar
tar -xf mysql-server_8.1.0-1ubuntu22.04_amd64.deb-bundle.tar

# 安装包
apt install ./mysql-common_8.1.0-1ubuntu22.04_amd64.deb \
           ./mysql-community-client-plugins_8.1.0-1ubuntu22.04_amd64.deb \
           ./libmysqlclient22_8.1.0-1ubuntu22.04_amd64.deb \
           ./libmysqlclient-dev_8.1.0-1ubuntu22.04_amd64.deb \
           ./mysql-community-client-core_8.1.0-1ubuntu22.04_amd64.deb \
           ./mysql-community-client_8.1.0-1ubuntu22.04_amd64.deb \
           ./mysql-client_8.1.0-1ubuntu22.04_amd64.deb \
           ./mysql-community-server-core_8.1.0-1ubuntu22.04_amd64.deb \
           ./mysql-community-server_8.1.0-1ubuntu22.04_amd64.deb \
           ./mysql-server_8.1.0-1ubuntu22.04_amd64.deb

## 如果报错，修复下，它会自动安装
apt --fix-broken install

# 修改存储位置
systemctl stop mysql
## 修改存储位置
vim /etc/mysql/mysql.conf.d/mysqld.cnf
#datadir         = /opt/mysql/data
 
## 编辑 MySQL 的 AppArmor 配置文件
vim /etc/apparmor.d/usr.sbin.mysqld
#找到类似这几行：
#/var/lib/mysql/ r,
#/var/lib/mysql/** rwk,
#在其下方添加：
/opt/mysql/ r,
/opt/mysql/** rwk,

# 然后重启服务
systemctl reload apparmor

## 创建存储位置
mkdir -p /opt/mysql
chown -R mysql:mysql /opt/mysql
chmod 700  /opt/mysql

## 初始化
sudo -u mysql mysqld --initialize-insecure  --user=mysql  --basedir=/usr  --datadir=/opt/mysql/data 
## 重启mysql 并查看日志
systemctl start mysql
tail -f /var/log/mysql/error.log


# 修改密码
systemctl stop mysql
## 以 mysql 用户身份启动 mysql
sudo -u mysql mysqld --skip-grant-tables --skip-networking &
## 登录 MySQL
mysql -u root

## 修改密码
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'CyDB@2025';
-- ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'CyDB@2025';
CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'CyDB@2025';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;

## 停止临时进程
sudo -u mysql killall mysqld
## 启动mysql 并且开机自启
systemctl start mysql
systemctl enable mysql

```

# 9. 部署高可用PostgreSQL14集群
https://blog.csdn.net/yezonggang/article/details/146415411

## 基础依赖包安装
```shell
apt install -y postgresql-14
apt install -y consul
apt install -y patroni
apt install -y vip-manager
apt install -y dstat
apt install -y pgbouncer 

apt install -y haproxy
```

## consul配置

```shell
# 创建数据目录
mkdir -p /opt/consul
# 添加配置文件
vim /etc/consul.d/consul.hcl
# 赋权限
chown -R consul:consul /opt/consul
```

放入下面内容

```toml
datacenter = "dc1"
data_dir = "/opt/consul"
server = true
bootstrap_expect = 3
bind_addr = "172.172.254.104"  # 当前节点 IP
client_addr = "0.0.0.0"
retry_join = ["172.172.254.104","172.172.254.104","172.172.254.104"]
ui = true
```

启动并查看是否正常

```shell
# 直接启动
systemctl start consul
systemctl enable consul
 
# 查看consul节点情况
consul members

-----------------------------
root@cydb01:/opt# consul members
Node    Address               Status  Type    Build  Protocol  DC   Segment
cydb01  172.172.254.104:8301  alive   server  1.8.7  2         dc1  <all>
cydb02  172.172.254.105:8301  alive   server  1.8.7  2         dc1  <all>
cydb03  172.172.254.106:8301  alive   server  1.8.7  2         dc1  <all>
```

打开web页面查看信息，包括后续patroni在consul中注册的k/v信息；

http://<服务器ip地址>:8500

## Patroni配置

安装环境

```bash
# 停止pg
systemctl stop postgresql
systemctl disable postgresql
# 安装python
apt install -y python3-pip
# 安装 Python Consul 客户端
pip3 install python-consul
```

配置文件

```bash
vim /etc/patroni/config.yml
```

db01

```yaml
# 集群名称，所有节点的该配置项需保持一致，用于标识属于同一个 PostgreSQL 集群
scope: pg_cluster         
# 节点的唯一名称，不同节点应使用不同的名称，例如 pg-node1、pg-node2、pg-node3
name: cydb01
 
# REST API 相关配置，用于外部程序与 Patroni 进行交互
restapi:
  # REST API 监听的地址和端口，0.0.0.0 表示监听所有可用的网络接口
  listen: 0.0.0.0:8008    
  # 当前节点用于外部连接 REST API 的 IP 地址和端口
  connect_address: 172.172.254.104:8008  
 
# Consul 相关配置，Consul 作为分布式协调系统，用于存储集群状态信息
consul:
  # Consul 服务的地址和端口，这里使用本地默认端口
  host: 127.0.0.1:8500    
 
# 集群启动时的初始化配置
bootstrap:
  # 分布式协调系统（DCS）相关配置
  dcs:
    # Leader 锁的生存时间（Time To Live），单位为秒，超过该时间 Leader 锁将失效
    ttl: 30               
    # 状态检查的时间间隔，单位为秒，Patroni 会按照该间隔检查集群状态
    loop_wait: 10         
    # 操作重试的超时时间，单位为秒，如果操作在该时间内未完成则进行重试
    retry_timeout: 10     
    postgresql:
      # 允许节点在重新加入集群时自动使用 pg_rewind 工具修复数据差异
      use_pg_rewind: true  
      # 使用复制槽来确保流复制的可靠性，避免数据丢失
      use_slots: true      
      # PostgreSQL 数据库的参数配置
      parameters:
        # 数据库允许的最大连接数
        max_connections: 100
        # WAL（Write-Ahead Logging）日志级别，replica 表示支持流复制
        wal_level: replica
        # 启用热备模式，允许在备库上进行只读查询
        hot_standby: "on"
  # 初始化数据库时的配置参数
  initdb:                 
    # 数据库的字符编码设置为 UTF8
    - encoding: UTF8
    # 数据库的区域设置为 en_US.UTF-8
    - locale: en_US.UTF-8
  # PostgreSQL 的客户端访问控制规则，用于限制哪些客户端可以连接到数据库
  pg_hba:                 
    # 允许所有子网内的客户端使用 replicator 用户进行复制连接，使用 md5 加密认证
    - host replication replicator all md5  
    # 允许所有客户端使用任何用户连接到数据库，使用 md5 加密认证
    - host all all 0.0.0.0/0 md5                     
 
# PostgreSQL 数据库本身的配置
postgresql:
  # PostgreSQL 数据库监听的地址和端口，0.0.0.0 表示监听所有可用的网络接口
  listen: 0.0.0.0:5432
  # 当前节点用于外部连接 PostgreSQL 数据库的 IP 地址和端口
  connect_address: 172.172.254.104:5432  
  # PostgreSQL 数据库的数据文件存储目录
  data_dir: /opt/postgresql/14/data     
  # PostgreSQL 二进制可执行文件所在的目录
  bin_dir: /usr/lib/postgresql/14/bin  
  parameters:
    password_encryption: md5 
  # 数据库的认证配置，包括复制用户和超级用户的信息
  authentication:       
    replication:
      # 用于流复制的用户名
      username: replicator
      # 用于流复制的用户密码
      password: huanfaCypatroni
    superuser:
      # 数据库超级用户的用户名
      username: postgres
      # 数据库超级用户的密码
      password: huanfaCypatroni
```

db02

```yaml
# 集群名称，所有节点的该配置项需保持一致，用于标识属于同一个 PostgreSQL 集群
scope: pg_cluster         
# 节点的唯一名称，不同节点应使用不同的名称，例如 pg-node1、pg-node2、pg-node3
name: cydb02
 
# REST API 相关配置，用于外部程序与 Patroni 进行交互
restapi:
  # REST API 监听的地址和端口，0.0.0.0 表示监听所有可用的网络接口
  listen: 0.0.0.0:8008    
  # 当前节点用于外部连接 REST API 的 IP 地址和端口
  connect_address: 172.172.254.105:8008  
 
# Consul 相关配置，Consul 作为分布式协调系统，用于存储集群状态信息
consul:
  # Consul 服务的地址和端口，这里使用本地默认端口
  host: 127.0.0.1:8500    
 
# 集群启动时的初始化配置
bootstrap:
  # 分布式协调系统（DCS）相关配置
  dcs:
    # Leader 锁的生存时间（Time To Live），单位为秒，超过该时间 Leader 锁将失效
    ttl: 30               
    # 状态检查的时间间隔，单位为秒，Patroni 会按照该间隔检查集群状态
    loop_wait: 10         
    # 操作重试的超时时间，单位为秒，如果操作在该时间内未完成则进行重试
    retry_timeout: 10     
    postgresql:
      # 允许节点在重新加入集群时自动使用 pg_rewind 工具修复数据差异
      use_pg_rewind: true  
      # 使用复制槽来确保流复制的可靠性，避免数据丢失
      use_slots: true      
      # PostgreSQL 数据库的参数配置
      parameters:
        # 数据库允许的最大连接数
        max_connections: 100
        # WAL（Write-Ahead Logging）日志级别，replica 表示支持流复制
        wal_level: replica
        # 启用热备模式，允许在备库上进行只读查询
        hot_standby: "on"
  # 初始化数据库时的配置参数
  initdb:                 
    # 数据库的字符编码设置为 UTF8
    - encoding: UTF8
    # 数据库的区域设置为 en_US.UTF-8
    - locale: en_US.UTF-8
  # PostgreSQL 的客户端访问控制规则，用于限制哪些客户端可以连接到数据库
  pg_hba:                 
    # 允许所有子网内的客户端使用 replicator 用户进行复制连接，使用 md5 加密认证
    - host replication replicator all md5  
    # 允许所有客户端使用任何用户连接到数据库，使用 md5 加密认证
    - host all all 0.0.0.0/0 md5                     
 
# PostgreSQL 数据库本身的配置
postgresql:
  # PostgreSQL 数据库监听的地址和端口，0.0.0.0 表示监听所有可用的网络接口
  listen: 0.0.0.0:5432
  # 当前节点用于外部连接 PostgreSQL 数据库的 IP 地址和端口
  connect_address: 172.172.254.105:5432  
  # PostgreSQL 数据库的数据文件存储目录
  data_dir: /opt/postgresql/14/data     
  # PostgreSQL 二进制可执行文件所在的目录
  bin_dir: /usr/lib/postgresql/14/bin          
  # 数据库的认证配置，包括复制用户和超级用户的信息
  authentication:       
    replication:
      # 用于流复制的用户名
      username: replicator
      # 用于流复制的用户密码
      password: huanfaCypatroni
    superuser:
      # 数据库超级用户的用户名
      username: postgres
      # 数据库超级用户的密码
      password: huanfaCypatroni
```

db03

```yaml
# 集群名称，所有节点的该配置项需保持一致，用于标识属于同一个 PostgreSQL 集群
scope: pg_cluster         
# 节点的唯一名称，不同节点应使用不同的名称，例如 pg-node1、pg-node2、pg-node3
name: cydb03
 
# REST API 相关配置，用于外部程序与 Patroni 进行交互
restapi:
  # REST API 监听的地址和端口，0.0.0.0 表示监听所有可用的网络接口
  listen: 0.0.0.0:8008    
  # 当前节点用于外部连接 REST API 的 IP 地址和端口
  connect_address: 172.172.254.105:8008  
 
# Consul 相关配置，Consul 作为分布式协调系统，用于存储集群状态信息
consul:
  # Consul 服务的地址和端口，这里使用本地默认端口
  host: 127.0.0.1:8500    
 
# 集群启动时的初始化配置
bootstrap:
  # 分布式协调系统（DCS）相关配置
  dcs:
    # Leader 锁的生存时间（Time To Live），单位为秒，超过该时间 Leader 锁将失效
    ttl: 30               
    # 状态检查的时间间隔，单位为秒，Patroni 会按照该间隔检查集群状态
    loop_wait: 10         
    # 操作重试的超时时间，单位为秒，如果操作在该时间内未完成则进行重试
    retry_timeout: 10     
    postgresql:
      # 允许节点在重新加入集群时自动使用 pg_rewind 工具修复数据差异
      use_pg_rewind: true  
      # 使用复制槽来确保流复制的可靠性，避免数据丢失
      use_slots: true      
      # PostgreSQL 数据库的参数配置
      parameters:
        # 数据库允许的最大连接数
        max_connections: 100
        # WAL（Write-Ahead Logging）日志级别，replica 表示支持流复制
        wal_level: replica
        # 启用热备模式，允许在备库上进行只读查询
        hot_standby: "on"
  # 初始化数据库时的配置参数
  initdb:                 
    # 数据库的字符编码设置为 UTF8
    - encoding: UTF8
    # 数据库的区域设置为 en_US.UTF-8
    - locale: en_US.UTF-8
  # PostgreSQL 的客户端访问控制规则，用于限制哪些客户端可以连接到数据库
  pg_hba:                 
    # 允许所有子网内的客户端使用 replicator 用户进行复制连接，使用 md5 加密认证
    - host replication replicator all md5  
    # 允许所有客户端使用任何用户连接到数据库，使用 md5 加密认证
    - host all all 0.0.0.0/0 md5                     
 
# PostgreSQL 数据库本身的配置
postgresql:
  # PostgreSQL 数据库监听的地址和端口，0.0.0.0 表示监听所有可用的网络接口
  listen: 0.0.0.0:5432
  # 当前节点用于外部连接 PostgreSQL 数据库的 IP 地址和端口
  connect_address: 172.172.254.105:5432  
  # PostgreSQL 数据库的数据文件存储目录
  data_dir: /opt/postgresql/14/data     
  # PostgreSQL 二进制可执行文件所在的目录
  bin_dir: /usr/lib/postgresql/14/bin          
  # 数据库的认证配置，包括复制用户和超级用户的信息
  authentication:       
    replication:
      # 用于流复制的用户名
      username: replicator
      # 用于流复制的用户密码
      password: huanfaCypatroni
    superuser:
      # 数据库超级用户的用户名
      username: postgres
      # 数据库超级用户的密码
      password: huanfaCypatroni
```

赋权并测试运行

```shell
mkdir -p /opt/postgresql/14/data
chown -R postgres:postgres /opt/postgresql
chmod 700 /opt/postgresql

# 切换用户运行
su - postgres 
/usr/bin/patroni /etc/patroni/config.yml
```

命令

```shell
# 查看
patronictl -c /etc/patroni/config.yml list
# 使用 patronictl remove
patronictl -c /etc/patroni/config.yml remove pg-cluster
#pg-cluster
# 使用 patronictl 手动故障转移（推荐）
patronictl -c /etc/patroni/config.yml failover
```

运行

```shell
systemctl start patroni.service
systemctl status patroni.service
systemctl enable patroni.service
```

## vip-manager配置

patroni实现了集群的管理，并把leader信息保存在DSC/Consul中，那么就可以基于这个值来实现vip的管理，也就是consul中存的patroni的leader变动那么vip就跟着漂移，因此配置文件如下：

```bash
mv /etc/default/vip-manager /etc/default/vip-manager.bak
vim /etc/default/vip-manager
```

cydb01

```yaml
# The keys below are mandatory

VIP_IP="172.172.254.200"

# Netmask for IP address
VIP_MASK=24

# Just use the normal interface name of the primary network interface
VIP_IFACE="enp4s1"

# This must match scope from Patroni postgres.yml
VIP_KEY="/service/pg_cluster/leader"

# This value must match the value used in Patroni postgres.yml
VIP_HOST="cydb01"

# Specify the type of endpoint (etcd|consul)
VIP_TYPE="consul"

VIP_ENDPOINT="http://172.172.254.104:8500,http://172.172.254.105:8500,http://172.172.254.106:8500"


# The keys below are optional

#VIP_HOSTINGTYPE="basic"
#VIP_ETCD_USER
#VIP_ETCD_PASSWORD

# These keys are optional if VIP_TYPE="etcd" is chosen
#
#
#VIP_ETCD_CA_FILE="/etc/etcd/ca.cert.pem"
#VIP_ETCD_CERT_FILE="/etc/etcd/host.cert.pem"
#VIP_ETCD_KEY_FILE="/etc/etcd/host.key.pem"
```

cydb02

```yaml
# The keys below are mandatory

VIP_IP="172.172.254.200"

# Netmask for IP address
VIP_MASK=24

# Just use the normal interface name of the primary network interface
VIP_IFACE="enp4s1"

# This must match scope from Patroni postgres.yml
VIP_KEY="/service/pg_cluster/leader"

# This value must match the value used in Patroni postgres.yml
VIP_HOST="cydb02"

# Specify the type of endpoint (etcd|consul)
VIP_TYPE="consul"

VIP_ENDPOINT="http://172.172.254.104:8500,http://172.172.254.105:8500,http://172.172.254.106:8500"


# The keys below are optional

#VIP_HOSTINGTYPE="basic"
#VIP_ETCD_USER
#VIP_ETCD_PASSWORD

# These keys are optional if VIP_TYPE="etcd" is chosen
#
#
#VIP_ETCD_CA_FILE="/etc/etcd/ca.cert.pem"
#VIP_ETCD_CERT_FILE="/etc/etcd/host.cert.pem"
#VIP_ETCD_KEY_FILE="/etc/etcd/host.key.pem"
```

cydb03

```yaml
# The keys below are mandatory

VIP_IP="172.172.254.200"

# Netmask for IP address
VIP_MASK=24

# Just use the normal interface name of the primary network interface
VIP_IFACE="enp4s1"

# This must match scope from Patroni postgres.yml
VIP_KEY="/service/pg_cluster/leader"

# This value must match the value used in Patroni postgres.yml
VIP_HOST="cydb03"

# Specify the type of endpoint (etcd|consul)
VIP_TYPE="consul"

VIP_ENDPOINT="http://172.172.254.104:8500,http://172.172.254.105:8500,http://172.172.254.106:8500"


# The keys below are optional

#VIP_HOSTINGTYPE="basic"
#VIP_ETCD_USER
#VIP_ETCD_PASSWORD

# These keys are optional if VIP_TYPE="etcd" is chosen
#
#
#VIP_ETCD_CA_FILE="/etc/etcd/ca.cert.pem"
#VIP_ETCD_CERT_FILE="/etc/etcd/host.cert.pem"
#VIP_ETCD_KEY_FILE="/etc/etcd/host.key.pem"
```

重启服务

```bash
systemctl start vip-manager
systemctl status vip-manager
systemctl enable vip-manager
#查看运行日志
journalctl -u vip-manager -f
```

## pgbouncer配置

以上其实已经完成了三节点PostgreSQL的高可用，如果在此基础上还想做些高并发/负载均衡的优化以应对复杂场景，就需要在每个节点再补充部署pgbouncer和haproxy；

前者进行pg的连接池化（pg是基于多进程的，每个connection消耗1个进程，进程的创建和销毁开销很大），后者在pgbouncer的基础上实现负载均衡（也就是将请求负载到每个主机的连接池上），haproxy还可以将读请求分发到从节点，写请求分发到主节点来实现读写分离（端口级别）；

编辑

```bash
vim /etc/pgbouncer/pgbouncer.ini
```



```ini
# [databases] 部分用于定义 Pgbouncer 可以连接的数据库及其连接信息
[databases]
# 使用通配符 * 表示匹配所有数据库连接请求
# host 指定 PostgreSQL 数据库服务器的 IP 地址
# port 指定 PostgreSQL 数据库服务器监听的端口号
# dbname 指定要连接的数据库名称
# user 指定连接数据库使用的用户名
# dbname=postgres user=postgres
* = host=127.0.0.1 port=5432
 
# [pgbouncer] 部分用于配置 Pgbouncer 本身的行为和参数
[pgbouncer]
# 忽略客户端在启动时发送的 extra_float_digits 参数，避免该参数对连接池的影响
ignore_startup_parameters = extra_float_digits
# 指定 Pgbouncer 监听的地址，0.0.0.0 表示监听所有可用的网络接口
listen_addr = 0.0.0.0
# 指定 Pgbouncer 监听的端口号，应用程序将通过该端口连接到 Pgbouncer
listen_port = 6432
# 指定 Pgbouncer 的日志文件路径，用于记录运行过程中的日志信息
logfile = /var/log/pgbouncer/pgbouncer.log
# 指定 Pgbouncer 的进程 ID 文件路径，用于管理 Pgbouncer 进程
pidfile = /var/run/pgbouncer/pgbouncer.pid
# 指定认证类型为 md5，即使用 MD5 加密的密码进行认证
auth_type = md5
# 指定存储用户认证信息的文件路径，该文件包含用户名和对应的加密密码
auth_file = /etc/pgbouncer/userlist.txt
# 指定连接池模式为 transaction，即事务级连接池模式
# 在该模式下，一个连接在一个事务结束后会被释放回连接池供其他事务使用
pool_mode = session
# 指定 Pgbouncer 允许的最大客户端连接数
max_client_conn = 1000
# 指定每个数据库的默认连接池大小，即每个数据库可以同时使用的连接数量
default_pool_size = 100
# 指定具有管理员权限的用户列表，这些用户可以执行 Pgbouncer 的管理命令
admin_users = pgbouncer,postgres
# 指定具有统计信息查看权限的用户列表，这些用户可以查看 Pgbouncer 的统计信息
stats_users = pgbouncer,postgres
```

userlist.txt存储用户名和密码

```bash
vim /etc/pgbouncer/userlist.txt 
"postgres" "md5e0085d6b57778d1d376c9c870d7e68e7"
```

这里的密码需要校验下

```bash
# 查询默认的密码加密方式
SHOW password_encryption;
# 正确输出---------------------
md5
 
# 如果输出scram-sha-256
#需要修改默认的密码加密方式，因为是使用patroni

# 修改配置
patronictl -c /etc/patroni/config.yml edit-config
# 在 postgresql → parameters 中添加
postgresql:
  parameters:
    password_encryption: md5
# 然后再次查询试试
# 正确输出md5之后，进行重设用户密码
ALTER USER postgres WITH PASSWORD 'huanfaCypatroni';
SELECT usename, passwd FROM pg_shadow WHERE usename IN ('postgres');
#正确输出为   usename    |              passwd              
#--------------+----------------------------------
 huanfaCypatroni | md5e0085d6b57778d1d376c9c870d7e68e7
#更新 Pgbouncer 的 userlist.txt
echo '"huanfaCypatroni" "md5e0085d6b57778d1d376c9c870d7e68e7"' > /etc/pgbouncer/userlist.txt
systemctl restart pgbouncer
```



启动服务查看有无异常

```bash
systemctl start pgbouncer
systemctl status pgbouncer
systemctl enable pgbouncer
```

## haproxy配置

三个节点上都要部署haproxy以保持冗余，对业务侧仅提供vip上的haproxy地址（如vip:5436），haproxy的crash与拉起机制是操作系统来保证的，确保vip漂移后每个haproxy可连接，虽然这里可能是一个出问题的点，总不能再把haproxy的健康状态注册到DCS来再绑定一个vip吧。

按照上面描述每个pgbouncer都是vip上的5432端口的池化，因此haproxy可以均匀的将请求转发到每个节点的pgbouncer上

```bash
vim /etc/haproxy/haproxy.cfg 

[root@node1 ~]# cat /etc/haproxy/haproxy.cfg 
#=====================================================================
# Document: https://www.haproxy.org/download/2.5/doc/configuration.txt
# 此注释指向 HAProxy 2.5 版本的配置文档链接，方便用户查阅详细配置说明
#=====================================================================
global
    daemon           # 以守护进程模式运行 HAProxy，使其在后台持续运行
    user        haproxy  # 指定 HAProxy 运行时使用的用户
    group       haproxy  # 指定 HAProxy 运行时使用的用户组
    node        haproxy  # 为当前 HAProxy 节点设置一个名称，用于标识
    #pidfile     /var/run/haproxy.pid  # 注释掉的配置项，指定 HAProxy 进程 ID 文件的路径
    # chroot      /var/lib/haproxy          # if chrooted, change stats socket above  # 注释掉的配置项，将 HAProxy 进程限制在指定的根目录下运行，若启用需修改统计信息套接字配置
    # stats socket /var/run/haproxy.socket user haproxy group haproxy mode 600 level admin  # 注释掉的配置项，定义统计信息套接字的路径、所属用户、用户组、权限和管理级别
 
    # spread-checks 3                       # add randomness in check interval  # 注释掉的配置项，在健康检查间隔中添加随机性
    # quiet                                 # Do not display any message during startup  # 注释掉的配置项，启动时不显示任何消息
    maxconn     65535                       # maximum per-process number of concurrent connections  # 每个进程允许的最大并发连接数
 
#---------------------------------------------------------------------
# default settings
# 以下是 HAProxy 的默认配置部分
#---------------------------------------------------------------------
defaults
    # log                global  # 注释掉的配置项，使用全局日志配置
 
    mode               tcp  # 设置默认的工作模式为 TCP 模式，适用于处理 TCP 流量
    retries            3            # max retry connect to upstream  # 连接到上游服务器的最大重试次数
    timeout queue      3s           # maximum time to wait in the queue for a connection slot to be free  # 客户端在队列中等待连接槽空闲的最大时间
    timeout connect    3s           # maximum time to wait for a connection attempt to a server to succeed  # 连接到服务器的最大等待时间
    timeout client     24h           # client connection timeout  # 客户端连接的超时时间
    timeout server     24h           # server connection timeout  # 服务器连接的超时时间
    timeout check      3s           # health check timeout  # 健康检查的超时时间
 
#---------------------------------------------------------------------
# default admin users
# 以下是默认的管理员用户配置部分
#---------------------------------------------------------------------
userlist STATS_USERS  # 定义一个用户列表，名为 STATS_USERS
        group admin users admin  # 在 STATS_USERS 用户列表中定义一个名为 admin 的用户组，包含用户 admin
        user stats  insecure-password pigsty  # 在 STATS_USERS 用户列表中定义一个名为 stats 的用户，使用明文密码 pigsty
        user admin  insecure-password pigsty  # 在 STATS_USERS 用户列表中定义一个名为 admin 的用户，使用明文密码 pigsty
 
#=====================================================================
# Service Definition
# 以下是服务定义部分
#=====================================================================
 listen default  # 定义一个名为 default 的监听部分
     bind *:5436  # 绑定到所有可用的网络接口，并监听 5436 端口
     mode tcp  # 设置该监听部分的工作模式为 TCP 模式
     maxconn 3000  # 该监听部分允许的最大并发连接数
     balance roundrobin  # 设置负载均衡算法为轮询，即依次将请求分发给后端服务器
     option httpchk  # 启用 HTTP 健康检查
     option http-keep-alive  # 启用 HTTP 长连接，保持客户端和服务器之间的连接
     http-check expect status 200  # 期望健康检查返回的 HTTP 状态码为 200
     default-server inter 3s fastinter 1s downinter 5s rise 3 fall 3 on-marked-down shutdown-sessions slowstart 30s maxconn 3000 maxqueue 128 weight 100  # 后端服务器的默认配置：健康检查间隔为 3 秒，快速检查间隔为 1 秒，服务器标记为故障后的检查间隔为 5 秒，连续 3 次检查成功则认为服务器恢复正常，连续 3 次检查失败则认为服务器故障，服务器被标记为故障时关闭现有会话，服务器启动时的慢速启动时间为 30 秒，每个服务器允许的最大并发连接数为 3000，最大队列长度为 128，服务器权重为 100
     server cydb01 172.172.254.104:6432 check port 8008 weight 100  # 定义一个名为 node1 的后端服务器，地址为 100.3.254.210:6432，对其 8008 端口进行健康检查，服务器权重为 100
     server cydb02 172.172.254.105:6432 check port 8008 weight 100  # 定义一个名为 node2 的后端服务器，地址为 100.3.254.211:6432，对其 8008 端口进行健康检查，服务器权重为 100
     server cydb03 172.172.254.106:6432 check port 8008 weight 100  # 定义一个名为 node3 的后端服务器，地址为 100.3.254.212:6432，对其 8008 端口进行健康检查，服务器权重为 100
 
#启动
systemctl start haproxy.service 
systemctl status haproxy.service
```

端口整理一下

| 端口   | 组件               | 用途                 | 备注  |
| ---- | ---------------- | ------------------ | --- |
| 8301 | Consul 通信端口      | 每个节点的Consul内部通信端口  |     |
| 8500 | Consul WEB UI    | 每个节点的Consul网页端端口   |     |
| 8008 | Patroni REST API | 每个节点的Patroni API端口 |     |
| 5432 | PostgreSQL 端口    | 每个节点的pg服务端口        |     |
| 6432 | Pgbouncer 端口     | 每个节点的pg连接池端口       |     |
| 5436 | Haproxy 端口       | 高可用端口              |     |

> 最终客户端连接地址是：172.172.254.104:5436
>
> 链路如下
>
> 客户端
>     ↓ (连接 Haproxy:5436)
> Haproxy (VIP:172.172.254.200)
>     ↓ (轮询转发到三节点 PgBouncer 的 6432)
> 节点1/2/3:
>
> PgBouncer (6432)
> ↓ (通过 VIP 连接)
>
> vip-manager 管理的 PostgreSQL 主节点 (VIP:172.172.254.104:5432)
>
> Patroni
>
> Consul
>
> PostgreSQL
>
> ```bash
> 客户端
>     ↓ (连接 Haproxy:5436)
> +-------------------+
> |   PgBouncer       | ← 监听 VIP:172.172.254.200:6432
> +-------------------+
>     ↓ (连接到主节点)
> +-------------------+
> |   PostgreSQL      | ← 由 vip-manager 管理 VIP
> +-------------------+
>     ↑↓ (复制流)
> +-------------------+
> |   Patroni         | ← 管理集群状态
> +-------------------+
>     ↑↓ (注册/发现)
> +-------------------+
> |   Consul          | ← DCS 存储
> +-------------------+
> ```
>
> 
>


