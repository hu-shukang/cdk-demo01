import * as cdk from "aws-cdk-lib";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs";
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // This creates a new CodeCommit repository called 'WorkshopRepo'
    // const repo = new codecommit.Repository(this, "lambda-typescript", {
    //   repositoryName: "lambda-typescript",
    // });
    const repo = codecommit.Repository.fromRepositoryName(this, "lambda-typescript", "lambda-typescript");

    // The basic pipeline declaration. This sets the initial structure
    // of our pipeline
    const pipeline = new CodePipeline(this, "lambda-typescript-pipline", {
      pipelineName: "lambda-typescript-pipline",
      synth: new CodeBuildStep("lambda-typescript-build", {
        projectName: "lambda-typescript-build",
        input: CodePipelineSource.codeCommit(repo, "it"),
        installCommands: ["npm install -g aws-cdk"],
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }
}
