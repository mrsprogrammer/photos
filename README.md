# photos [WIP]

Monorepo with two modules:

- frontend: Next.js + TypeScript client app
- backend: NestJS + TypeScript server

Deployment:
- docker-compose.prod.yml and Dockerfiles included.
- scripts/bootstrap-ec2.sh for bootstrapping an EC2 instance.

Ignored files: *.pem, node_modules, .env, build artifacts.


## Deployment and Hosting

- Live site: https://my-photo-album.pl/
- Hosting: this project is deployed to an AWS EC2 instance.
- Containerization: the project uses Docker and Docker Compose for building and running the frontend and backend services.

