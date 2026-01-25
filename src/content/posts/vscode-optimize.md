---
title: VSCode优化指南
description: ' '
published: 2025-11-12
date: 2025-11-12
tags:
  - VSCode
category: 教程
draft: false
pinned: false
---

# vscode 打开多个项目的时候，设置“任务栏处以项目名称”显示

在设置中搜 “Window: Title”改成：

```sql
#原始的
#${dirty}${activeEditorShort}${separator}${rootName}${separator}${profileName}${separator}${appName}

${dirty}${rootName}${separator}${activeEditorMedium}${separator}${appName}

```

# VSCode 终端显示“pnpm : 无法加载文件 C:\Program Files\nodejs\npm.ps1，因为在此系统上禁止运行脚本”

解决方法：

1. 以管理员身份运行 PowerShell。
2. 执行以下命令：

```bash
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. 输入 Y 确认。