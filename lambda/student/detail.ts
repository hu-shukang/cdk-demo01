import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import { ResponseUtil } from "./response_util";
import { docClient } from "./clients";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const handler = async function (event: APIGatewayProxyEvent) {
  if (!event.pathParameters) {
    return ResponseUtil.requestError({
      message: "no path parameter",
    });
  }
  const { id } = event.pathParameters;
  const params: DocumentClient.GetItemInput = {
    TableName: "student_tbl",
    Key: {
      id: id,
    },
  };
  const resp = await docClient.get(params).promise();
  return ResponseUtil.ok(resp.Item);
};
