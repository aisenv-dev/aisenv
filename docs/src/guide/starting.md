# はじめる

## ローカルに導入する

### Node.jsのインストール
Node.jsの実行環境が必要です。
Node.jsがインストールされていない場合は、
[Node.jsの公式サイト](https://nodejs.org/)を参考に、
プラットフォームに合ったバージョンのNode.jsをインストールします。

### ディレクトリの作成
作業用のディレクトリを作成します。
ここではディレクトリ名を`hello-world`とします。

### `package.json`
以下の内容を入力したファイルを`package.json`という名前で保存します。
```json
{
  "name": "hello-world",
  "type": "module"
}
```

### aisenvとAiScriptのインストール
LinuxまたはmacOSのターミナル、もしくはWindowsのPowershellで以下の内容を入力します。
```sh
npm install --save-dev aisenv @syuilo/aiscript@1
```

### `aisenv.config.js`
以下の内容を入力したファイルを`aisenv.config.js`という名前で保存します。
```js
/** @type {import('aisenv').Config} */
export default ({
});
```

### AiScriptファイル
`hello-world`ディレクトリ内の`main.ais`ファイルに以下の内容を入力して保存します。
```aiscript
<: "Hello, world!"
```

### 実行
ターミナル上で以下の内容を入力します。
```sh
npx aisenv run main.ais
```
画面に`"Hello, world"`と出力されたはずです。
