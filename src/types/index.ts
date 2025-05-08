/**
 * 插件配置选项接口
 * @interface ManifestPluginOptions
 * @property {string} version - 版本号，用于标识当前构建的版本
 * @property {string} uploadUrl - OSS 的目录地址
 * @property {string} downloadUrl - 离线包的下载地址
 * @property {string} region - OSS 区域
 * @property {string} accessKeyId - OSS AccessKey ID
 * @property {string} accessKeySecret - OSS AccessKey Secret
 * @property {string} bucket - OSS Bucket 名称
 * @property {boolean} isSendLark - 是否打印 commit信息并发送飞书通知
 * @property {string} larkWebhook - 飞书 webhook
 * @property {string} larkKeyWord - 飞书 key 关键字
 * @property {string} basePath - 上传的文件路径
 * @property {string[]} ignoreRouterPath - 离线包忽略router地址
 */
export interface ManifestPluginOptions {
    version: string;
    uploadUrl: string;
    downloadUrl: string;
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    isSendLark: boolean;
    larkWebhook: string;
    larkKeyWord: string;
    basePath: string;
    ignoreRouterPath: string[]
} 