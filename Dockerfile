FROM fedora

USER root

# Install system level dependancies
RUN yum install git nodejs npm php gcc-c++ -y

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install the node app production only dependancies
RUN npm ci --only=production

# Add application sources to the working directory minus the stuff in .dockerignore
COPY . .

# Set permissions so that the container runs without root access
RUN useradd -u 1001 appuser
RUN chown -R 1001:0 .
USER 1001

# Set the default command for the resulting image
CMD npm run -d start
