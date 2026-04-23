declare type CloudImageDescriptor = {
  cdnId: string,
  uploadDate: string,
  imageName: string,
  alt: string,
  tags?: string[],
  width: string,
  height: string,
  aspectRatio: string,
  srcFormat: string,
};

declare type CdnType = 'cloudflare' | 'cloudinary' | 'imagekit' | 'bunny';

declare type CdnUploadResult = {
  cdnId: string,
  uploadDate: string,
};

declare type CdnConnector = {
  name: string,
  upload: (imgBytes: Uint8Array<ArrayBuffer>, fileName: string, cfg: CITConfig) => Promise<CdnUploadResult>,
  fetchBlob: (cdnId: string, cfg: CITConfig) => Promise<ArrayBuffer>,
  remove: (cdnId: string, cfg: CITConfig) => Promise<void>,
  applyDefaults: (cfg: Partial<CITConfig>) => void,
  parseApiKey: (apiKeyRaw: string) => void,
};

declare type CITConfig = {
  name?: string,
  cdn?: CdnType,
  syncDataPath: string,
  imsDataPath: string,
  imsDataFolder?: string,
  imsDataMinify?: boolean,
  imgSrcFolder: string,
  apiKey: string,
  apiKeyPath?: string,
  projectId?: string,
  imgUrlTemplate?: string,
  previewUrlTemplate?: string,
  uploadUrlTemplate?: string,
  fetchUrlTemplate?: string,
  removeUrlTemplate?: string,
  imsUrlTemplate?: string,
  variants: string[],
  imgTypes: string[],
  wsPort?: number,
  httpPort?: number,
};

declare type CITRawConfig = CITConfig | CITConfig[];

declare type WsCmdType = 'HELLO' | 'FETCH' | 'REMOVE' | 'UPDATE' | 'EDIT' | 'TEXT' | 'SAVE_IMS' | 'PUB_DATA_IMG' | 'DELETE_IMS' | 'UPDATE_IMS' | 'SAVE_CONFIG' | 'RELOAD';

declare type WsMsg = {
  cmd: WsCmdType,
  data: any,
};

declare type WsMsgData = {
  localPath?: string,
  imgData?: string,
  hash?: string,
  srcData?: any,
  collectionIndex?: number,
  config?: CITConfig,
}

