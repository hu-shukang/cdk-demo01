export class ResponseUtil {
  public static ok(body: any) {
    return {
      isBase64Encoded: false,
      headers: {},
      statusCode: 200,
      body: JSON.stringify(body),
    };
  }

  public static requestError(body: any) {
    return {
      isBase64Encoded: false,
      headers: {},
      statusCode: 401,
      body: JSON.stringify(body),
    };
  }

  public static serverError(body: any) {
    return {
      isBase64Encoded: false,
      headers: {},
      statusCode: 500,
      body: JSON.stringify(body),
    };
  }
}
