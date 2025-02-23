
import * as aws from "@pulumi/aws";

import { awsProvider } from './aws-provider';
import { prefix, tags } from './config';

export const address = new aws.ec2.Eip(
    "address",
    {
	tags: {
	    Name: prefix,
	    ...tags,
	}
    },
    { provider: awsProvider, }
);

