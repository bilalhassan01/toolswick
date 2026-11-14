// receipt-generator.js - Thermal POS Receipt Creator & Print Generator
(function () {
  'use strict';

  function init() {
    const storeNameInp = document.getElementById('rcStoreName');
    const storeAddrInp = document.getElementById('rcStoreAddr');
    const storePhoneInp = document.getElementById('rcStorePhone');
    const receiptNumInp = document.getElementById('rcReceiptNum');
    const cashierInp = document.getElementById('rcCashier');
    const taxRateInp = document.getElementById('rcTaxRate');
    const payMethodSel = document.getElementById('rcPayMethod');
    const cardLast4Inp = document.getElementById('rcCardLast4');
    const footerMsgInp = document.getElementById('rcFooterMsg');
    const currencySel = document.getElementById('rcCurrency');

    const itemsBody = document.getElementById('rcItemsBody');
    const addItemBtn = document.getElementById('rcAddItemBtn');
    const printBtn = document.getElementById('rcPrintBtn');

    // Thermal preview elements
    const pvStore = document.getElementById('pvStore');
    const pvAddr = document.getElementById('pvAddr');
    const pvPhone = document.getElementById('pvPhone');
    const pvNum = document.getElementById('pvNum');
    const pvDate = document.getElementById('pvDate');
    const pvCashier = document.getElementById('pvCashier');
    const pvItems = document.getElementById('pvItems');
    const pvSubtotal = document.getElementById('pvSubtotal');
    const pvTax = document.getElementById('pvTax');
    const pvTotal = document.getElementById('pvTotal');
    const pvPayment = document.getElementById('pvPayment');
    const pvFooter = document.getElementById('pvFooter');

    if (!itemsBody) return;

    let currency = '$';

    function updatePreview() {
      currency = currencySel ? currencySel.value : '$';
      if (pvStore) pvStore.textContent = (storeNameInp && storeNameInp.value) || 'RETAIL STORE';
      if (pvAddr) pvAddr.textContent = (storeAddrInp && storeAddrInp.value) || '123 Market St, City, ST';
      if (pvPhone) pvPhone.textContent = (storePhoneInp && storePhoneInp.value) ? `TEL: ${storePhoneInp.value}` : '';
      if (pvNum) pvNum.textContent = `REC#: ${(receiptNumInp && receiptNumInp.value) || '10042'}`;
      if (pvCashier) pvCashier.textContent = `CLERK: ${(cashierInp && cashierInp.value) || 'Alex'}`;
      if (pvDate) {
        const now = new Date();
        pvDate.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      }
      if (pvFooter) pvFooter.textContent = (footerMsgInp && footerMsgInp.value) || 'THANK YOU FOR YOUR PURCHASE!';

      // Items calculation
      let subtotal = 0;
      let itemsHtml = '';

      const rows = itemsBody.querySelectorAll('tr');
      rows.forEach(row => {
        const nameInp = row.querySelector('.rc-item-name');
        const qtyInp = row.querySelector('.rc-item-qty');
        const priceInp = row.querySelector('.rc-item-price');

        const name = (nameInp && nameInp.value) || 'Item';
        const qty = parseFloat(qtyInp ? qtyInp.value : 1) || 1;
        const price = parseFloat(priceInp ? priceInp.value : 0) || 0;
        const lineTotal = qty * price;
        subtotal += lineTotal;

        itemsHtml += `
          <div style="display:flex;justify-content:space-between;margin:2px 0;">
            <span>${qty > 1 ? qty + 'x ' : ''}${name}</span>
            <span>${currency}${lineTotal.toFixed(2)}</span>
          </div>
        `;
      });

      if (pvItems) pvItems.innerHTML = itemsHtml;

      const taxRate = parseFloat(taxRateInp ? taxRateInp.value : 0) || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const grandTotal = subtotal + taxAmount;

      if (pvSubtotal) pvSubtotal.textContent = `${currency}${subtotal.toFixed(2)}`;
      if (pvTax) pvTax.textContent = `${currency}${taxAmount.toFixed(2)}`;
      if (pvTotal) pvTotal.textContent = `${currency}${grandTotal.toFixed(2)}`;

      const method = payMethodSel ? payMethodSel.value : 'card';
      const last4 = (cardLast4Inp && cardLast4Inp.value) || '4242';
      if (pvPayment) {
        if (method === 'card') {
          pvPayment.textContent = `PAID VIA CARD ************${last4}`;
        } else {
          pvPayment.textContent = `PAID VIA CASH: ${currency}${grandTotal.toFixed(2)}`;
        }
      }
    }

    function addItem(name = '', qty = 1, price = 0) {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border)';
      tr.innerHTML = `
        <td style="padding:6px;"><input type="text" class="rc-item-name" placeholder="Item name" value="${name}" style="width:100%;box-sizing:border-box;"></td>
        <td style="padding:6px;width:60px;"><input type="number" class="rc-item-qty" value="${qty}" min="1" step="1" style="width:100%;box-sizing:border-box;text-align:center;"></td>
        <td style="padding:6px;width:90px;"><input type="number" class="rc-item-price" value="${price}" min="0" step="0.01" style="width:100%;box-sizing:border-box;text-align:right;"></td>
        <td style="padding:6px;width:30px;text-align:center;"><button type="button" class="btn ghost sm rc-item-del" style="color:var(--bad,#ef4444);padding:2px 6px;">✕</button></td>
      `;

      tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updatePreview));
      tr.querySelector('.rc-item-del').addEventListener('click', () => {
        if (itemsBody.querySelectorAll('tr').length > 1) {
          tr.remove();
          updatePreview();
        }
      });

      itemsBody.appendChild(tr);
      updatePreview();
    }

    if (addItemBtn) addItemBtn.addEventListener('click', () => addItem());

    [storeNameInp, storeAddrInp, storePhoneInp, receiptNumInp, cashierInp, taxRateInp, cardLast4Inp, footerMsgInp].forEach(inp => {
      if (inp) inp.addEventListener('input', updatePreview);
    });

    if (currencySel) currencySel.addEventListener('change', updatePreview);
    if (payMethodSel) payMethodSel.addEventListener('change', updatePreview);

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Default sample receipt items
    addItem('Artisan Espresso', 2, 4.50);
    addItem('Almond Croissant', 1, 4.25);
    addItem('Organic Green Tea', 1, 3.75);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
