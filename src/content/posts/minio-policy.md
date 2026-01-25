---
title: 解决minio访问存储桶文件目录泄露问题
description: ' '

published: 2025-04-07
date: 2025-04-07
tags: ['minio']
category: '记录'
draft: false
pinned: false
# image: './img/defalut-cover.png'
---
# 配置存储桶策略 (Bucket Policy)

MinIO 支持基于 JSON 的存储桶策略，您可以配置这些策略来严格控制谁可以对存储桶执行哪些操作。为了防止存储桶文件目录泄露，您应该配置一个拒绝 s3:ListBucket 操作的策略。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

将 your-bucket-name 替换为您实际的存储桶名称。这个策略会阻止任何人列出该存储桶的内容，除非他们有显式权限。