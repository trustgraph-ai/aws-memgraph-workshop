
// AWS provider

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { region } from './config';

// Define parameters of the AWS account
export const awsProvider = new aws.Provider(
    "aws",
    {

	// Default region
	region: region as aws.Region,

    }
);

// Get caller information
export const callerId = aws.getCallerIdentity(
    { provider: awsProvider, }
);

// Get AWS account ID
export const accountId = pulumi.output(callerId).apply(x => x.accountId);

