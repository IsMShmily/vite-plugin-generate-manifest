import { Plugin } from "vite";

import sendLarkWebHookPlugin from "./sendLarkWebHookPlugin";
import generateManifestPlugin from "./generateManifestPlugin";
import type { ManifestPluginOptions } from "./types/index";
import aliOssPlugin from "./aliOssPlugin";

/**
 * 生成并上传 manifest.json 的 Vite 插件
 * @param {ManifestPluginOptions} options - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 */
export default function manifestPlugin(options: ManifestPluginOptions): Plugin {

  let buildConfig: any = {};
  let basePath = "/";

  return {
    name: "vite-plugin-generate-manifest",
    apply: "build",
    configResolved(config: any) {
      basePath = config.base;
      buildConfig = config.build;
    },
    closeBundle: async () => {
      const {
        isSendLark,
      } = options;

      /** 上传静态资源到 OSS */
      await aliOssPlugin(options, buildConfig, basePath);

      /** 生成 manifest.json */
      await generateManifestPlugin(options);

      /** 发送飞书通知 */
      if (isSendLark) await sendLarkWebHookPlugin(options);
    },
  };
}
