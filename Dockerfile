FROM ubi8/nodejs-12

USER root

# Install system level dependancies
RUN yum install php -y

# Add application sources to a directory that the assemble script expects them
# and set permissions so that the container runs without root access
ADD . /tmp/src
RUN chown -R 1001:0 /tmp/src
USER 1001

# Install the node s2i app
RUN /usr/libexec/s2i/assemble

# Set the default command for the resulting image
CMD /usr/libexec/s2i/run
