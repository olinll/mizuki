---
title: 同一个IOMMU Group直通不同虚拟机
description: ' '

published: 2025-10-18
date: 2025-10-18
tags:
  - ProxmoxVE
category: 教程
draft: false
pinned: false
# image: './img/defalut-cover.png'
---


```shell
for d in /sys/kernel/iommu_groups/*/devices/*; do
    n=${d#*/iommu_groups/*}
    n=${n%%/*}
    printf 'IOMMU Group %s ' "$n"
    lspci -nns "${d##*/}"
done
```

```shell

IOMMU Group 0 00:02.0 VGA compatible controller [0300]: Intel Corporation CoffeeLake-S GT2 [UHD Graphics P630] [8086:3e96]
IOMMU Group 10 00:1b.4 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #21 [8086:a32c] (rev f0)
IOMMU Group 11 00:1c.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #1 [8086:a338] (rev f0)
IOMMU Group 12 00:1c.2 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #3 [8086:a33a] (rev f0)
IOMMU Group 13 00:1c.5 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #6 [8086:a33d] (rev f0)
IOMMU Group 14 00:1c.6 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #7 [8086:a33e] (rev f0)
IOMMU Group 15 00:1c.7 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #8 [8086:a33f] (rev f0)
IOMMU Group 16 00:1d.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #9 [8086:a330] (rev f0)
IOMMU Group 17 00:1e.0 Communication controller [0780]: Intel Corporation Cannon Lake PCH Serial IO UART Host Controller [8086:a328] (rev 10)
IOMMU Group 18 00:1f.0 ISA bridge [0601]: Intel Corporation Cannon Point-LP LPC Controller [8086:a309] (rev 10)
IOMMU Group 18 00:1f.3 Audio device [0403]: Intel Corporation Cannon Lake PCH cAVS [8086:a348] (rev 10)
IOMMU Group 18 00:1f.4 SMBus [0c05]: Intel Corporation Cannon Lake PCH SMBus Controller [8086:a323] (rev 10)
IOMMU Group 18 00:1f.5 Serial bus controller [0c80]: Intel Corporation Cannon Lake PCH SPI Controller [8086:a324] (rev 10)
IOMMU Group 18 00:1f.6 Ethernet controller [0200]: Intel Corporation Ethernet Connection (7) I219-LM [8086:15bb] (rev 10)
IOMMU Group 19 04:00.0 Ethernet controller [0200]: Mellanox Technologies MT27500 Family [ConnectX-3] [15b3:1003]
IOMMU Group 1 00:00.0 Host bridge [0600]: Intel Corporation 8th Gen Core Processor Host Bridge/DRAM Registers [8086:3ec6] (rev 07)
IOMMU Group 20 06:00.0 Non-Volatile memory controller [0108]: Sandisk Corp WD Blue SN570 NVMe SSD 1TB [15b7:501a]
IOMMU Group 21 07:00.0 Ethernet controller [0200]: Intel Corporation I210 Gigabit Network Connection [8086:1533] (rev 03)
IOMMU Group 22 08:00.0 PCI bridge [0604]: ASPEED Technology, Inc. AST1150 PCI-to-PCI Bridge [1a03:1150] (rev 04)
IOMMU Group 22 09:00.0 VGA compatible controller [0300]: ASPEED Technology, Inc. ASPEED Graphics Family [1a03:2000] (rev 41)
IOMMU Group 23 0a:00.0 PCI bridge [0604]: Tundra Semiconductor Corp. Device [10e3:8113] (rev 01)
IOMMU Group 24 0c:00.0 Non-Volatile memory controller [0108]: Kingston Technology Company, Inc. NV2 NVMe SSD [SM2267XT] (DRAM-less) [2646:5017] (rev 03)
IOMMU Group 25 lspci: -s: Invalid slot number
IOMMU Group 2 00:01.0 PCI bridge [0604]: Intel Corporation 6th-10th Gen Core Processor PCIe Controller (x16) [8086:1901] (rev 07)
IOMMU Group 2 00:01.1 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x8) [8086:1905] (rev 07)
IOMMU Group 2 01:00.0 Serial Attached SCSI controller [0107]: Broadcom / LSI SAS2308 PCI-Express Fusion-MPT SAS-2 [1000:0087] (rev 05)
IOMMU Group 2 02:00.0 Serial Attached SCSI controller [0107]: Broadcom / LSI SAS3008 PCI-Express Fusion-MPT SAS-3 [1000:0097] (rev 02)
IOMMU Group 3 00:08.0 System peripheral [0880]: Intel Corporation Xeon E3-1200 v5/v6 / E3-1500 v5 / 6th/7th/8th Gen Core Processor Gaussian Mixture Model [8086:1911]
IOMMU Group 4 00:12.0 Signal processing controller [1180]: Intel Corporation Cannon Lake PCH Thermal Controller [8086:a379] (rev 10)
IOMMU Group 5 00:14.0 USB controller [0c03]: Intel Corporation Cannon Lake PCH USB 3.1 xHCI Host Controller [8086:a36d] (rev 10)
IOMMU Group 5 00:14.2 RAM memory [0500]: Intel Corporation Cannon Lake PCH Shared SRAM [8086:a36f] (rev 10)
IOMMU Group 6 00:15.0 Serial bus controller [0c80]: Intel Corporation Cannon Lake PCH Serial IO I2C Controller #0 [8086:a368] (rev 10)
IOMMU Group 6 00:15.1 Serial bus controller [0c80]: Intel Corporation Cannon Lake PCH Serial IO I2C Controller #1 [8086:a369] (rev 10)
IOMMU Group 7 00:16.0 Communication controller [0780]: Intel Corporation Cannon Lake PCH HECI Controller [8086:a360] (rev 10)
IOMMU Group 8 00:17.0 SATA controller [0106]: Intel Corporation Cannon Lake PCH SATA AHCI Controller [8086:a352] (rev 10)
IOMMU Group 9 00:1b.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #17 [8086:a340] (rev f0)


```


修改grub

```shell
nano /etc/default/grub

GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt i915.enable_gvt=1 initcall_blacklist=sysfb_init pcie_acs_override=downstream"


#更新
update-grub
update-initramfs -u -k all
proxmox-boot-tool refresh


```