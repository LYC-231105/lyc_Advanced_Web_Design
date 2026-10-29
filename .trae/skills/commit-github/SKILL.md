---
name: commit-github
description: Commit all project files and push to the GitHub repo lyc_Advanced_Web_Design via the configured SSH public key. Use when the user says 提交到github, push到github, 上传到github or github提交. Do not use for gitee pushes (that is commit-project) or local-only commits.
---

# 提交项目到 GitHub

把 d:\高级网页设计 整个项目（所有文件）用 git commit 并推送到 GitHub 仓库 lyc_Advanced_Web_Design。认证使用用户已配置的 SSH 公钥，不需要账号密码。

## 固定信息

- 项目根目录：d:\高级网页设计（本身就是 Git 工作区）
- 目标仓库（SSH，唯一认证方式）：git@github.com:LYC-231105/lyc_Advanced_Web_Design.git
- 远程名固定用 github —— 禁止改动已有的 origin 与 practice（它们指向 Gitee 的两个仓库）

## 步骤

1. 在项目根目录确认当前分支：git branch --show-current（历史为 master，若变化以实际输出为准）。
2. 确保远程存在且指向正确：
   - git remote get-url github 失败 → git remote add github git@github.com:LYC-231105/lyc_Advanced_Web_Design.git
   - 已存在但 URL 不同 → git remote set-url github 为上述 SSH 地址。
3. 提交所有文件（不做额外忽略）：
   - git add -A
   - git commit -m "提交项目 yyyy-MM-dd HH:mm"（时间取实际当前时间；若无任何变更则跳过提交，直接进入推送）
4. 推送：git push -u github master（分支名用第 1 步的实际输出）。
5. 推送被拒绝（non-fast-forward）时禁止强推：先 git pull --rebase github master，解决冲突后重新推送；仍失败则把错误原样报告给用户，等待用户指示。

## 禁止事项

- 不对远程使用 --force 强推。
- 不改动、不删除 origin 或 practice 远程。
- 不静默改用 HTTPS 地址 —— SSH 推送失败时（如 Permission denied、Host key verification failed），把错误原样报告并等待用户处理（例如确认 ssh -T git@github.com 可用），不自行改道。
- 不跳过失败的命令或谎报推送成功；每步以实际命令输出为准。
