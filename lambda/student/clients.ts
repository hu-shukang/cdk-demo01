import { DynamoDB, config } from "aws-sdk";

const REGION = "ap-northeast-1";
config.update({ region: REGION });

const docClient = new DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

export { docClient };
