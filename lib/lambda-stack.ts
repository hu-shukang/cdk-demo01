import { Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import * as path from "path";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib/core";

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const layer = new lambda.LayerVersion(this, "SharedLayer", {
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      code: lambda.Code.fromAsset("lambda/layer"),
      layerVersionName: "SharedLayer",
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
      handler: "add.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/src/student")),
      functionName: "student_add",
      layers: [layer],
    });

    const studentDetail = new lambda.Function(this, "student_detail", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "detail.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/src/student")),
      functionName: "student_detail",
      layers: [layer],
    });

    studentTable.grantWriteData(studentAdd);
    studentTable.grantReadData(studentDetail);

    const api = new apigateway.RestApi(this, "StudentApi", {
      restApiName: "student-api",
    });
    api.root.addMethod("POST", new apigateway.LambdaIntegration(studentAdd));
    api.root.addResource("{id}").addMethod("GET", new apigateway.LambdaIntegration(studentDetail, {}));
  }
}
