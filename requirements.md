# 要件定義書: MetaMask ネットワーク設定 追加/編集ページ（XANAChain）

## 1. 目的
- ブラウザ上のボタンを1回押すだけで、MetaMask に XANAChain のネットワーク設定を追加または既存設定を編集できるようにする。
- 処理結果（追加または変更）をユーザーに明確に通知する。

## 2. 対象範囲
- 単一の静的 Web ページ（HTML/JS/CSS）。
- MetaMask 拡張（EIP-1193 準拠）のあるデスクトップ/モバイルブラウザ。

## 3. 前提・制約
- MetaMask の Ethereum Provider（`window.ethereum`）が利用可能であること。
- 追加は `wallet_addEthereumChain`（EIP-3085）を使用し、必要に応じて `wallet_switchEthereumChain` を併用する。
- MetaMask の仕様上、Dapp から既存ネットワーク一覧や既存 RPC URL の取得・直接編集はできないため、同一 ChainID の追加や既存設定に対しては MetaMask 側のダイアログにより「追加/既存/変更」の確認・反映が行われる。
- RPC URL の末尾スラッシュは同一と見なす（例: `https://mainnet.xana.net/rpc` と `https://mainnet.xana.net/rpc/`）。
- ネットワーク追加・変更の確定はユーザーの承認が必須（サイレント適用不可）。

## 4. 設定値（XANAChain）
- ネットワーク名: `XANAChain`
- デフォルト RPC URL: `https://mainnet.xana.net/rpc/`
- チェーンID: `8999`（16進: `0x2327`）
- 通貨記号: `XETA`（小数桁: 18 を想定）
- ブロックエクスプローラー URL: `https://xanachain.xana.net`

`wallet_addEthereumChain` 例（実装参考）:
```js
await ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x2327',
    chainName: 'XANAChain',
    nativeCurrency: { name: 'XETA', symbol: 'XETA', decimals: 18 },
    rpcUrls: ['https://mainnet.xana.net/rpc/'],
    blockExplorerUrls: ['https://xanachain.xana.net']
  }]
});
```

## 5. 機能要件
- 追加/編集ボタン: ページにボタンを1つ配置し、クリックで設定追加/編集フローを開始する。
- 既存設定の扱い:
  - 入力（固定値）RPC URL を正規化（末尾の `/` を除去）し、API 呼び出し前に同値とみなす。
  - 既存に同一 RPC URL の設定がある場合は、その設定を「変更」する想定とし、`wallet_addEthereumChain` の呼び出しにより MetaMask の確認ダイアログで更新・反映される。
- 結果通知: 実行後、画面上に「追加しました」または「変更しました」等のステータスメッセージを表示する。
- エラーハンドリング:
  - MetaMask 未導入/`window.ethereum` 不在 → 導入案内メッセージを表示。
  - ユーザーがダイアログを拒否 → 処理中断と通知。
  - 既に同一 ChainID が存在 → MetaMask の挙動に従い、必要なら `wallet_switchEthereumChain` を案内または実行。
- オプション: 成功時に XANAChain へ自動スイッチ（`wallet_switchEthereumChain`）。

## 6. 画面/UI 要件
- ボタン: `MetaMask に XANAChain を追加/更新`（ラベル例）。
- ステータス表示領域: 成功/失敗/案内メッセージを1行で表示。
- 補足テキスト: 何が行われるか（ネットワーク追加/編集）と要件（MetaMask 必須）を短文で記載。
- アクセシビリティ: キーボード操作可（Enter/Space で押下）、適切な `aria-live` でステータス通達。

## 7. 非機能要件
- セキュリティ: 外部にユーザーデータ送信なし。通信は MetaMask とのみ。
- 互換性: 最新版 Chrome/Brave/Edge/Firefox の MetaMask 環境で動作。
- パフォーマンス: ページロード < 100KB（目安）、遅延スクリプト読込。
- 可用性: 依存 CDN なし（スタンドアロン）。

## 8. 仕様上の注意（制約の明文化）
- MetaMask は Dapp に既存ネットワーク一覧/API を提供していないため、「同一の RPC URL が既に設定されているか」の厳密判定はできない。
  - 本ページでは、ユーザー体験として「同一設定の場合は変更する」ことを満たすため、常に `wallet_addEthereumChain` を用いて設定を提示し、MetaMask の確認ダイアログで追加/更新/既存確認を行う。
  - RPC URL の末尾スラッシュは UI/ロジック上で同一視する（正規化）。

## 9. 正常系シナリオ（受け入れ基準）
- 初回未登録:
  - ボタン押下 → MetaMask が `XANAChain` 追加ダイアログを表示 → 承認でネットワークが追加される → 画面に「追加しました」と表示。
- 既存（同一 ChainID=8999）:
  - ボタン押下 → MetaMask が既存扱いのダイアログ/完了通知を行う → 必要に応じて設定が更新される → 画面に「変更しました」または「既に設定済み」と表示。
- 末尾スラッシュ差分:
  - `.../rpc` と `.../rpc/` は同一と扱い、結果通知は「変更しました」または「既に設定済み」。

## 10. 例外系シナリオ（受け入れ基準）
- MetaMask 未導入: インストール案内を表示し、処理は実行しない。
- ユーザー拒否: ダイアログ拒否時は「ユーザーによりキャンセルされました」と表示。
- プロバイダーエラー: エラー内容の要約を表示（詳細はコンソール）。

## 11. 実装メモ（擬似コード）
```js
const TARGET = {
  chainId: '0x2327',
  chainName: 'XANAChain',
  nativeCurrency: { name: 'XETA', symbol: 'XETA', decimals: 18 },
  rpcUrl: 'https://mainnet.xana.net/rpc/',
  blockExplorerUrl: 'https://xanachain.xana.net'
};

const normalize = (u) => u.replace(/\/$/, '');

async function addOrUpdate() {
  const eth = window.ethereum;
  if (!eth) { show('MetaMask をインストールしてください'); return; }

  const params = [{
    chainId: TARGET.chainId,
    chainName: TARGET.chainName,
    nativeCurrency: TARGET.nativeCurrency,
    rpcUrls: [TARGET.rpcUrl],
    blockExplorerUrls: [TARGET.blockExplorerUrl]
  }];

  try {
    // 末尾スラッシュを同一視（UI/ログ用）
    const normalizedRpc = normalize(TARGET.rpcUrl);

    await eth.request({ method: 'wallet_addEthereumChain', params });

    // 追加or更新後に任意でスイッチ
    try { await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: TARGET.chainId }] }); } catch {}

    // 成功通知（追加/変更の厳密区別は MetaMask のダイアログに準拠）
    show('XANAChain の設定を追加/変更しました');
  } catch (e) {
    if (e && e.code === 4001) {
      show('ユーザーによりキャンセルされました');
    } else {
      show('設定に失敗しました（詳細はコンソール）');
      console.error(e);
    }
  }
}
```

## 12. 納品物
- `index.html`（1ボタンとステータス表示）
- `main.js`（上記ロジック）
- `styles.css`（任意の簡易スタイル）
- 環境変数やサーバー不要、ローカルで開いて動作検証可能。

## 13. 文言例
- ボタン: `MetaMask に XANAChain を追加/更新`
- 成功: `XANAChain の設定を追加/変更しました`
- 既存: `XANAChain は既に設定されています`
- 拒否: `ユーザーによりキャンセルされました`
- 未導入: `MetaMask をインストールしてからお試しください`

## 14. テスト観点要約
- 初回追加成功、再実行時の挙動、末尾スラッシュ差分、拒否・未導入時の表示、主要ブラウザでの MetaMask 連携確認。
