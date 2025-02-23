
// Security group

import * as aws from "@pulumi/aws";
import { prefix, tags } from './config';
import { vpc } from './vpc';
import { awsProvider } from './aws-provider';

export const secGroup = new aws.ec2.SecurityGroup(
    "security-group",
    {
        vpcId: vpc.id,
        description: "Enables access to EC2",
        ingress: [
            // Add access to SSH
            {
                protocol: 'tcp',
                fromPort: 22,
                toPort: 22,
                cidrBlocks: [ "0.0.0.0/0" ],
            },
        ],
        egress: [
            {
                protocol: "-1",
                fromPort: 0,
                toPort: 0,
                cidrBlocks: ['0.0.0.0/0'],
                ipv6CidrBlocks: ["::/0"],
            }
        ],
        tags: {
            ...tags,
            "Name": prefix,
        }
    },
    { provider: awsProvider }
);

