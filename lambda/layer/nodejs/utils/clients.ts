import { DynamoDB, config, S3 } from "aws-sdk";

const REGION = "ap-northeast-1";
config.update({ region: REGION });

const s3Client = new S3();

const docClient = new DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

export { docClient, s3Client };
