/* script.js - comportamento interativo e acessível */
document.addEventListener('DOMContentLoaded', () => {
  // ------- Helpers -------
  const qs = (sel, ctx=document) => ctx.querySelector(sel);
  const qsa = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

  // Hamburger toggle for mobile menus (handles multiple headers)
  qsa('.hamburger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      // target sibling menu (closest nav)
      const nav = btn.closest('.nav');
      const menu = qs('.menu', nav) || qs('#menu-principal', nav);
      if(menu){
        if(!expanded){ menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); btn.setAttribute('aria-label','Fechar menu'); }
        else { menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); btn.setAttribute('aria-label','Abrir menu'); }
      }
    });
  });

  // Submenu toggles
  qsa('.has-submenu').forEach(item => {
    const toggle = qs('.submenu-toggle', item);
    const submenu = qs('.submenu', item);
    if(toggle && submenu){
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        item.setAttribute('aria-expanded', String(!expanded));
      });
    }
  });

  // Global: close mobile menu on link click
  qsa('.menu a').forEach(a => a.addEventListener('click', () => {
    qsa('.menu.open').forEach(m => m.classList.remove('open'));
    qsa('.hamburger').forEach(h => h.setAttribute('aria-expanded','false'));
  }));

  // Toast and Modal utilities
  const toastEl = qs('#toast');
  function showToast(msg, ms=3000){
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    setTimeout(()=> { toastEl.hidden = true; }, ms);
  }

  const modal = qs('#modal');
  const modalClose = modal ? qs('.modal-close', modal) : null;
  function openModal(title, message){
    if(!modal) return;
    qs('#modal-title', modal).textContent = title;
    qs('#modal-message', modal).textContent = message;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    if(!modal) return;
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

  // Form validation (Contato)
  const form = qs('#contact-form');
  if(form){
    const fields = {
      name: {el: qs('#name', form), validators: [v => v.trim().length>=2 || 'Nome muito curto']},
      email:{el: qs('#email', form), validators: [v => /\S+@\S+\.\S+/.test(v) || 'E-mail inválido']},
      subject:{el: qs('#subject', form), validators: [v => v.trim().length>0 || 'Assunto obrigatório']},
      message:{el: qs('#message', form), validators: [v => v.trim().length>=10 || 'Mensagem deve ter ao menos 10 caracteres']},
    };

    function showFieldError(field, msg){
      const err = field.el.parentElement.querySelector('.error');
      if(err) err.textContent = msg || '';
      if(msg){
        field.el.setAttribute('aria-invalid','true');
        field.el.classList.add('invalid');
      } else {
        field.el.removeAttribute('aria-invalid');
        field.el.classList.remove('invalid');
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      Object.values(fields).forEach(f => {
        const v = f.el.value || '';
        for(const fn of f.validators){
          const res = fn(v);
          if(res !== true){
            showFieldError(f, res);
            valid = false;
            break;
          } else {
            showFieldError(f, '');
          }
        }
      });

      if(!valid){
        showToast('Por favor, corrija os campos em destaque', 2500);
        return;
      }

      // Simular envio — aqui você integraria com backend ou serviço de email
      showToast('Enviando mensagem...', 2000);
      setTimeout(()=>{
        openModal('Mensagem enviada', 'Obrigado! Entraremos em contato em até 48 horas.');
        form.reset();
      }, 1000);
    });

    // Live validation on blur
    Object.values(fields).forEach(f => {
      f.el.addEventListener('blur', () => {
        const v = f.el.value || '';
        for(const fn of f.validators){
          const res = fn(v);
          if(res !== true) { showFieldError(f, res); return; }
          showFieldError(f, '');
        }
      });
    });
  }

  // keyboard: ESC closes modal
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') { closeModal(); }
  });

  // Simple A11y: ensure first focusable in modal
  if(modal){
    modal.addEventListener('transitionend', () => {
      if(modal.getAttribute('aria-hidden') === 'false'){
        const focusable = modal.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if(focusable) focusable.focus();
      }
    });
  }

  // log
  console.log('script.js inicializado — interações carregadas.');
});