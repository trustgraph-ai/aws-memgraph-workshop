
// Creates an ECS cluster using EC2 compute

import * as fs from 'fs';
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { awsProvider } from './aws-provider';
import { prefix, tags, region } from './config';

////////////////////////////////////////////////////////////////////////////

const asset = new pulumi.asset.FileAsset("../docker-compose.yaml");

////////////////////////////////////////////////////////////////////////////

export const bucket = new aws.s3.BucketV2(
    "bucket",
    {
        bucketPrefix: "init-resources",
    },
    { provider: awsProvider }
);

export const resourceObject = new aws.s3.BucketObjectv2(
    "bucket-resource",
    {
	key: "resources.yaml",
        bucket: bucket.id,
        source: asset,
    },
    { provider: awsProvider }
);

