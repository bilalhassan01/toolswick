// invoice-generator.js - Client-Side Invoice Generator with Print/PDF Export
(function () {
  'use strict';

  function init() {
    const itemsTableBody = document.getElementById('invItemsBody');
    const addItemBtn = document.getElementById('invAddItemBtn');
    const currencySelect = document.getElementById('invCurrency');
    const taxRateInput = document.getElementById('invTaxRate');
    const discountInput = document.getElementById('invDiscount');
    const shippingInput = document.getElementById('invShipping');

    const subtotalEl = document.getElementById('invSubtotal');
    const taxAmountEl = document.getElementById('invTaxAmount');
    const discountAmountEl = document.getElementById('invDiscountAmount');
    const grandTotalEl = document.getElementById('invGrandTotal');

    const logoInput = document.getElementById('invLogoInput');
    const logoImg = document.getElementById('invLogoPreview');
    const printBtn = document.getElementById('invPrintBtn');

    if (!itemsTableBody) return;

    let currencySymbol = '$';

    function recalculate() {
      currencySymbol = currencySelect ? currencySelect.value : '$';
      let subtotal = 0;

      const rows = itemsTableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const qtyInput = row.querySelector('.inv-item-qty');
        const rateInput = row.querySelector('.inv-item-rate');
        const amountEl = row.querySelector('.inv-item-amount');

        const qty = parseFloat(qtyInput ? qtyInput.value : 0) || 0;
        const rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
        const amount = qty * rate;
        subtotal += amount;

        if (amountEl) {
          amountEl.textContent = `${currencySymbol}${amount.toFixed(2)}`;
        }
      });

      const taxRate = parseFloat(taxRateInput ? taxRateInput.value : 0) || 0;
      const discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
      const shipping = parseFloat(shippingInput ? shippingInput.value : 0) || 0;

      const taxAmount = (subtotal * taxRate) / 100;
      const total = Math.max(0, subtotal + taxAmount + shipping - discount);

      if (subtotalEl) subtotalEl.textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
      if (taxAmountEl) taxAmountEl.textContent = `${currencySymbol}${taxAmount.toFixed(2)}`;
      if (discountAmountEl) discountAmountEl.textContent = `-${currencySymbol}${discount.toFixed(2)}`;
      if (grandTotalEl) grandTotalEl.textContent = `${currencySymbol}${total.toFixed(2)}`;
    }

    function addItem(desc = '', qty = 1, rate = 0) {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border)';
      tr.innerHTML = `
        <td style="padding:8px;"><input type="text" class="inv-item-desc" placeholder="Item description" value="${desc}" style="width:100%;box-sizing:border-box;"></td>
        <td style="padding:8px;width:70px;"><input type="number" class="inv-item-qty" value="${qty}" min="1" step="1" style="width:100%;box-sizing:border-box;text-align:center;"></td>
        <td style="padding:8px;width:100px;"><input type="number" class="inv-item-rate" value="${rate}" min="0" step="0.01" style="width:100%;box-sizing:border-box;text-align:right;"></td>
        <td style="padding:8px;width:100px;text-align:right;font-weight:600;" class="inv-item-amount">${currencySymbol}0.00</td>
        <td style="padding:8px;width:40px;text-align:center;"><button type="button" class="btn ghost sm inv-item-del" style="color:var(--bad,#ef4444);padding:2px 6px;">✕</button></td>
      `;

      tr.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', recalculate);
      });

      tr.querySelector('.inv-item-del').addEventListener('click', () => {
        if (itemsTableBody.querySelectorAll('tr').length > 1) {
          tr.remove();
          recalculate();
        } else {
          if (window.TK && TK.toast) TK.toast('An invoice must have at least one line item.', 'warning');
        }
      });

      itemsTableBody.appendChild(tr);
      recalculate();
    }

    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => addItem());
    }

    if (currencySelect) currencySelect.addEventListener('change', recalculate);
    if (taxRateInput) taxRateInput.addEventListener('input', recalculate);
    if (discountInput) discountInput.addEventListener('input', recalculate);
    if (shippingInput) shippingInput.addEventListener('input', recalculate);

    if (logoInput && logoImg) {
      logoInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = ev => {
            logoImg.src = ev.target.result;
            logoImg.style.display = 'block';
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Initialize with 2 sample items
    addItem('Web Design & Development Consultation', 1, 1500.00);
    addItem('Cloud Infrastructure Setup & Security Audit', 1, 750.00);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
