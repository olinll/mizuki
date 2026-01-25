---
title: iStoreOS安装OpenClash
description: ' '

published: 2025-11-11
date: 2025-11-11
tags: ['iStoreOS', 'OpenClash']
category: '教程'
draft: false
pinned: false
image: './img/istoreos-install-openclash-025583.png'
---


我们经常会遇到docker pull命令无法运行，github无法访问的情况，这时候需要进行科学上网，虽然有软件可以解决，但是在一些linux系统，容器中，我们无法安装软件，这时我们可以搭建一个旁路由，并将网关指向这个旁路由，进行科学上网。

[iStoreOS](https://site.istoreos.com/)是一款不错的路由存储系统，拥有强大的软件生态，可以作为一个轻nas，轻服务器使用。

[OpenClash](https://github.com/vernesong/OpenClash)是一个可以运行在OpenWrt系统上的clash客户端。

[Clash内核](https://github.com/MetaCubeX/mihomo)

# 安装

接下来开始安装OpenClash

下载最新版本的OpenClash [OpenClash-releases](https://github.com/vernesong/OpenClash/releases)

根据系统类型输入命令：

```shell
#iptables
opkg update
opkg install bash iptables dnsmasq-full curl ca-bundle ipset ip-full iptables-mod-tproxy iptables-mod-extra ruby ruby-yaml kmod-tun kmod-inet-diag unzip luci-compat luci luci-base
opkg install /tmp/openclash.ipk

apk update
apk add bash iptables dnsmasq-full curl ca-bundle ipset ip-full iptables-mod-tproxy iptables-mod-extra ruby ruby-yaml kmod-tun kmod-inet-diag unzip luci-compat luci luci-base
apk add -q --force-overwrite --clean-protected --allow-untrusted /tmp/openclash.apk
```

```shell
#nftables
opkg update
opkg install bash dnsmasq-full curl ca-bundle ip-full ruby ruby-yaml kmod-tun kmod-inet-diag unzip kmod-nft-tproxy luci-compat luci luci-base
opkg install /tmp/openclash.ipk

apk update
apk add bash dnsmasq-full curl ca-bundle ip-full ruby ruby-yaml kmod-tun kmod-inet-diag unzip kmod-nft-tproxy luci-compat luci luci-base
apk add -q --force-overwrite --clean-protected --allow-untrusted /tmp/openclash.apk
```


安装完成之后刷新网页即可看到OpenClash出现

# 配置

插件启动之前请先确认下Clash内核，如果无法下载可以手动下载[Clash内核](https://github.com/MetaCubeX/mihomo/releases)后解压到`/etc/openclash/core/`文件夹，并将二进制文件命名为`clash_meta`