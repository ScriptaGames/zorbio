# Zorbio

Absorb the Orbs!

![Huge zorbio orb](./preview.png)

## Install

Install package dependancies:

    dnf install nodejs gcc-c++
    
Optional dependancies:

If you want to use the backend service to App42 you'll need php

    dnf install php

After cloning the repository, cd into it and install dependencies:

    npm install

Configure default settings in `common/config.js` and environmental overrides based in `common/environment.js` note anything in this file will override what is in `common/config.js`


## Hacking

To launch a local dev server:

    npm run start-dev

To test the minified inlined index.html run:
    
    npm run build-dev
    npm run start-dev-dist

## DevOps

### Build

1. Update the `version` and `build` fields in package.json.

2. perform a production build:

       npm run build-prod
       
3. Commit your changes to master and push.
4. `git checkout prod` and `git merge master` to merge your changes into the `prod` branch.
5. `git push origin prod`
6. `oc start-build zorbio-prod` to start the OpenShift builder based on the `Dockerfile` NOTE you'll have to had done an `oc login` first. You can copy the login command from the top right in the OpenShift console under Command Line Tools
7. (optional) Cut a tag

        git tag n.n.n-n
        git push --tags

### Deploy

Once the OpenShift build is complete in the step above, OpenShift will automatically deploy the new image and make it live.

### OpenShift 4 config notes

Creating config maps for tls files

    oc set volume deployment/zorbio --add -m /etc/pki/tls/certs/zorb.io.pem --sub-path=zorb.io.pem --configmap-name=zorbio-tls -t configmap
    
Mounting the configmaps on the at a path

    oc set volume deployment/zorbio --add -m /etc/pki/tls/private/zorb.io.key --sub-path=zorb.io.key --configmap-name=zorbio-tls -t configmap
    oc set volume deployment/zorbio --add -m /etc/pki/tls/certs/zorb.io.pem --sub-path=zorb.io.pem --configmap-name=zorbio-tls -t configmap    
    
The above pattern could be used for any configmap that you need

Then use the config maps by updating the `Deployment` YAML using the following stanzas to create the config map volumns, mount them at the right path, and environment variables:

    spec:
      volumes:
        - name: volume-zorbio-key
          configMap:
            name: zorbio-tls
            defaultMode: 420
        - name: volume-zorbio-pem
          configMap:
            name: zorbio-tls
            defaultMode: 420
      containers:
        - name: zorbio-prod
          env:
            - name: ZOR_ENV
              value: prod
            - name: APP42_API_KEY
              value: <secret>
            - name: APP42_API_SECRET
              value: <secret>
          volumeMounts:
            - name: volume-zorbio-key
              mountPath: /etc/pki/tls/private/zorb.io.key
              subPath: zorb.io.key
            - name: volume-zorbio-pem
              mountPath: /etc/pki/tls/certs/zorb.io.pem
              subPath: zorb.io.pem




