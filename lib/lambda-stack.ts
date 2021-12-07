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

    const layer = new lambda.LayerVersion(this, "shared_layer", {
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/layer")),
      layerVersionName: "shared_layer",
    });

    const studentBucket = new s3.Bucket(this, "hsk_student_bucket", {
      blockPublicAccess: new s3.BlockPublicAccess({ blockPublicPolicy: false }),
      bucketName: "hsk-student-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const studentTable = new Table(this, "student_tbl", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      tableName: "student_tbl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const studentAdd = new lambda.Function(this, "student_add", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/src/student/add")),
      functionName: "student_add",
      layers: [layer],
    });

    const studentDetail = new lambda.Function(this, "student_detail", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/src/student/detail")),
      functionName: "student_detail",
      layers: [layer],
    });

    studentTable.grantWriteData(studentAdd);
    studentTable.grantReadData(studentDetail);

    studentBucket.grantPutAcl(studentAdd);
    studentBucket.grantPut(studentAdd);

    const api = new apigateway.RestApi(this, "StudentApi", {
      restApiName: "student-api",
    });
    api.root.addMethod("POST", new apigateway.LambdaIntegration(studentAdd));
    api.root.addResource("{id}").addMethod("GET", new apigateway.LambdaIntegration(studentDetail, {}));
  }
}
