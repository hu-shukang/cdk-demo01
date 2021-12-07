import { APIGatewayProxyEvent } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { docClient } from "./clients";
import { ResponseUtil } from "./response_util";
import { StudentModel } from "./student";

export const handler = async function (event: APIGatewayProxyEvent) {
  if (!event.body) {
    return ResponseUtil.requestError({
      message: "no response body",
    });
  }
  const student = JSON.parse(event.body) as StudentModel;
  const params: DocumentClient.PutItemInput = {
    TableName: "student_tbl",
    Item: student,
  };
  console.log(params);
  const resp = await docClient.put(params).promise();
  if (resp.$response.error) {
    return ResponseUtil.serverError({
      error: resp.$response.error,
    });
  } else {
    return ResponseUtil.ok({
      message: "OK",
    });
  }
};
