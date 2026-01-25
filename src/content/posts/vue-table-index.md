---
title: v-table组件添加序号
description: ' '

published: 2025-08-31
date: 2025-08-31
tags: ['Vue3']
category: '记录'
draft: false
pinned: false
# image: './img/defalut-cover.png'
---

# Vue 添加从1开始 添加序号

**在template 添加**
```html
 <el-table-column label="序号" align="center" type="index" :index="indexMethod"/>
```

**在script添加**
```js
/** 自定义编号 */
    indexMethod(index) {
      let pageNum = this.queryParams.pageNum - 1;
      if ((pageNum !== -1 && pageNum !== 0)) {
        return (index + 1) + (pageNum * this.queryParams.pageSize);
      } else {
        return (index + 1)
      }
    },
```