import { APIGatewayProxyEvent } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { docClient, s3Client } from "/opt/nodejs/utils/clients";
import { ResponseUtil } from "/opt/nodejs/utils/response_util";
import { StudentModel } from "/opt/nodejs/models/student";

export const handler = async function (event: APIGatewayProxyEvent) {
  if (!event.body) {
    return ResponseUtil.requestError({
      message: "no response body",
    });
  }
  const student = JSON.parse(event.body) as StudentModel;
  const base64Data = student.icon.replace(/^data:image\/png;base64,/, "");
  const iconImage = Buffer.from(base64Data, "base64");
  const contentType = student.icon.substring(student.icon.indexOf(":") + 1, student.icon.indexOf(";base64"));
  let extention = student.icon.substring(student.icon.indexOf("/") + 1, student.icon.indexOf(";base64"));
  extention = extention.replace("+xml", "");
  const iconName = `${student.id}.${extention}`;

  const s3Resp = await s3Client
    .putObject({
      Body: iconImage,
      Bucket: "hsk-student-bucket",
      ContentType: contentType,
      Key: iconName,
      ACL: "public-read",
    })
    .promise();

  console.log(s3Resp.$response.data);

  const params: DocumentClient.PutItemInput = {
    TableName: "student_tbl",
    Item: {
      ...student,
      icon: iconName,
    },
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
