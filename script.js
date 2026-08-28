/* The Ink Culture — nav + booking form */
(function () {
  'use strict';

  /* ------------------------------------------------------------ mobile nav */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setNav(open) {
    if (!toggle || !nav) return;
    nav.setAttribute('data-open', open ? 'true' : 'false');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(nav.getAttribute('data-open') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNav(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setNav(false);
    });
  }

  /* ------------------------------------------------------------ hero video */

  var hero = document.querySelector('.hero__video');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  if (hero && still && still.matches) {
    hero.removeAttribute('autoplay');
    hero.pause();
  }

  /* --------------------------------------------------------- booking form */

  var form = document.querySelector('.booking');
  if (!form) return;

  var note = form.querySelector('[data-form-note]');
  var button = form.querySelector('[data-submit]');

  var COPY = {
    idle:    'A deposit holds your date.',
    sending: 'Sending…',
    sent:    "Thanks — we'll be in touch within two business days.",
    invalid: 'Add your name and a valid email so we can reply.',
    failed:  "That didn't send. Email studio@theinkculture.com and we'll pick it up there."
  };

  function say(message, state) {
    if (!note) return;
    note.textContent = message;
    if (state) note.setAttribute('data-state', state);
    else note.removeAttribute('data-state');
  }

  // Clear the invalid flag as soon as a field is corrected.
  form.addEventListener('input', function (e) {
    if (e.target.checkValidity && e.target.checkValidity()) {
      e.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll('.field__input');
    var firstInvalid = null;

    Array.prototype.forEach.call(fields, function (field) {
      if (field.checkValidity()) {
        field.removeAttribute('aria-invalid');
      } else {
        field.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      say(COPY.invalid, 'error');
      firstInvalid.focus();
      return;
    }

    // No endpoint wired up yet: mirror the designed "sent" state so the
    // interaction is complete, and let the studio wire `action` when ready.
    if (!form.getAttribute('action')) {
      markSent();
      return;
    }

    say(COPY.sending);
    if (button) button.disabled = true;

    fetch(form.getAttribute('action'), {
      method: form.getAttribute('method') || 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        markSent();
      })
      .catch(function () {
        if (button) button.disabled = false;
        say(COPY.failed, 'error');
      });
  });

  function markSent() {
    if (button) {
      button.textContent = 'Request sent';
      button.disabled = true;
    }
    say(COPY.sent);
    form.querySelectorAll('.field__input').forEach(function (field) {
      field.readOnly = true;
    });
  }
})();
