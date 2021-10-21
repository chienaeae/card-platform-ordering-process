FROM public.ecr.aws/bitnami/node:14-prod-debian-10

COPY dist ./dist
COPY node_modules ./node_modules
COPY package.json ./

CMD ["npm", "start"]