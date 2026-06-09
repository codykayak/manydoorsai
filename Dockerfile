FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . .

ARG VITE_PM_BASE_PATH=/
ARG VITE_PM_SITE_URL=https://www.manydoorsai.com
ARG VITE_PM_CHAT_URL=https://us-central1-realestate-map-23692.cloudfunctions.net/pmGatewayChat

ENV VITE_PM_BASE_PATH=$VITE_PM_BASE_PATH
ENV VITE_PM_SITE_URL=$VITE_PM_SITE_URL
ENV VITE_PM_CHAT_URL=$VITE_PM_CHAT_URL

RUN npm run build

FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
