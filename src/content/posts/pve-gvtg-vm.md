---
title: 开启核显GVT-g直通给虚拟机
description: ' '
published: 2025-10-09
date: 2025-10-09
tags:
  - ProxmoxVE
category: 教程
draft: false
pinned: false
---


GVT-g（Intel Graphics Virtualization Technology - g）是英特尔提供的一种轻量级GPU虚拟化技术，允许在多个虚拟机之间共享主机的集成显卡（iGPU），同时为每个虚拟机提供接近原生的图形性能。与传统的PCIe直通不同，GVT-g无需独占整个GPU，而是通过硬件辅助的虚拟化机制实现多VM共享，适用于需要图形加速但又希望保留主机显示输出的场景。

支持Intel Broadwell (5代) 到 Comet Lake (10代) 不支持Ice Lake (10代移动处理器)

```shell
lspci  -vs 00:02.0



# 下面是支持的显存大小
i915-GVTg_V5_1  # Video memory: <512MB, 2048MB>, resolution: up to 1920x1200
i915-GVTg_V5_2  # Video memory: <256MB, 1024MB>, resolution: up to 1920x1200
i915-GVTg_V5_4  # Video memory: <128MB, 512MB>, resolution: up to 1920x1200
i915-GVTg_V5_8  # Video memory: <64MB, 384MB>, resolution: up to 1024x768
```
# 开始配置

## 添加直通代码
```shell
nano /etc/default/grub

# 添加如下代码
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt i915.enable_gvt=1"

```

## 启用必要的内核模块，运行以下命令
```shell
nano /etc/modules # 添加以下行；


vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd
kvmgt
```

## 重载系统配置

```bash
update-grub		#刷新grub配置
update-initramfs -u -k all		#刷新initramfs
proxmox-boot-tool refresh		#使用PVE8版本新增的工具刷新配置。
reboot		#重启pve
dmesg | grep -e DMAR -e IOMMU -e AMD-Vi		#查询系统状态是否确实开启了IOMMU
```

## 查看支持的类型
```shell

root@pve:~# ls /sys/bus/pci/devices/0000:00:02.0/mdev_supported_types/

i915-GVTg_V5_4 i915-GVTg_V5_8

```

## 创建虚拟机

机型选择q35、uefi启动、

直接选择显卡即可

## 集显查询工具  

为了了解集显的实时使用情况, 还需要在pve系统内安装intel_gpu_top工具

```shell
apt install intel-gpu-tools
```

# Ubunut显卡跑分

## 使用glmark2进行GPU基准测试

glmark2_是一个基于OpenGL的GPU性能测试工具，支持多种图形渲染场景。它可以通过以下命令安装和运行：

```shell
sudo apt install glmark2

glmark2

#运行后，工具会执行一系列测试并输出帧率（FPS）和最终得分
```

## 使用glxgears进行简单测试

glxgears_是一个基础的OpenGL测试工具，适合快速检查GPU的基本性能。安装和运行命令如下：

```shell
sudo apt install mesa-utils

glxgears

#运行后会显示旋转齿轮，并定期打印帧率。
```



## 安装计算和媒体软件包

这些软件用于 OpenCL、硬件加速编解码、媒体 SDK 等；部分视频软件需要用到

```bash
sudo apt install -y \
  intel-opencl-icd intel-level-zero-gpu level-zero \
  intel-media-va-driver-non-free libmfx1 libmfxgen1 libvpl2 \
  libigdgmm12 vainfo hwinfo clinfo
```