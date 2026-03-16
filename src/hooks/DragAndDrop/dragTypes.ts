import { Directory, File } from "../../system/api/types";

export type DragTypeMap = {
  file: File;
  directory: Directory;
};

export type DragType = keyof DragTypeMap;
