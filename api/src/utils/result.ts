export const ResponseError = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,

  InternalServerError: 500,
} as const;

export type ResponseError = (typeof ResponseError)[keyof typeof ResponseError];

export type Result<T, E = ResponseError> =
  | {
      data: T;
      success: true;
      error?: never;
      message?: never;
    }
  | {
      data?: never;
      success: false;
      error: E;
      message?: string;
    };
