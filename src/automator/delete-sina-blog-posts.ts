import {loadCookies, newBrowser, outputCookies} from "../utils/puppeteer";
import puppeteer from 'puppeteer-core';
import path from "path";
import {APP_DATA_DIR} from "../utils/paths";
import {Options} from "../options";
import {sleep} from "../utils/sleep-promise";

export const DELETE_SINA_BLOG_POSTS_DIR = path.join(APP_DATA_DIR, 'delete_sina_blog_posts');
export const DELETE_SINA_BLOG_POSTS_COOKIES = path.join(DELETE_SINA_BLOG_POSTS_DIR, 'cookies.json');

export const deleteSinaBlogPosts = async ({url, headless}: { url: string } & Options) => {
    return new Promise<void>(async resolve => {
        let browser: puppeteer.Browser;
        let page: puppeteer.Page;
        browser = await newBrowser({headless});
        page = await browser.newPage();
        await page.setViewport({
            width: 1000,
            height: 1000
        });

        page.on('load', async () => {
            const u = page.url();
            console.log("page loaded @", u);
            outputCookies({page, cookiesPath: DELETE_SINA_BLOG_POSTS_COOKIES}).then().catch();
            // 等待js加载完毕
            await sleep(1000);
            if (u.indexOf('http://blog.sina.com.cn/s/articlelist') >= 0) {
                // 点击`更多`按钮
                const [more] = await page.$$('a[id*=a_more]');
                if (!more) {
                    console.log('删除完毕');
                    console.log('开始清理回收站');
                    const [trash] = await page.$$('#module_7 > div.SG_connBody > div > ul:nth-child(5) > li:nth-child(3) > div.menuCell_main > span > a');
                    await trash.click();
                }
                await more.click();

                // 点击`删除`按钮
                const [deleteButton] = await page.$$('a[id*=a_normal_del]');
                if (deleteButton) {
                    await deleteButton.click();

                    // 点击`确定`按钮
                    await sleep(500);
                    const [confirm] = await page.$$('cite[id$=OK i]');
                    await confirm.click();
                }
            } else if (u.indexOf('http://control.blog.sina.com.cn/blog_rebuild/blog/controllers/articlelist.php') >= 0){
                const [deleteButton] = await page.$$('a[id*=a_recyle_del]');
                if (deleteButton) {
                    await deleteButton.click();
                    const [confirm] = await page.$$('cite[id$=OK i]');
                    if (confirm) {
                        await sleep(500);
                        await confirm.click();
                    }
                }
                const [db] = await page.$$('a[id*=a_normal_del]');
                if (db) {
                    await db.click();
                    const [confirm] = await page.$$('cite[id$=OK i]');
                    if (confirm) {
                        await sleep(500);
                        await confirm.click();
                    }
                }
            }else {
                console.log('未登录或者链接错误！');
                console.log('请手动登录或者进入正确的链接', 'http://blog.sina.com.cn/s/articlelist*');
            }
        });

        // 载入 cookies
        await loadCookies({page, cookiesPath: DELETE_SINA_BLOG_POSTS_COOKIES});
        await page.goto(url);
    });
}
