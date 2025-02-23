
// Creates an ECS cluster using EC2 compute

import * as fs from 'fs';
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";

import { vpc, pubSubnet } from './vpc';
import { awsProvider } from './aws-provider';
import {
    prefix, tags, region, trustgraphVersion, volumeSize
} from './config';
import { secGroup } from './security-groups';
import { address } from './address';

import { bucket, resourceObject } from './resources';

// Ubuntu server 24.04 LTS in London
//const ami = "ami-053a617c6207ecc7b";
const ami = "ami-00c257e12d6828491";

//const instanceType = "t3a.xlarge";

const instanceType = "m7i.xlarge";

////////////////////////////////////////////////////////////////////////////

const template = fs.readFileSync("../init-script.sh").toString();

const userData = pulumi.all(
    [bucket.bucket, resourceObject.key]
).apply(
    ([bucket, key]) =>
        btoa(
            template.
                replace("%BUCKET%", bucket).
                replace("%KEY%", key).
                replace("%VERSION%", trustgraphVersion)
        )
);

////////////////////////////////////////////////////////////////////////////

// ssh key, elliptic curve
export const sshKey = new tls.PrivateKey(
    "ssh-key",
    {
        algorithm: "ED25519",
    }
);

export const keypair = new aws.ec2.KeyPair(
    "keypair",
    {
        keyName: prefix + "-key",
        publicKey: sshKey.publicKeyOpenssh,
        tags: tags,
    },          
    { provider: awsProvider, }
);

////////////////////////////////////////////////////////////////////////////

const inlinePolicy = bucket.bucket.apply(
    (bucket) =>
        JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Sid: "AllowS3Access",
                Action: [
                    "s3:GetObject",
                    "s3:GetObjectVersion",
                    "s3:ListBucket",
                ],
                Effect: "Allow",
                Resource: [
                    `arn:aws:s3:::${bucket}`,
                    `arn:aws:s3:::${bucket}/*`,
                ],
            }],
        })
);

const role = new aws.iam.Role(
    "ec2-role",
    {
	assumeRolePolicy: JSON.stringify({
	    Version: "2012-10-17",
	    Statement: [{
		Action: "sts:AssumeRole",
		Effect: "Allow",
		Principal: {
		    Service: "ec2.amazonaws.com",
		},
	    }],
	}),
        inlinePolicies: [
            {
                name: "s3-policy",
                policy: inlinePolicy,
            },
        ],
    },
    { provider: awsProvider, }
);

// Add bedrock
const rolePolicyAttachment = new aws.iam.RolePolicyAttachment(
    "ec2-role-policy",
    {
        role: role.name,
        policyArn: "arn:aws:iam::aws:policy/AmazonBedrockFullAccess",
    },
    { provider: awsProvider, }
);

// Create instance profile
const instanceProfile = new aws.iam.InstanceProfile(
    "ec2-instance-profile",
    {
        role: role.name,
    },
    { provider: awsProvider, }
);

////////////////////////////////////////////////////////////////////////////

export const eni = new aws.ec2.NetworkInterface(
    "network-interface",
    {
	subnetId: pubSubnet.id,
	securityGroups: [ secGroup.id ],
    },
    { provider: awsProvider, }
);

export const assoc = new aws.ec2.EipAssociation(
    "assocation",
    {
	allocationId: address.id,
	networkInterfaceId: eni.id,
    },
    { provider: awsProvider, }
);

export const instance = new aws.ec2.Instance(
    "ec2-instance",
    {
	ami: ami,
	availabilityZone: region + "a",
	ebsOptimized: false,
	enclaveOptions: {
            enabled: false,
	},
	instanceType: instanceType,
	keyName: keypair.keyName,
	networkInterfaces: [
	    {
		deviceIndex: 0,
		networkInterfaceId: eni.id,
		deleteOnTermination: false,
	    }
	],
	iamInstanceProfile: instanceProfile.name,
	rootBlockDevice: {
            volumeSize: volumeSize,
            volumeType: "gp3",
            deleteOnTermination: true,
            encrypted: true,
            tags: {
		Name: prefix,
		...tags,
            },
	},
        metadataOptions: {
	    httpEndpoint: 'enabled',
	    httpPutResponseHopLimit: 2,
	},
	tags: {
	    Name: prefix,
	    ...tags,
	},
	userData: userData,
	userDataReplaceOnChange: true,
    },
    { provider: awsProvider, }

);

