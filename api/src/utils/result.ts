export enum ResponseError {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,

  InternalServerError = 500,
}

export type Result<T> =
  | {
      data: T;
      success: true;
      error?: never;
      message?: never;
    }
  | {
      data?: never;
      success: false;
      error: ResponseError;
      message?: string;
    };
