---
title: Docker操作命令篇
description: ' '

published: 2026-01-25
date: 2026-01-25
tags: ['Docker']
category: '记录'
draft: false
pinned: false
# image: './img/defalut-cover.png'
---

# systemctl服务命令

## 启动docker

```bash
systemctl start docker
```

## 关闭docker

```bash
systemctl stop docker
```

## 查看docker状态

```bash
systemctl status docker
```

## 开机自启动

```bash
systemctl enable docker
```

# Docker run

docker run 命令用于创建并启动一个新的容器。

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

常用参数说明：

-  **`-d`**: 后台运行容器并返回容器 ID。
-  **`-it`**: 交互式运行容器，分配一个伪终端。
-  **`--name`**: 给容器指定一个名称。
-  **`-p`**: 端口映射，格式为 `host_port:container_port`。
-  **`-v`**: 挂载卷，格式为 `host_dir:container_dir`。
-  **`--rm`**: 容器停止后自动删除容器。
-  **`--env`** **或**  **`-e`**: 设置环境变量。
-  **`--network`**: 指定容器的网络模式。
-  **`--restart`**: 容器的重启策略（如 `no`、`on-failure`、`always`、`unless-stopped`）。
-  **`-u`**: 指定用户。

# Docker start/stop/restart

**docker start** 命令用于启动一个或多个已经创建的容器。

**docker stop** 命令用于停止一个运行中的容器。

**docker restart** 命令用于重启容器。

```bash
docker start [OPTIONS] CONTAINER [CONTAINER...]
```

**参数**

-  **`-a`**: 附加到容器的标准输入输出流。
-  **`-i`**: 附加并保持标准输入打开。


```bash
docker stop [OPTIONS] CONTAINER [CONTAINER...]
docker restart [OPTIONS] CONTAINER [CONTAINER...]
```

**参数**

 **-t, --time**: 停止容器之前等待的秒数，默认是 10 秒。

# Docker exec

`docker exec` 命令用于在运行中的容器内执行一个新的命令。这对于调试、运行附加的进程或在容器内部进行管理操作非常有用。

```bash
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

## 常用参数

-  **`-d, --detach`**: 在后台运行命令。
-  **`--detach-keys`**: 覆盖分离容器的键序列。
-  **`-e, --env`**: 设置环境变量。
-  **`--env-file`**: 从文件中读取环境变量。
-  **`-i, --interactive`**: 保持标准输入打开。
-  **`--privileged`**: 给这个命令额外的权限。
-  **`--user, -u`**: 以指定用户的身份运行命令。
-  **`--workdir, -w`**: 指定命令的工作目录。
-  **`-t, --tty`**: 分配一个伪终端。


在运行中的 my\_container 容器内执行 ls /app 命令，列出 /app 目录的内容。

以交互模式运行命令：

```bash
docker exec -it my_container /bin/bash
```


# Docker ps

docker ps 命令用于列出 Docker 容器。

默认情况下，docker ps 命令只显示运行中的容器，但也可以通过指定选项来显示所有容器，包括停止的容器。

```bash
docker ps [OPTIONS]
```

OPTIONS说明：

-  **`-a, --all`**: 显示所有容器，包括停止的容器。
-  **`-q, --quiet`**: 只显示容器 ID。
-  **`-l, --latest`**: 显示最近创建的一个容器，包括所有状态。
-  **`-n`**: 显示最近创建的 n 个容器，包括所有状态。
-  **`--no-trunc`**: 不截断输出。
-  **`-s, --size`**: 显示容器的大小。
-  **`--filter, -f`**: 根据条件过滤显示的容器。
-  **`--format`**: 格式化输出。

## 实例

**1、列出所有在运行的容器信息**

默认情况下，docker ps 只显示正在运行的容器。

```bash
docker ps
CONTAINER ID   IMAGE          COMMAND                ...  PORTS                    NAMES
09b93464c2f7   nginx:latest   "nginx -g 'daemon off" ...  80/tcp, 443/tcp          myrunoob
96f7f14e99ab   mysql:5.6      "docker-entrypoint.sh" ...  0.0.0.0:3306->3306/tcp   mymysql

```

输出详情介绍：

**CONTAINER ID:**  容器 ID。

**IMAGE:**  使用的镜像。

**COMMAND:**  启动容器时运行的命令。

**CREATED:**  容器的创建时间。

**STATUS:**  容器状态。

状态有7种：

- created（已创建）
- restarting（重启中）
- running（运行中）
- removing（迁移中）
- paused（暂停）
- exited（停止）
- dead（死亡）

**PORTS:**  容器的端口信息和使用的连接类型（tcp\\udp）。

**NAMES:**  自动分配的容器名称。


# Docker logs

`docker logs` 命令用于获取和查看容器的日志输出。

`docker logs` 命令非常有用，可以帮助用户调试和监控运行中的容器。

```bash
docker logs [OPTIONS] CONTAINER
```

常用选项：

-  **`-f, --follow`**: 跟随日志输出（类似于 `tail -f`）。
-  **`--since`**: 从指定时间开始显示日志。
-  **`-t, --timestamps`**: 显示日志时间戳。
-  **`--tail`**: 仅显示日志的最后部分，例如 `--tail 10` 显示最后 10 行。
-  **`--details`**: 显示提供给日志的额外详细信息。
-  **`--until`**: 显示直到指定时间的日志。

## 实例

**显示容器日志**

```bash
docker logs my_container
```

显示名为 my\_container 的容器的所有日志，输出内容：

```bash
hello world
hello world
hello world
...
```

**跟随日志输出**

```bash
docker logs -f my_container
```

持续显示 my\_container 的日志输出，输出内容：

```bash
hello world
hello world
hello world
...
```

**显示带时间戳的日志**

```bash
docker logs -t my_container
```

显示包含时间戳的日志，输出内容：

```bash
2023-07-22T15:04:05.123456789Z hello world
2023-07-22T15:04:06.123456789Z hello world
2023-07-22T15:04:07.123456789Z hello world
...

**从指定时间开始显示日志**

```bash

docker logs --since="2023-07-22T15:00:00" my_container
```

显示 2023-07-22T15:00:00 之后的日志。

**显示最后 10 行日志**

```bash
docker logs --tail 10 my_container
```

显示 my\_container 的最后 10 行日志。

**显示额外详细信息的日志**

```bash
docker logs --details my_container
```

显示 my\_container 的日志，并包含额外详细信息。

**显示直到指定时间的日志**

```bash
docker logs --until="2023-07-22T16:00:00" my_container
```

显示 2023-07-22T16:00:00 之前的日志。




# Docker images

`docker images` 命令用于列出本地的 Docker 镜像。

通过 `docker images` 命令，用户可以查看所有已下载或构建的 Docker 镜像的详细信息，如仓库名称、标签、镜像 ID、创建时间和大小。

```bash
docker images [OPTIONS] [REPOSITORY[:TAG]]
```

OPTIONS 说明：

-  **`-a, --all`**: 显示所有镜像（包括中间层镜像）。
-  **`--digests`**: 显示镜像的摘要信息。
-  **`-f, --filter`**: 过滤输出，基于提供的条件。
-  **`--format`**: 使用 Go 模板格式化输出。
-  **`--no-trunc`**: 显示完整的镜像 ID。
-  **`-q, --quiet`**: 只显示镜像 ID

列出所有本地镜像:

```bash
docker images
```

列出带有摘要信息的镜像:

```bash
docker images --digests
```

列出所有镜像（包括中间层镜像）:

```bash
docker images --all
```

使用过滤条件列出镜像:

```bash
docker images --filter "dangling=true"
```

只显示镜像 ID:

```bash
docker images --quiet
```

使用自定义格式输出:

```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}"
```



# Docker pull

```bash
docker pull  [OPTIONS] NAME[:TAG|@DIGEST]
```

> **NAME**: 镜像名称，通常包含注册表地址（如 *docker.io/library/ubuntu*）。
>
> **TAG**（可选）: 镜像标签，默认为 *latest*。
>
> **DIGEST**（可选）: 镜像的 SHA256 摘要。

**常用选项**

>  ***-a, --all-tags***: 下载指定镜像的所有标签。
>
>  ***--disable-content-trust***: 跳过镜像签名验证。
>
>  ***--platform***: 如果服务器支持多平台，请设置平台。
>
>  ***-q, --quiet***: 抑制详细输出。

## 错误处理和注意事项

在使用 `docker pull`时，可能会遇到一些常见问题：

- 网络问题：如果下载速度慢或无法连接，可以尝试使用加速器或检查网络设置。
- 权限问题：当拉取私有镜像时，需要先登录镜像仓库。

```bash
docker login myregistry.com
```

# Docker tag

`docker tag` 命令用于创建本地镜像的别名（tag），通过为镜像打标签，可以使用更容易记忆的名字或版本号来标识和管理镜像。

```bash
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```

> **`SOURCE_IMAGE[:TAG]`** : 源镜像名称和标签，标签默认为 `latest`。
>
> **`TARGET_IMAGE[:TAG]`** : 目标镜像名称和标签，标签默认为 `latest`。


# Docker push

```bash
docker push [OPTIONS] NAME[:TAG]
```

> **`NAME`**: 镜像名称，通常包含注册表地址（如 `docker.io/myrepo/myimage`）。
>
> **`TAG`**（可选）: 镜像标签，默认为 `latest`。

OPTIONS 说明：

-  **--disable-content-trust :** 忽略镜像的校验,默认开启

# Docker save

`docker save` 命令用于将一个或多个 Docker 镜像保存到一个 tar 归档文件中，以便在其他环境中分发或备份。

```bash
docker save [OPTIONS] IMAGE [IMAGE...]
```

> **`IMAGE`**: 要保存的一个或多个镜像名称或 ID。

OPTIONS 说明：

-  **`-o, --output`**: 指定输出文件的路径。


## 示例

1、保存单个镜像到文件

```bash
# 这将 myimage:latest 镜像保存为 myimage.tar 文件。
docker save -o myimage.tar myimage:latest
```

# Docker load

`docker load` 命令用于从由 `docker save` 命令生成的 tar 文件中加载 Docker 镜像。它可以将存档中的镜像和所有层加载到 Docker 中，使其可以在新环境中使用。

```bash
docker load [OPTIONS]
```

OPTIONS 说明：

-  **`-i, --input`**: 指定输入文件的路径。
-  **`-q, --quiet`**: 安静模式，减少输出信息。

## 示例

1、从文件加载镜像

```bash
# 这将从 myimage.tar 文件中加载镜像。
docker load -i myimage.tar
```