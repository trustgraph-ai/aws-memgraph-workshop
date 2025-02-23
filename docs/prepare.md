
# Prepare the TrustGraph deployment

This gets hold of the TrustGraph AWS deployment bundle.  It deploys an
AWS EC2 instance with an install script which does the complete TrustGraph
install.

One point to note is that the AWS EC2 instance comes up very quickly,
but the installation will be running in the background and takes a couple
more minutes, so make sure you track the installation to completion before
wondering why things aren't working.

## Clone the AWS deploy repo

This drops the deploy repo in `trustgraph-deploy` in your home directory,
but you can put it anywhere, the location isn't important.

```
mkdir ~/trustgraph-deploy
cd ~/trustgraph-deploy
git clone https://github.com/trustgraph-ai/aws-memgraph-workshop .
```

## Set up Pulumi

Pulumi is an infrastructure-as-code deployment tool, and this has been
used to create the deployment you are about to use.

```
cd pulumi
npm install
pulumi login --local
```

That last line tells Pulumi where to store its 'state'. If you were using
this for an operational deploy, you'd want to put the state somewhere that
other people can get to, like an S3 bucket, but for this workshop it doesn't
matter.  It says to put the state on your device.

## Set up the environment

You should set the AWS profile for your environment using the profile you
created earlier.

```
export AWS_PROFILE=workshop
```

Set the Pulumi config passphrase to the empty string.  This encrypts the
Pulumi state, and we don't need that for this workshop.

```
export PULUMI_CONFIG_PASSPHRASE=''
```

Finally, you have to initialise the Pulumi "stack" that we're going to
deploy:

```
pulumi stack init workshop
```

I should mention that this deploy creates a new VPC and installs the stuff
in that VPC.  If you're using an existing AWS account that you've used
for other things, you may find the IP address range we've chosen to use
conflicts with things you already have running.  The address range
is in `Pulumi.workshop.yaml` so modify the config in that file if you
get a conflict in the deploy.

