document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const planoId = parseInt(params.get('plano_id') || '0');
  const method = params.get('method') || 'cartao';
  const preco = parseFloat(params.get('preco') || '0');
  const tier = params.get('tier') || 'mensal';

  const ckPlano = document.getElementById('ck_plano');
  const ckPreco = document.getElementById('ck_preco');
  const ckDuracao = document.getElementById('ck_duracao');
  const ckMetodo = document.getElementById('ck_metodo');

  const secCartao = document.getElementById('sec_cartao');
  const secPix = document.getElementById('sec_pix');

  // Carregar dados do plano para exibir nome e duração
  (async function loadPlano(){
    try {
      const res = await fetch('/api/planos/');
      const data = await res.json();
      const planos = Array.isArray(data) ? data : data.results || [];
      const p = planos.find(x => x.id === planoId);
      if (p) {
        ckPlano.textContent = p.nome;
        ckPreco.textContent = `R$ ${(p.preco ?? preco).toFixed(2)}`;
        ckDuracao.textContent = `${p.duracao_dias} dias`;
      } else {
        ckPlano.textContent = `Plano #${planoId}`;
        ckPreco.textContent = `R$ ${preco.toFixed(2)}`;
        ckDuracao.textContent = '- dias';
      }
    } catch(_) {
      ckPlano.textContent = `Plano #${planoId}`;
      ckPreco.textContent = `R$ ${preco.toFixed(2)}`;
    }
  })();

  ckMetodo.textContent = (window.SALES_CONFIG.labels[method] || method);
  secCartao.style.display = method === 'cartao' ? 'block' : 'none';
  secPix.style.display = method === 'pix' ? 'block' : 'none';

  // Botão de pagar cartão (simulação)
  document.getElementById('btn_pagar_cartao').addEventListener('click', function() {
    alert('Pagamento por cartão simulado. Integre seu gateway no checkout.js.');
    window.location.href = '/portal/';
  });

  // Botão de gerar PIX (simulação)
  document.getElementById('btn_gerar_pix').addEventListener('click', function() {
    const txt = document.getElementById('pix_copy');
    const dummyCode = `00020126360014BR.GOV.BCB.PIX0114+5547999999995204000053039865802BR5913ATHLETECH LTDA6009SAO PAULO62070503***6304ABCD`;
    txt.value = dummyCode;
    const img = document.getElementById('pix_qr');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(dummyCode)}`;
    img.style.display = 'block';
  });
});

