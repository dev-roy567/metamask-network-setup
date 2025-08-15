(() => {
  // Centralized message catalog (ID -> text)
  // Messages support simple placeholders like {chainName}
  const MESSAGES = {
    MSG_METAMASK_REQUIRED: 'MetaMask をインストールしてからお試しください。',
    MSG_ALREADY_CONFIGURED: '{chainName} は既に設定されています。',
    MSG_USER_REJECTED: 'ユーザーによりキャンセルされました。',
    MSG_ADDED_OR_UPDATED: '{chainName} の設定を追加/変更しました。',
    MSG_ENV_ISSUES:
      '下記のいずれかの状況と思われます。\n- MetaMask がインストールされていない\n- MetaMask 以外のウォレットが選択されている\n- 対象のチェーンは既に設定済み'
  };

  const CONFIG = {
    chainIdHex: '0x2327', // 8999
    chainName: 'XANAChain',
    nativeCurrency: { name: 'XETA', symbol: 'XETA', decimals: 18 },
    rpcUrl: 'https://mainnet.xana.net/rpc/',
    blockExplorerUrl: 'https://xanachain.xana.net'
  };

  const normalize = (u) => (u || '').replace(/\/$/, '');

  const $status = () => document.getElementById('status');
  const show = (msg, type = 'info') => {
    const el = $status();
    if (!el) return;
    el.textContent = msg;
    el.className = `status ${type}`;
  };
  const render = (tpl, ctx) => (tpl || '').replace(/\{(\w+)\}/g, (_, k) => (ctx && ctx[k] != null ? ctx[k] : ''));
  const showMessage = (id, type = 'info', ctx) => {
    const tpl = MESSAGES[id] || '';
    const withDefaults = { chainName: CONFIG.chainName, ...(ctx || {}) };
    show(render(tpl, withDefaults), type);
  };

  async function addOrUpdate() {
    const eth = window.ethereum;
    if (!eth) {
      showMessage('MSG_METAMASK_REQUIRED', 'error');
      return;
    }

    const addParams = [{
      chainId: CONFIG.chainIdHex,
      chainName: CONFIG.chainName,
      nativeCurrency: CONFIG.nativeCurrency,
      rpcUrls: [CONFIG.rpcUrl],
      blockExplorerUrls: [CONFIG.blockExplorerUrl]
    }];

    // スイッチを試み、既存判定を行う
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONFIG.chainIdHex }]
      });
      showMessage('MSG_ALREADY_CONFIGURED', 'info');
      return;
    } catch (switchErr) {
      // 4902: 未登録。その他は後段の add を試す。
      if (switchErr && (switchErr.code === 4001)) {
        showMessage('MSG_USER_REJECTED', 'info');
        return;
      }
    }

    try {
      // 末尾スラッシュは同一と扱う
      const normalized = normalize(CONFIG.rpcUrl);
      console.debug('Using RPC URL:', normalized);

      await eth.request({ method: 'wallet_addEthereumChain', params: addParams });

      // 追加/更新後にネットワークをスイッチ（任意）
      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CONFIG.chainIdHex }] });
      } catch {}

      showMessage('MSG_ADDED_OR_UPDATED', 'ok');
    } catch (e) {
      if (e && (e.code === 4001 || e.code === 'ACTION_REJECTED')) {
        showMessage('MSG_USER_REJECTED', 'info');
      } else {
        showMessage('MSG_ENV_ISSUES', 'info');
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('addBtn');
    if (btn) btn.addEventListener('click', addOrUpdate);
    const headerCta = document.getElementById('ctaHeader');
    if (headerCta) {
      headerCta.addEventListener('click', addOrUpdate);
      headerCta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          addOrUpdate();
        }
      });
    }
    // 初期表示メッセージは無し
  });
})();
