#!/bin/bash

exec >/tmp/output 2>&1
set -x

version="%VERSION%"
trustgraph=/usr/local/trustgraph

export DEBIAN_FRONTEND=noninteractive

apt update
apt upgrade

apt install -y python3 python3-pip unzip python3-venv
pip install --break-system-packages awscli

apt install -y podman-docker podman-compose

apt install -y wget

# Turn off docker warning
touch /etc/containers/nodocker

# install docker-compose.yaml
# grafana
# prometheus

mkdir -p ${trustgraph}
mkdir ${trustgraph}/deploy
mkdir ${trustgraph}/deploy/prometheus
mkdir ${trustgraph}/deploy/grafana
mkdir ${trustgraph}/deploy/grafana/dashboards
mkdir ${trustgraph}/deploy/grafana/provisioning

python3 -m venv ${trustgraph}/env
. ${trustgraph}/env/bin/activate

pip install trustgraph-cli==${version}

repo=https://raw.githubusercontent.com/trustgraph-ai/trustgraph/
repo_raw=${repo}/refs/tags/v${version}

wget -q -O- ${repo_raw}/prometheus/prometheus.yml \
     > ${trustgraph}/deploy/prometheus/prometheus.yml

wget -q -O- ${repo_raw}/grafana/dashboards/dashboard.json \
     > ${trustgraph}/deploy/grafana/dashboards/dashboard.json

wget -q -O- ${repo_raw}/grafana/provisioning/datasource.yml \
     > ${trustgraph}/deploy/grafana/provisioning/datasource.yml

wget -q -O- ${repo_raw}/grafana/provisioning/dashboard.yml \
     > ${trustgraph}/deploy/grafana/provisioning/dashboard.yml

chcon -Rt svirt_sandbox_file_t ${trustgraph}/deploy

bucket="%BUCKET%"
key="%KEY%"

cd /usr/local/trustgraph/deploy

aws s3 cp "s3://${bucket}/${key}" docker-compose.yaml

podman-compose -f docker-compose.yaml pull

podman-compose -f docker-compose.yaml up -d

