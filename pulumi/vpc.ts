
// VPC setup
// - An internet gateway
// - A public subnet with a NAT gateway

import * as aws from "@pulumi/aws";

import { awsProvider } from './aws-provider';
import {
    prefix, tags, region, vpcCidr, pubSubnetCidr,
} from './config';

// Networking - VPC plus three public subnets, an internet gateway and
// routing table

///////////////////////////////////////////////////////////////////

export const vpc = new aws.ec2.Vpc(
    "vpc",
    {
        cidrBlock: vpcCidr,
        enableDnsHostnames: true,
        enableDnsSupport: true,
        tags: {
            ...tags,
            "Name": prefix,
        },
    },
    { provider: awsProvider }
);

////////////////////////////////////////////////////////////////////////////

export const pubSubnet = new aws.ec2.Subnet(
    "pub-subnet",
    {
        cidrBlock: pubSubnetCidr,
        availabilityZone: region + "a",
        vpcId: vpc.id,
        tags: {
            ...tags,
            Name: prefix + "-pub"
        },
    },
    { provider: awsProvider }
);

const gateway = new aws.ec2.InternetGateway(
    "internet-gateway",
    {
        vpcId: vpc.id,
        tags: {
            ...tags,
            "Name": prefix,
        },
    },
    { provider: awsProvider }
);

const pubRouteTable = new aws.ec2.RouteTable(
    "pub-routetable",
    {
        routes: [
            {
                cidrBlock: "0.0.0.0/0",
                gatewayId: gateway.id,
            },
        ],
        vpcId: vpc.id,
        tags: {
            ...tags,
            "Name": prefix + "-pub",
        }
    },
    { provider: awsProvider }
);

const pubAssociation = new aws.ec2.RouteTableAssociation(
    "pub-subnet-routetable-assocation",
    {
        routeTableId: pubRouteTable.id,
        subnetId: pubSubnet.id,
    },
    { provider: awsProvider }
);
