# base image
FROM node:8.9.1

# copy application to docker container

COPY . /isodist
WORKDIR /isodist

#npm login

RUN npm install


# # execute command to start server
CMD ["npm","run","start"]