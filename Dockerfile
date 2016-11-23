FROM fedora:24
MAINTAINER Michael Clayton <mclayton@redhat.com>

ENV LANG en_US.utf8

RUN dnf update -yv
RUN dnf groupinstall -vy development-tools rpm-development-tools c-development
RUN dnf install -vy nodejs js-devel fedora-packager gcc-c++ git
RUN dnf clean all

RUN npm install -g grunt-cli bower uglify-js

RUN cd $HOME
RUN rpmdev-setuptree
