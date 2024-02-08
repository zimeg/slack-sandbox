# Use the Ubtuntu base image
FROM ubuntu:22.04

# Prepare development tools
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get install -y unzip

# Install project runtimes
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
RUN apt-get install -y openjdk-18-jdk
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | sh
RUN apt-get install -y nodejs
RUN apt-get install -y python3

# Run the container without root permission
RUN useradd -m -s /bin/bash slackdev
RUN chown slackdev /usr/local/bin
USER slackdev

# Set the working directory
WORKDIR /workspaces

# Install the Slack CLI
RUN curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash