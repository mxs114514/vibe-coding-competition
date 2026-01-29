import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, data: any, message: string = 'Success') {
    return res.status(200).json({
      code: 200,
      message,
      data,
    });
  }

  static error(res: Response, message: string, code: number = 500) {
    return res.status(code).json({
      code,
      message,
      data: null,
    });
  }
}
