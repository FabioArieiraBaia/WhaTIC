// get public folder

import path from "path";

export const getPublicPath = () => {
  const isDist = __dirname.split(path.sep).includes("dist");
  const publicFolder = isDist
    ? path.resolve(__dirname, "..", "public")
    : path.resolve(__dirname, "..", "..", "public");

  return publicFolder;
};
