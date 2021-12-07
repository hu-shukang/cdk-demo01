import { APIGatewayProxyEvent } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { docClient, s3Client } from "/opt/nodejs/utils/clients.util";
import { ResponseUtil } from "/opt/nodejs/utils/response.util";
import { StudentModel } from "/opt/nodejs/models/student";
import { base64ToImage } from "/opt/nodejs/utils/image.util";

export const handler = async function (event: APIGatewayProxyEvent) {
  if (!event.body) {
    return ResponseUtil.requestError({
      message: "no request body",
    });
  }
  const student = JSON.parse(event.body) as StudentModel;
  const { data, extention, contentType } = base64ToImage(student.icon);
  const iconName = `${student.id}.${extention}`;

  const s3Resp = await s3Client
    .putObject({
      Body: data,
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
