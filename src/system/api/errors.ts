import { ErrorMetadata, ErrorRegistry, Permission } from "../../types/globals";

export class AppError<T extends string> extends Error {
  type: T;
  description?: string;
  code?: number;
  permissionRequired: Permission;
  extra?: string;

  constructor(type: T, meta: Required<ErrorMetadata>) {
    super(meta.message);
    this.name = "AppError";
    this.type = type;
    this.description = meta.description;
    this.code = meta.code;
    this.permissionRequired = meta.permissionRequired;
    this.extra = meta.extra

    // Capture proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toString() {
    return `[${this.type}] ${this.message} — ${this.description ?? "No details."} ${this?.extra}`;
  }
}

export function createError<T extends keyof typeof ErrorRegistry>(
  type: T,
  overrides: Partial<ErrorMetadata> = {}
): AppError<T> {
  const base: ErrorMetadata = ErrorRegistry[type];

  const meta: Required<ErrorMetadata> = {
    message: overrides.message ?? base.message,
    description: overrides.description ?? base.description ?? "",
    code: overrides.code ?? base.code ?? 0,
    permissionRequired: overrides.permissionRequired ?? base.permissionRequired ?? Permission.NONE,
    extra: overrides.extra ?? "",
  };

  return new AppError(type, meta);
}