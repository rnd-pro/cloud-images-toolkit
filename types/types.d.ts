declare type CloudImageDescriptor = {
  cdnId: string,
  uploadDate: string,
  imageName: string,
  alt: string,
  width: string,
  height: string,
  aspectRatio: string,
  srcFormat: string,
};

declare type CITConfig = {
  syncDataPath: string,
  imsDataPath: string,
  imgSrcFolder: string,
  apiKey: string,
  apiUrl: string,
  baseUrl: string,
  variants: string[],
  imgTypes: string[],
  wsPort: number,
  httpPort: number,
};

declare type WsCmdType = 'HELLO' | 'FETCH' | 'REMOVE' | 'UPDATE' | 'EDIT' | 'TEXT' | 'SAVE_IMS' | 'PUB_DATA_IMG';

declare type WsMsg = {
  cmd: WsCmdType,
  data: any,
};

declare type WsMsgData = {
  localPath?: string,
  imgData?: string,
  hash?: string,
  srcData?: any,
}
