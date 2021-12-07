import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import { docClient } from "/opt/nodejs/clients";
import { ResponseUtil } from "/opt/nodejs/response_util";
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
