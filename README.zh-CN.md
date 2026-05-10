# Skills

[English](./README.md) | [中文](./README.zh-CN.md)

这是 Justin 的跨平台 AI skills 集合，目标是让同一个 skill 能在 Codex、Codex CLI、Claude Code 等主流 AI 工具里安装和使用。

仓库采用 monorepo 结构：

```text
skills/                  # 每个 skill 的源文件
packages/                # 每个 skill 对应的 npm 安装包
scripts/                 # 构建和同步脚本
```

根目录 package 是私有的，不用于发布。每个可安装 skill 都从 `packages/` 下自己的 package 单独发布。

## 当前 Skills

### redo

`redo` 用来反向学习一门编程技术、框架、工具或基础设施系统。它会把一个成熟技术拆回早期阶段，重走它在真实工程约束下的演进路线。

它不会只介绍功能，而是追问：

- 每个阶段当时面对什么问题？
- 当时有哪些可选方案？
- 每个方案分别要付出什么代价？
- 为什么最终选择了这个设计？
- 这个选择埋下了什么技术债？
- 哪些债后来被解决了，哪些问题至今还影响体验？

安装：

```bash
npx @justinforfun/redo-skill
```

安装器会检测本机是否存在 Codex、Codex CLI 和 Claude Code。检测到的工具会默认选中；未检测到的工具默认不选，但仍可选择。选择未检测到的工具时，安装器会先确认再写入默认目录。

触发方式：

```text
Claude Code: /redo kafka
Codex: $redo kafka、redo kafka，或在 skill picker 里选择 redo
Codex CLI: $redo kafka、redo kafka，或 /skills 后选择 redo
```

语言：

- 默认跟随用户当前对话语言。
- 使用 `--lang zh` 或 `--lang en` 强制指定中文或英文。

示例：

```text
/redo kafka
redo react --lang en
$redo docker --lang zh
```

## 开发

安装依赖：

```bash
make install
```

构建 package，将 skill 源文件同步进 npm 包：

```bash
make build SKILL=redo
```

运行检查：

```bash
make check
```

预览 npm 包发布内容：

```bash
make pack SKILL=redo
```

本地运行安装器：

```bash
make run SKILL=redo
```

只更新版本但不发布：

```bash
make version redo BUMP=patch
```

发布：

```bash
npm login
npm whoami
make publish SKILL=redo
```

如果 npm 发布时要求两步验证，传入一次性验证码：

```bash
make publish redo OTP=123456
```

`make publish SKILL=redo` 会先运行检查、dry-run pack、自动升级版本，然后发布 `@justinforfun/redo-skill`。默认版本升级是 `patch`。

如果要发布 minor 或 major 版本：

```bash
make publish redo BUMP=minor
make publish redo BUMP=major
```

发布前不需要手动执行 `make version` 或 `make pack`，除非你只是想预览发布包或只想改版本但不发布。

也可以把 skill 名作为位置参数传入：

```bash
make publish redo
```

发布其他 skill 时，传入对应 skill 名：

```bash
make build SKILL=other
make pack SKILL=other
make run SKILL=other
make publish SKILL=other
```

Makefile 会自动推导 npm 包名为 `@justinforfun/<skill>-skill`。发布前 `prepack` 会自动把 skill 源文件同步到对应 npm package，不需要手动复制。
