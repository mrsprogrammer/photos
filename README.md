# photos

Monorepo with two modules:

- frontend: Next.js + TypeScript client app
- backend: NestJS + TypeScript server

Deployment:
- docker-compose.prod.yml and Dockerfiles included.
- scripts/bootstrap-ec2.sh for bootstrapping an EC2 instance.

Ignored files: *.pem, node_modules, .env, build artifacts.

