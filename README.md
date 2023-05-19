```
docker build -t az-blob-npm-serve:local .
docker run -e ACCOUNT='' -e ACCOUNT_KEY='' -e CONTAINER_NAME='' -p 3000:3000 az-blob-npm-serve:local
```