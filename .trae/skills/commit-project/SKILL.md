---
name: commit-project
description: Commit all project files and push the whole folder to the Gitee repo advanced-web-design-pracitice. Use when the user says 提交项目, 提交到gitee, push到gitee, or 上传项目. Do not use for local-only commits without pushing.
---

# 提交项目到 Gitee

把 d:\高级网页设计 整个项目文件夹（所有文件）用 git commit 并推送到 Gitee 仓库 advanced-web-design-pracitice。项目根目录本身就是 Git 工作区，推送后从 Gitee 克隆该仓库即得到名为 advanced-web-design-pracitice 的文件夹 —— 无需复制或重命名文件，"打成一个文件夹"由仓库名天然满足。

## 固定信息

- 项目根目录：d:\高级网页设计
- 目标仓库（HTTPS，首选）：https://gitee.com/Liang-Yu-Cheng/advanced-web-design-pracitice.git
- 目标仓库（SSH，仅当 HTTPS 认证失败且已配置密钥时备用）：git@gitee.com:Liang-Yu-Cheng/advanced-web-design-pracitice.git
- 远程名固定用 practice —— 禁止改动已有的 origin（它指向另一个仓库 advanced-web-design.git）

## 步骤

1. 在项目根目录确认当前分支：git branch --show-current（历史为 master，若变化以实际输出为准）。
2. 确保远程存在且指向正确：
   - git remote get-url practice 失败 → git remote add practice https://gitee.com/Liang-Yu-Cheng/advanced-web-design-pracitice.git
   - 已存在但 URL 不同 → git remote set-url practice 为上述 HTTPS 地址。
3. 提交所有文件（按用户要求全部纳入，包括 lyc_prompt.md 与 .trae 等，不做额外忽略）：
   - git add -A
   - git commit -m "提交项目 yyyy-MM-dd HH:mm"（时间取实际当前时间；若无任何变更则跳过提交，直接进入推送）
4. 推送：git push -u practice master（分支名用第 1 步的实际输出）。
5. 推送被拒绝（non-fast-forward）时禁止强推：先 git pull --rebase practice master，解决冲突后重新推送；仍失败则把错误原样报告给用户，等待用户指示。

## 禁止事项

- 不对远程使用 --force 强推。
- 不改动、不删除 origin 远程。
- 不跳过失败的命令或谎报推送成功；每步以实际命令输出为准。
- HTTPS 推送卡在凭据输入时，不要反复重试；向用户说明需要登录 Gitee 或提供凭据，或改用第 2 条中的 SSH 备用地址。
