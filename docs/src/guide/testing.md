# テスト

以下のような`add.ais`ファイルについて、
`add`関数が正常に機能するかをテストすることを考えます。
```aiscript
@add(a: num, b: num): num {
    a + b
}
```

`aisenv.config.js`の内容を以下のように書き換えます。
```js
/** @type {import('aisenv').Config} */
export default ({
    test: {
        include: ['*.test.ais'],
    }
});
```

テストファイルとして以下の内容を`add.test.ais`という名前で保存します。
```aiscript
### imports [
    './add.ais'
]

@assert_eq(left: any, right: any): void {
    if (left != right) {
        Core:abort(`assertion failed: left = {left}, right = {right}`)
    }
}

#[test]
@addTest() {
    assert_eq(2 + 3, 5)
}
```

以下のコマンドでテストを実行できます。
```sh
npx aisenv test
```

## `"should_abort"`
関数の実行が途中で強制終了することを期待するなら、
以下のように`test`属性に`"should_abort"`を指定します。
```aiscript
### imports [
    './add.ais'
]

#[test "should_abort"]
@test() {
  add(1)
}
```
