


## VAPID 生成手順

```sh
npm i -g web-push
web-push generate-vapid-keys
# 表示された publicKey / privateKey を
# app.js と server.js の該当箇所へ貼り付け
```


## 起動

```sh
node server.js
```