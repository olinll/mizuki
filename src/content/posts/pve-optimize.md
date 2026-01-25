---
title: PVE优化
description: ' '

published: 2025-10-08
date: 2025-10-08
tags:
  - ProxmoxVE
category: 教程
draft: false
pinned: false
# image: './img/defalut-cover.png'
---

# 一键替换国内源
```shell
wget http://share.geekxw.top/yuan.sh -O yuan.sh && chmod +x yuan.sh && ./yuan.sh

apt update
apt dist-upgrade
```

# 添加温度显示
```shell
(curl -Lf -o /tmp/temp.sh https://raw.githubusercontent.com/a904055262/PVE-manager-status/main/showtempcpufreq.sh || curl -Lf -o /tmp/temp.sh https://mirror.ghproxy.com/https://raw.githubusercontent.com/a904055262/PVE-manager-status/main/showtempcpufreq.sh) && chmod +x /tmp/temp.sh && /tmp/temp.sh remod
```
来源:[https://www.right.com.cn/forum/thread-6754687-1-1.html](https://www.geekxw.top/?golink=aHR0cHM6Ly93d3cucmlnaHQuY29tLmNuL2ZvcnVtL3RocmVhZC02NzU0Njg3LTEtMS5odG1s)



# 修改CPU调度

```shell
apt install cpufrequtils
cpufreq-info

cpupower -c all frequency-set -g ondemand
systemctl restart cpufrequtils

# 对于模式的说明
## performance 性能模式，将 CPU 频率固定工作在其支持的较高运行频率上，而不动态调节。  
## userspace 系统将变频策略的决策权交给了用户态应用程序，较为灵活。  
## powersave 省电模式，CPU 会固定工作在其支持的最低运行频率上。  
## ondemand 按需快速动态调整 CPU 频率，没有负载的时候就运行在低频，有负载就高频运行。  
## conservative 与 ondemand 不同，平滑地调整 CPU 频率，频率的升降是渐变式的，稍微缓和一点。  
## schedutil 负载变化回调机制，后面新引入的机制，通过触发 schedutil sugov_update 进行调频动作。
```
# 自定义传感器显示
```shell
/usr/share/perl5/PVE/API2/Nodes.pm



$res->{pveversion} = PVE::pvecfg::package() . "/" .
    PVE::pvecfg::version_text();
# 在 下添加

## 第一行是基础信息 第二个是N卡信息
$res->{sensorsinfo} = `sensors -j`;
$res->{nvinfo} = `nvidia-smi -x -q`;
```

```shell
/usr/share/pve-manager/js/pvemanagerlib.js
## 删除掉温度℃那个json 换成下面的
 {
    itemId: 'sensorsinfo',
    colspan: 2,
    printBar: false,
    title: gettext('温度传感器'),  // WEB显示内容
    textField: 'sensorsinfo',
    renderer: function(value) {
        value = JSON.parse(value.replaceAll('Â', '')); // 移除可能存在的字符编码问题

        // 获取核心温度
        const cpuPackageTemp = value['coretemp-isa-0000']['Package id 0']['temp1_input'].toFixed(1);
        
        // NVMe 温度
        const nvmeCompositeTemp = value['nvme-pci-0a00']['Composite']['temp1_input'].toFixed(1);

        // PCH 温度
        const pchTemp = value['pch_cannonlake-virtual-0']['temp1']['temp1_input'].toFixed(1);

        // ACPI 温度
        const acpiTemp = value['acpitz-acpi-0']['temp1']['temp1_input'].toFixed(1);



        return `CPU封装温度: ${cpuPackageTemp}°C | NVMe温度: ${nvmeCompositeTemp}°C | PCH温度: ${pchTemp}°C | ACPI温度: ${acpiTemp}°C`;  
    }
},



## 示例数据
## 第一个是基础信息
## 第二个是nvdia卡信息
  {

        itemId: 'sensorsinfo',
        colspan: 2,
        printBar: false,
        title: gettext('温度传感器'),  // WEB显示内容
        textField: 'sensorsinfo',
        renderer:function(value){
            value = JSON.parse(value.replaceAll('Â', ''));
        const c0 = value['coretemp-isa-0000']['Package id 0']['temp1_input'].toFixed(1);
        const a0 = value['i350bb-pci-0800']['loc1']['temp1_input'].toFixed(1);
        const c1 = value['nct6798-isa-0290']['fan1']['fan1_input'].toFixed(1);
        const c2 = value['nct6798-isa-0290']['fan2']['fan2_input'].toFixed(1);
        const c3 = value['nct6798-isa-0290']['fan3']['fan3_input'].toFixed(1);
        const c4 = value['nct6798-isa-0290']['fan6']['fan6_input'].toFixed(1);
            return `CPU温度: ${c0}°C|i350温度: ${a0}°C|CPU风扇: ${c1}|机箱风扇: ${c2},${c3}|Tesla P4风扇: ${c4}`;  // 输出格式
        }
  },
    {

        itemId: 'nvinfo',
        colspan: 2,
        printBar: false,
        title: gettext('GPU传感器'),  // WEB显示内容
        textField: 'nvinfo',
        renderer:function(value){
        const c0 = value.match(/<gpu_temp>(\d+)\s?C<\/gpu_temp>/)[1]; 
    const c1 = value.match(/<power_draw>([\d.]+)\s?W<\/power_draw>/)[1]; 
    const c2 = value.match(/<graphics_clock>([\d]+)\s?MHz<\/graphics_clock>/)[1];
            return `温度: ${c0}°C|功耗: ${c1}W|频率: ${c2}Mhz`;  // 输出格式
        }
  },
```

应用变更
```shell
systemctl restart pveproxy

## 重装pve管理网页代码
apt install pve-manager proxmox-widget-toolkit --reinstall
```