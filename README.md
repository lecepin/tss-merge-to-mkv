# TS 视频合并工具

> 在线免安装版本：[https://github.com/lecepin/web-tss-merge2mkv](https://github.com/lecepin/web-tss-merge2mkv)

![](https://raw.githubusercontent.com/lecepin/tss-merge-to-mkv/master/readme/icon.png)

当下载 m3u8 资源时，通常产生的是多个 ts 视频文件，所以需要借助某些工具来将这些 ts 视频片段整合为一个视频文件。

本软件主要解决的就是这个问题，底层基于ffmpeg，可正常运行在 Windows 和 Mac 平台。不仅可以合并 ts 为单个通用的视频文件，还支持视频格式转换。


## 下载

目前支持 win-x64 & mac-x64：[地址](https://github.com/lecepin/tss-merge-to-mkv/releases)

ts文件合并工具，同时支持其他视频格式转换原理mkv/ts/mp4


## 软件界面

主界面：

![](https://raw.githubusercontent.com/lecepin/tss-merge-to-mkv/master/readme/1.png)

转换成功：

![](https://raw.githubusercontent.com/lecepin/tss-merge-to-mkv/master/readme/5.png)

支持拖动添加文件：

![](https://raw.githubusercontent.com/lecepin/tss-merge-to-mkv/master/readme/3.png)

支持的合并的格式：

![](https://raw.githubusercontent.com/lecepin/tss-merge-to-mkv/master/readme/6.png)

## 其他

国内环境构建，可以配置如下环境变量：

```bash
echo ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/\\nELECTRON_BUILDER_BINARIES_MIRROR=https://npm.taobao.org/mirrors/electron-builder-binaries/ >> ~/.npmrc
```

OR:
```bash
npm config set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
npm config set ELECTRON_BUILDER_BINARIES_MIRROR=https://npm.taobao.org/mirrors/electron-builder-binaries/
```

## ⚠ 文件数量过多的解决方法

如果合并的文件数量过多，成千上万上，会导致软件内的命令无法正常执行，可以使用以下脚本在终端中执行。

```sh
ls -l | sort -k 9,9 | awk '/^-/{print "file \"" $9 "\"" }' | grep -v "file_list.txt"  > file_list.txt

ffmpeg -f concat -i file_list.txt -c copy output.mp4
```
