FROM denoland/deno:1.42.0
WORKDIR /app
COPY . .
CMD ["run", "--allow-net", "--allow-env", "server/main.ts"]
