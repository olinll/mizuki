---
title: Pve8开启核显直通
description: ''

published: 2025-10-09
date: 2025-10-09
tags:
  - ProxmoxVE
category: 教程
draft: false
pinned: false
# image: './img/defalut-cover.png'
---


pve\_source工具

```shell
wget -q -O /root/pve_source.tar.gz 'https://bbs.x86pi.cn/file/topic/2023-11-28/file/01ac88d7d2b840cb88c15cb5e19d4305b2.gz' && tar zxvf /root/pve_source.tar.gz && /root/./pve_source
```

# 正文开始

##f 忽略 dmesg错误（可选）

要忽略 dmesg 输出中的一些烦人的错误， 请运行以下命令(# 这一步对于直通来说不是必需的，但有助于保持干净。)

```shell
nano /etc/modprobe.d/kvm.conf
options kvm ignore_msrs=Y report_ignored_msrs=0
# 按 Ctrl + X，然后按 Y + Enter 保存更改。
```



## 启动内核IOMMU支持

IOMMU（Input-Output Memory Management Unit）是一种硬件功能，用于管理设备对系统内存的访问。启用 IOMMU 后，可以在虚拟机中直接访问物理设备，并允许虚拟机独立于主机操作系统运行

```shell
nano /etc/default/grub # 将以下行粘贴到其中，并在旧标签前面添加一个注释标签#,以下为常用的一些写法。
# 对于 Intel CPU
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt initcall_blacklist=sysfb_init pcie_acs_override=downstream,multifunction pci=nommconf"
# 对于 AMD CPU
GRUB_CMDLINE_LINUX_DEFAULT="quiet iommu=pt initcall_blacklist=sysfb_init pcie_acs_override=downstream,multifunction pci=nommconf"
```

其他说明



```shell
GRUB_CMDLINE_LINUX_DEFAULT="quiet initcall_blacklist=sysfb_init"
注意,对于 AMD CPU：initcall_blacklist=sysfb_init 屏蔽掉pve7.2以上的一个bug，方便启动时候就屏蔽核显等设备驱动。pve8的grub里面不需要加入amd_iommu=on pcie_acs_override=downstream,multifunction这些参数，一般默认就开启了，如果后面直通不成功，在加上这些参数。
# 其他的一些写法(如果是AMD处理器,将intel改为amd)
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt i915.enable_gvt=1 video=efifb:off" # 这是GVT模式，也就是共享模式，少部分cpu支持，但体验很好
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt video=efifb:off" # 这是独占模式，都支持，但显示器没有pve的控制台输出，也只能直通个一个虚拟机
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt pcie_acs_override=downstream,multifunction"
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on initcall_blacklist=sysfb_init pcie_acs_override=downstream,multifunction"
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on" #本期教程我使用的就是这个
# 参数释义
1.iommu=pt：启用 Intel VT-d 或 AMD-Vi 的 IOMMU。这是一种硬件功能，用于管理设备对系统内存的访问。在虚拟化环境中，启用 IOMMU 后，可以将物理设备直通到虚拟机中，以便虚拟机可以直接访问硬件设备。“iommu=pt”不是必须的，PT模式只在必要的时候开启设备的IOMMU转换，可以提高未直通设备PCIe的性能，建议添加。
2.initcall_blacklist=sysfb_init：禁用 sysfb_init 内核初始化函数。这个函数通常用于在内核启动过程中初始化系统帧缓冲。在使用 GPU 直通的情况下，这个函数可能会干扰直通操作，因此需要禁用它。
3.i915.enable_gvt=1：启用 Intel GVT-g 虚拟 GPU 技术。这个选项用于创建一个虚拟的 Intel GPU 设备，以便多个虚拟机可以共享物理 GPU 设备。启用 GVT-g 需要在支持虚拟 GPU 的 Intel CPU 和主板上运行，并且需要正确配置内核和虚拟机。想开启GVT-g的就添加这条，显卡直通的就不要添加了。
4.initcall_blacklist=sysfb_init：屏蔽掉pve7.2以上的一个bug，方便启动时候就屏蔽核显等设备驱动；
5.pcie_acs_override=downstream,multifunction：便于iommu每个设备单独分组，以免直通导致物理机卡死等问题
6.pci=nommconf：意思是禁用pci配置空间的内存映射,所有的 PCI 设备都有一个描述该设备的区域（您可以看到lspci -vv），访问该区域的最初方法是通过 I/O 端口，而 PCIe 允许将此空间映射到内存以便更简单地访问。
```

## 允许不安全中断（可选）

对于某些平台，可能需要允许不安全中断。运行以下命令

```shell
nano /etc/modprobe.d/iommu_unsafe_interrupts.conf # 添加以下行；请注意，此选项可能会使您的系统不稳定。
options vfio_iommu_type1 allow_unsafe_interrupts=1
```

## 启用必要的内核模块，运行以下命令

```shell
nano /etc/modules # 添加以下行；
vfio
vfio_iommu_type1
vfio_pci
# vfio_virqfd # 若内核在6.2版本以下需要打开注释
```

## 将驱动程序模块列入黑名单（可选）

将驱动程序模块列入黑名单，以使虚拟机能够完全访问显卡等。运行以下命令

```shell
执行命令：nano /etc/modprobe.d/pve-blacklist.conf
# 在里面加入
blacklist nvidiafb
blacklist nouveau
blacklist nvidia
blacklist snd_hda_codec_hdmi
blacklist snd_hda_intel
blacklist snd_hda_codec
blacklist snd_hda_core
blacklist radeon
blacklist amdgpu
blacklist i915
options vfio_iommu_type1 allow_unsafe_interrupts=1
# 如果有重复项,记得删除,解释：屏蔽三大显卡驱动，屏蔽hdmi声音驱动；options，options vfio_iommu_type1 allow_unsafe_interrupts=1允许不安全的设备中断
```

## 将主机的 PCI 设备 ID 绑定到vifo模块

查看显卡及其声卡

```bash
lspci -D -nn | grep VGA
lspci -D -nn | grep Audio
```

Intel的核显和声卡ID通常为：0000:00:02.0和0000:00:1f.3

```shell
nano /etc/modprobe.d/vfio.conf
options vfio-pci ids=	# 提取到的id,例如		8086:3e96,8086:a348
```

## 重载系统配置

```bash
update-grub		#刷新grub配置
update-initramfs -u -k all		#刷新initramfs
proxmox-boot-tool refresh		#使用PVE8版本新增的工具刷新配置。
reboot		#重启pve
dmesg | grep -e DMAR -e IOMMU -e AMD-Vi		#查询系统状态是否确实开启了IOMMU
```

## 虚拟机配置

创建虚拟机

所选的虚拟机类型必须为i440fx 7.2版本或者最新以上机型（不能选q35！）

固件类型选择ovmf UEFI

CPU类型选HOST，否则可能会出现装不上驱动

**直通虚拟机环境设置**

```shell
nano /etc/pve/qemu-server/100.conf

#对于Intel
args: -set device.hostpci0.addr=02.0 -set device.hostpci0.x-igd-gms=1 -set device.hostpci0.x-igd-opregion=on
hostpci0: 0000:00:02.0,legacy-igd=1,romfile=vbios_intel_uefi.rom
#hostpci1: 0000:00:1f.3 # 可选
```

```
apt-get install qemu-guest-agent
```

