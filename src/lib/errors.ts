export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function errorResponse(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json({ code: err.code, message: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ code: 'internal_error', message: 'Something went wrong' }, { status: 500 });
}
