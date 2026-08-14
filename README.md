# 西瓜账本

一个适合手机使用的本地优先记账工具，支持支出记录、分类、预算、趋势图和数据导入导出。

## 本地运行

直接打开 `index.html` 即可预览；也可以使用任意静态服务器运行。

## 发布到 GitHub Pages

仓库包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 分支后，GitHub Actions 会自动发布整个站点。

首次发布时：

1. 在 GitHub 新建一个仓库，例如 `watermelon-ledger`。
2. 将本项目推送到该仓库的 `main` 分支。
3. 在仓库 **Settings → Pages** 中把发布来源设为 **GitHub Actions**。
4. 等待工作流完成，GitHub 会生成手机可访问的网址。

## 开启云端保存和登录

云端功能使用 Supabase：

1. 在 Supabase 新建项目。
2. 打开 SQL Editor，执行项目中的 `supabase-schema.sql`。
3. 在 Supabase 的 Authentication → Providers 中启用 Email 登录。
4. 将 `cloud-config.js` 中的 `supabaseUrl` 和 `supabaseAnonKey` 换成 Supabase 项目配置。
5. 在 Authentication → URL Configuration 中，把 GitHub Pages 地址加入 Site URL / Redirect URLs。
6. 在 Authentication → Email Templates → Reset Password 中，把邮件内容改为显示验证码 `{{ .Token }}`，不要只使用 `{{ .ConfirmationURL }}` 链接。例如：

```html
<h2>重置西瓜账本密码</h2>
<p>你的密码重置验证码是：</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 8px;">{{ .Token }}</p>
<p>请回到西瓜账本页面输入这 6 位验证码。验证码仅短时间有效，请勿转发给他人。</p>
```

7. 重新发布网站。

找回密码现在采用“邮箱验证码 → 设置新密码”的流程，可以避免邮箱安全扫描提前消耗一次性链接。修改 Supabase 邮件模板后，之前已经发送的找回密码邮件不会变成验证码邮件，需要重新发送一封。

`anon key` 是浏览器端公开配置，但不要把 service role key 写入前端。数据表已经通过 RLS 限制为用户只能读写自己的账本。

## 注意

当前 GitHub Pages 只负责托管网页；登录和跨设备保存由 Supabase 提供。没有配置 Supabase 时，工具仍可使用浏览器本地存储。
