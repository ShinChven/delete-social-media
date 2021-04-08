# delete-social-media

> A puppeteer script to delete social media contents.
> 基于puppeteer的自动化脚本，用于删除社交媒体内容。

## 删除新浪博客

```TypeScript
import {deleteSinaBlogPosts} from '../src';

const url="http://blog.sina.com.cn/s/articlelist_<博客后台id>.html";

deleteSinaBlogPosts({url}).then();
```
