import * as base64 from "base-64";

export interface ImageModel {
  data: Buffer | string;
  extention: string;
  contentType: string;
}

export const base64ToImage = (base64Str: string): ImageModel => {
  const base64Data = base64Str.replace(/^data:image.*;base64,/, "");
  let iconImage: Buffer | string;
  if (base64Str.includes("svg+xml")) {
    iconImage = base64.decode(base64Data);
  } else {
    iconImage = Buffer.from(base64Data, "base64");
  }
  const contentType = base64Str.substring(base64Str.indexOf(":") + 1, base64Str.indexOf(";base64"));
  let extention = contentType.replace("image/", "");
  extention = extention.replace("+xml", "");
  return {
    data: iconImage,
    extention: extention,
    contentType: contentType,
  };
};
