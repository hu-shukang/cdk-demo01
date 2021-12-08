import { Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import * as path from "path";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib/core";
import * as s3 from "aws-cdk-lib/aws-s3";

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // lambda 共通レイヤー
    const layer = new lambda.LayerVersion(this, "shared_layer", {
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/layer")),
      layerVersionName: "shared_layer",
    });

    // S3
    const studentBucket = new s3.Bucket(this, "hsk_student_bucket", {
      blockPublicAccess: new s3.BlockPublicAccess({ blockPublicPolicy: false }),
      bucketName: "hsk-student-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // dynamodb table
    const studentTable = new Table(this, "student_tbl", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      tableName: "student_tbl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // lambda定義
    const studentAdd = new lambda.Function(this, "student_add", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/src/student/add")),
      functionName: "student_add",
      layers: [layer],
    });

    // lambda定義
    const studentDetail = new lambda.Function(this, "student_detail", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/src/student/detail")),
      functionName: "student_detail",
      layers: [layer],
    });

    // lambdaにdynamodbの権限を付与する
    studentTable.grantWriteData(studentAdd);
    studentTable.grantReadData(studentDetail);

    // lambdaにs3の権限を付与する
    studentBucket.grantPutAcl(studentAdd);
    studentBucket.grantPut(studentAdd);

    // Api Gateway定義
    const api = new apigateway.RestApi(this, "StudentApi", {
      restApiName: "student-api",
    });
    // Api Gatewayにmethod&lambdaを追加する
    const studentApi = api.root.addResource("student");
    studentApi.addMethod("POST", new apigateway.LambdaIntegration(studentAdd));
    studentApi.addResource("{id}").addMethod("GET", new apigateway.LambdaIntegration(studentDetail, {}));
  }
}
