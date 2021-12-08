#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LambdaStack } from "../lib/lambda-stack";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();
new LambdaStack(app, "LambdaStack");

new PipelineStack(app, "PipelineStack");
