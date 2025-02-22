
# How to get TrustGraph working in an AWS workshop

Written from a Macbook viewpoint.  Windows is similar but you'll have to
work out how to get things installed.

We're going to install a few software tools.

## Xcode

If you don't have X-code installed 

xcode-select --install
Click Install
Wait until it says 'command line tools installed'

Homebrew:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Hit RETURN


Following homebrew instructions:
echo >> /Users/whatever/.zprofile
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> /Users/whatever/.zprofile
eval "$(/usr/local/bin/brew shellenv)"


# Install node if you don't already have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 22



brew install pulumi


mkdir ~/trustgraph-deploy
cd ~/trustgraph-deploy
git clone https://github.com/trustgraph-ai/pulumi-trustgraph-ec2
cd pulumi-trustgraph-ec2





----------------------------------------------------------------------------

Prepare Pulumi...


# Setup Pulumi

cd pulumi
npm install
pulumi login --local





# Preparation...
# You will need...
# AWS access key ID (like a username)
# AWS secret key (like a password)

# Log into the AWS console

# Select us-west-2 region (Oregon).  The region selector is at the top,
# near the right-hand side of the screen.

# Search for Bedrock in the resource search bar, at the top of the screen,
# left hand side, select 'Amazon Bedrock'

# - On the Bedrock screen look for Model Access on the LHS.
# - Select Modify Model Access
# - You're looking for Haiku 3.5
# - Tick the model, click Next bottom right
# - Continue through the dialogues until you Submit
# - The model should change from requested to available, takes a couple of
#   minutes



export PULUMI_CONFIG_PASSPHRASE=''
export AWS_ACCESS_KEY_ID=[key]
export AWS_SECRET_ACCESS_KEY=[key]

pulumi stack init analysis






pulumi up

# Should offer you a prompt about deployment, 
# Say yes (type y and hit RETURN)

# Pulumi shows you the private IP address, and also creates a private key
# file

# This is needed to make SSH access the file...
chmod 600 ssh-private.key


ssh -i ssh-private.key ubuntu@x.x.x.x


You should get a prompt like...

   ubuntu@ip-172-38-49-223:~$ 

Some stuff starts to get installed, you can track it...

  tail -f /tmp/output

Track the log until things come to a halt.

Last bit of text should be launching something called zookeeper, the details
aren't important, the install completed.

Ctrl-C to get back to the prompt.  Type 'exit' to log out of SSH.

More complex SSH command...

ssh -L 3000:0:3000 -L 8088:0:8088 -L 8888:0:8888 -i ssh-private.key ubuntu@52.37.227.83

This is the same as the last, but there are _three_ new -L option statements
for port numbers 3000, 8088 and 8888.

You can log into http://localhost:3000 and look at the TrustGraph dashboard.
Login admin/admin, skip the password change.  Select TrustGraph dashbnoard








 TrustGraph + Memgraph workshop © 2025 by TrustGraph is licensed under CC BY-SA 4.0 

