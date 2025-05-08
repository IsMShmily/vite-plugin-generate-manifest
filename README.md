# vite-plugin-generate-manifest

一个 Vite 插件，用于生成 manifest.json 文件并上传到阿里云 OSS，同时支持飞书通知。

## 安装

```bash
npm install vite-plugin-generate-manifest --save-dev
```

## 使用方法

在 `vite.config.ts` 中配置插件：

```typescript
import { defineConfig } from "vite";
import manifestPlugin from "vite-plugin-generate-manifest";

export default defineConfig({
  plugins: [
    manifestPlugin({
      version: "1.0.0", // 版本号
      uploadUrl: "https://your-bucket.oss-cn-hangzhou.aliyuncs.com/your-path/", // manifest.json 上传位置
      downloadUrl:
        "https://your-bucket.oss-cn-hangzhou.aliyuncs.com/your-path/download", // 离线包下载地址,最终上传地址为 downloadUrl/dist.zip
      region: "oss-cn-hangzhou", // OSS 区域
      accessKeyId: "your-access-key-id", // OSS AccessKey ID
      accessKeySecret: "your-access-key-secret", // OSS AccessKey Secret
      bucket: "your-bucket", // OSS Bucket 名称
      isSendLark: true, // 是否发送飞书通知
      larkWebhook: "https://open.larksuite.com/open-apis/bot/v2/hook/xxx", // 飞书机器人 webhook 地址
      larkKeyWord: "构建通知", // 飞书通知关键词
      basePath: "/your-base-path", // OSS 静态资源上传到的路径
    }),
  ],
});
```

## 参数说明

- `version`: string - 版本号
- `uploadUrl`: string - OSS 的目录地址，用于上传 manifest.json
- `downloadUrl`: string - 离线包的下载地址,最终上传地址为 downloadUrl/dist.zip
- `region`: string - OSS 区域，例如：oss-cn-hangzhou
- `accessKeyId`: string - OSS AccessKey ID
- `accessKeySecret`: string - OSS AccessKey Secret
- `bucket`: string - OSS Bucket 名称
- `isSendLark`: boolean - 发送飞书通知，默认为 false
- `larkWebhook`: string - 飞书机器人 webhook 地址
- `larkKeyWord`: string - 飞书通知关键词
- `basePath`: string - OSS 静态资源上传到的路径

## 功能说明

1. 在构建完成时生成 manifest.json 文件
2. 将 manifest.json 文件上传到指定的 OSS 目录
3. manifest.json 包含以下信息：
   - version: 版本号
   - timestamp: 生成时间戳
   - downloadUrl: 离线包下载地址
   - files: 文件列表（目前为空数组，可根据需求扩展）
4. 支持飞书通知：
   - 自动检测构建环境（DEV/UAT/PROD）
   - 显示 commit 历史信息
5. 支持 OSS 文件上传：
   - 显示上传进度和结果

## 注意事项

1. OSS 配置安全

   - 建议使用环境变量或其他安全的方式存储 AccessKey
   - 不要将 AccessKey 直接硬编码在代码中

2. OSS 权限

   - 确保使用的 AccessKey 有足够的权限上传文件
   - 确保 Bucket 的访问权限设置正确

3. 路径配置

   - uploadUrl 应该指向 OSS 的目录地址
   - 确保路径以斜杠结尾
   - 路径中不要包含文件名，插件会自动添加 manifest.json

4. 区域选择

   - 根据你的 OSS Bucket 所在区域选择正确的 region
   - 常见的区域包括：
     - 华东 1（杭州）：oss-cn-hangzhou
     - 华东 2（上海）：oss-cn-shanghai
     - 华北 1（青岛）：oss-cn-qingdao
     - 华北 2（北京）：oss-cn-beijing
     - 华南 1（深圳）：oss-cn-shenzhen

5. 飞书配置
   - 确保 webhook 地址正确
   - 关键词为必填，避免消息被拦截
   - 确保机器人有发送消息的权限
