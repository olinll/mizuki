---
title: Pve安装黑群晖
description: ' '

published: 2025-10-10
date: 2025-10-10
tags:
  - ProxmoxVE
category: 教程
draft: false
pinned: false
# image: './img/defalut-cover.png'
---


rr镜像：https://github.com/RROrg/rr/releases


创建引导盘：
```shell
qm importdisk 103 /var/lib/vz/template/iso/rr.img local
```


> **1、群晖特色型号：**  
>免费带8路摄像头型号：DVA3221、DVA3219、DVA1622  
>自带英伟达独显驱动型号：DVA3221、DVA3219、DVA1622  
>CPU核心＞24推荐：FS6400、HD6500  
>CPU核心＜24推荐：**DS3622xs+**、RS1619xs+  
>11-14代CPU推荐：**SA6400**  
>**(实在不知如何选，可安装热门型号：**DS3622sx+、DS1019+、DS918+、SA6400**）**
>
>**2、集显使用：**  
>**4-8、9-10 代 intel iGPU：**  
>nvme SSD 缓存数量≤2：**DS1019+***/DS918+  
>nvme SSD 缓存数量＞2：无可用型号
>
>**11、12-14代 intel iGPU：**  
>nvme SSD 缓存数量无限制：**SA6400**
>
>**3、独显使用：**  
>nvme SSD 缓存数量≤2：DS1019+、DS1819+、**SA6400**  
>nvme SSD 缓存数量无限制：**SA6400**、DS1819+、
>
>**4、不使用硬解：**  
>完全支持 HBA 卡：RS4021xs+/**DS3622xs+**
>
