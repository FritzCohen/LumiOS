import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ReactNode } from "react";

// Permission Types
export enum Permission {
  SYSTEM,
  ELEVATED,
  USER,
  NONE,
}

export const PermissionDescription: Record<Permission, string> = {
  [Permission.SYSTEM]: "system",
  [Permission.ELEVATED]: "admin",
  [Permission.USER]: "user",
  [Permission.NONE]: "none",
};

// Global errors
export enum FileErrorType {
  FileNotFound = "FileNotFound",
  InvalidFileType = "InvalidFileType",
  PermissionDenied = "PermissionDenied",
  FileExists = "FileExists",
  Unknown = "UnknownFileError",
}

export enum PermissionErrorType {
  AccessDenied = "AccessDenied",
  InvalidScope = "InvalidScope",
}

export enum NetworkErrorType {
  Timeout = "Timeout",
  Offline = "Offline",
}

export enum ValidationErrorType {
  InvalidInput = "InvalidInput",
  MissingField = "MissingField",
}

export enum GlobalErrorType {
  File = "File",
  Permission = "Permission",
  Network = "Network",
  Validation = "Validation",
}

export type BaseError<T extends string> = {
  type: T;
  message: string;
  description?: string;
  errorMessage?: string;
  code?: number;
  permissionRequired?: Permission;
};

export type ErrorMetadata = {
  message: string;
  description?: string;
  code?: number;
  permissionRequired?: Permission;
  extra?: string;
};

export const ErrorRegistry = {
  // File Errors
  [FileErrorType.FileNotFound]: {
    message: "File not found.",
    description: "The system could not locate the requested file.",
    code: 404,
  },
  [FileErrorType.PermissionDenied]: {
    message: "Permission denied.",
    description: "You do not have access to this file.",
    code: 403,
    permissionRequired: Permission.USER,
  },
  [FileErrorType.InvalidFileType]: {
    message: "Invalid file type",
    description: "The type of item is invalid for the current context",
    code: 405,
    permissionRequired: Permission.NONE
  },
  [FileErrorType.FileExists]: {
    message: "File Exists",
    description: "This file can already be found in the current path",
    code: 58,
    permissionRequired: Permission.ELEVATED,
  },
  [FileErrorType.Unknown]: {
    message: "Unknown file error.",
    description: "An unexpected error occurred while accessing the file.",
    code: 500,
  },
  // Permission Errors
  [PermissionErrorType.AccessDenied]: {
    message: "Access denied.",
    description: "You lack the necessary permissions.",
    permissionRequired: Permission.ELEVATED,
  },
  [PermissionErrorType.InvalidScope]: {
    message: "Invalid permission scope.",
    description: "The operation requires a different permission level.",
  },

  // Add network/validation the same way
} satisfies Record<string, ErrorMetadata>;


export interface Executable {
  config: {
    name: string;
    displayName: string;
    permissions: Permission;
    icon: string | IconDefinition;
    version?: string;
    description?: string;
    onCompleteHandler?: (result?: any) => void; // optional callback for returning results
    [key: string]: any;
  };
  mainComponent: React.FC<any> | (() => ReactNode | string);
}

export interface Theme {
  primary: string
  primaryLight: string
  secondary: string
  secondaryLight: string
  textBase: string
}

export interface PanicConfig {
    key: string;
    website: string;
    title: string;
    favicon: string;
}

/* Joined openedApps and file/directory array */
export interface TaskbarDesktopItem {
  title: string;
	type: string;
	icon: string;
	open: boolean;
	id: string | null;
	displayName: string;
	permission: number | null;
}

export interface Shortcut {
  path: string
  name: string
}

// Convert deep object keys to dot.notation strings
// Only recurse into objects and arrays, not functions
export type DotNotation<T, Prefix extends string = ''> = {
  [K in keyof T & string]:
    T[K] extends (...args: any[]) => any     // exclude functions
      ? never
      : T[K] extends readonly (infer U)[]    // arrays → allow indices
        ? | `${Prefix}${K}` 
          | `${Prefix}${K}.${number}`
          | DotNotation<U, `${Prefix}${K}.${number}.`>
        : T[K] extends object
          ? | `${Prefix}${K}` 
            | DotNotation<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`;
}[keyof T & string];

// Get value type at dot.notation key
export type PathValue<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? PathValue<T[Key], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

/**
 * Updates a nested property in an object using dot notation.
 *
 * @param obj The object to update.
 * @param path The dot-notation path to the property.
 * @param value The new value to set at the specified path.
 * @returns The updated object with the value applied.
*/
export function setDeepValue<T extends object, P extends DotNotation<T>>(
  obj: T,
  path: P,
  value: PathValue<T, P>
): T {
  const keys = (path as string).split(".");
  const newObj: any = { ...obj };
  let curr: any = newObj;

  keys.forEach((key: string, idx: number) => {
    if (idx === keys.length - 1) {
      curr[key] = value;
    } else {
      curr[key] = { ...curr[key] };
      curr = curr[key];
    }
  });

  return newObj;
}