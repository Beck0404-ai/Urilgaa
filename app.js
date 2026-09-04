(() => {
  const BASE = document.body.dataset.base || '';
  let PHOTOS = [];
  try { PHOTOS = JSON.parse(document.body.dataset.photos || '[]'); } catch { PHOTOS = []; }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const guard = (fn) => { try { fn(); } catch (_) { /* no-op */ } };

  // ---------- Language (kk <-> tr) ----------
  const LANG_KEY = 'shakyru.lang';
  const langBtn = document.getElementById('lang-toggle');
  const getLang = () => (document.documentElement.dataset.lang === 'tr' ? 'tr' : 'kk');
  const I18N = {
    kk: {
      months: ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар','7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'],
      photo: (n) => `Зураг ${n}`,
      wishN: (n) => `Сэтгэлийн үг ${n}`,
      wishLabel: 'сэтгэлийн үг',
      wishEmpty: 'Хамгийн анхны сэтгэлийн үгээ үлдээгээрэй ♡',
      needName: 'Нэрээ бичнэ үү',
      needWish: 'Сэтгэлийн үгээ бичнэ үү',
      needAttend: 'Хариултаа сонгоно уу',
      rsvpOk: 'Баярлалаа! Хариултыг хүлээн авлаа ♡',
      wishPending: 'Баярлалаа! Сэтгэлийн үг таныг шалгасны дараа нийтлэгдэнэ ♡',
      wishOk: 'Баярлалаа! Сэтгэлийн үгийг хүлээн авлаа ♡',
      tooOften: 'Хэт олон удаа илгээгдлээ. Дараа дахин оролдоно уу.',
      err: 'Алдаа гарлаа. Дахин оролдоно уу.',
      offline: 'Интернэт холболт байхгүй. Дахин оролдоно уу.',
      themeToDay: 'Өдрийн байдалд шилжих',
      themeToNight: 'Шөнийн байдалд шилжих',
      musicOn: 'Дууг тоглуулах',
      musicOff: 'Дууг зогсоох',
      langBtn: 'TR',
      langAria: 'Türkçeye geç',
    },
    tr: {
      months: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
      photo: (n) => `Fotoğraf ${n}`,
      wishN: (n) => `Dilek ${n}`,
      wishLabel: 'dileği',
      wishEmpty: 'İlk güzel dileği siz bırakın ♡',
      needName: 'Adınızı yazın',
      needWish: 'Dileğinizi yazın',
      needAttend: 'Bir yanıt seçin',
      rsvpOk: 'Teşekkürler! Yanıtınız alındı ♡',
      wishPending: 'Teşekkürler! Dileğiniz incelendikten sonra yayınlanacak ♡',
      wishOk: 'Teşekkürler! Dileğiniz alındı ♡',
      tooOften: 'Çok sık gönderildi. Lütfen daha sonra tekrar deneyin.',
      err: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      offline: 'İnternet bağlantısı yok. Lütfen tekrar deneyin.',
      themeToDay: 'Gündüz moduna geç',
      themeToNight: 'Gece moduna geç',
      musicOn: 'Müziği aç',
      musicOff: 'Müziği durdur',
      langBtn: 'ҚАЗ',
      langAria: 'Қазақ тіліне ауысу',
    },
  };
  const t = (k) => (I18N[getLang()] || I18N.kk)[k];
  const langSubs = [];
  const onLang = (fn) => { langSubs.push(fn); };
  const syncLangButton = () => {
    if (!langBtn) return;
    const cur = langBtn.querySelector('.lang-cur');
    if (cur) cur.textContent = t('langBtn');
    langBtn.setAttribute('aria-label', t('langAria'));
  };
  const applyLang = (lang) => {
    document.documentElement.dataset.lang = lang;
    document.documentElement.lang = lang;
    syncLangButton();
    langSubs.forEach((fn) => { try { fn(); } catch (_) {} });
  };
  syncLangButton();
  langBtn?.addEventListener('click', () => {
    const next = getLang() === 'tr' ? 'kk' : 'tr';
    try { localStorage.setItem(LANG_KEY, next); } catch (_) {}
    applyLang(next);
  });

  // ---------- Theme ----------
  const THEME_KEY = 'shakyru.theme';
  const themeBtn = document.getElementById('theme-toggle');
  const heroVideo = document.getElementById('hero-video');

  const getTheme = () => document.documentElement.dataset.theme || 'light';
  const syncThemeButton = () => {
    if (!themeBtn) return;
    const isDark = getTheme() === 'dark';
    themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeBtn.setAttribute('aria-label', isDark ? t('themeToDay') : t('themeToNight'));
  };
  const activateHeroVideo = () => {
    if (!heroVideo) return;
    if (!heroVideo.src && heroVideo.dataset.src) heroVideo.src = heroVideo.dataset.src;
    if (reduceMotion) return;
    heroVideo.play().catch(() => {});
  };
  const deactivateHeroVideo = () => { if (heroVideo) heroVideo.pause(); };
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    syncThemeButton();
    if (theme === 'dark') activateHeroVideo();
    else deactivateHeroVideo();
  };
  themeBtn?.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
    applyTheme(next);
  });
  syncThemeButton();
  onLang(syncThemeButton);

  // ---------- Reveal on scroll ----------
  const revealable = document.querySelectorAll('.card, .gallery, .countdown-card, .divider');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealable.forEach((el) => el.classList.add('is-visible'));
  } else {
    revealable.forEach((el) => el.classList.add('reveal'));
    const reveal = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); reveal.unobserve(e.target); }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealable.forEach((el) => reveal.observe(el));
  }

  // ---------- Decorative motion ----------
  if (!reduceMotion) {
    const starfield = document.getElementById('starfield');
    if (starfield) {
      const N = Math.max(40, Math.min(110, Math.round(window.innerWidth * window.innerHeight / 13000)));
      const frag = document.createDocumentFragment();
      for (let i = 0; i < N; i++) {
        const s = document.createElement('span');
        const size = Math.random() < 0.82 ? 1.4 : 2.6;
        s.style.left = (Math.random() * 100).toFixed(2) + '%';
        s.style.top = (Math.random() * 100).toFixed(2) + '%';
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.setProperty('--tw', (2.5 + Math.random() * 4).toFixed(2) + 's');
        s.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
        s.style.opacity = (0.3 + Math.random() * 0.6).toFixed(2);
        frag.appendChild(s);
      }
      starfield.appendChild(frag);
    }

    const dust = document.getElementById('hero-dust');
    if (dust) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('span');
        p.style.left = (Math.random() * 100).toFixed(2) + '%';
        p.style.setProperty('--dur', (7 + Math.random() * 7).toFixed(1) + 's');
        p.style.setProperty('--dx', (Math.random() * 40 - 20).toFixed(0) + 'px');
        p.style.animationDelay = (-Math.random() * 10).toFixed(1) + 's';
        const sz = (2 + Math.random() * 2).toFixed(1);
        p.style.width = sz + 'px'; p.style.height = sz + 'px';
        frag.appendChild(p);
      }
      dust.appendChild(frag);
    }
  }

  // ---------- Music ----------
  const music = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');
  let fadeTimer = null;
  const setPlaying = (playing) => {
    if (!musicBtn) return;
    musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', playing ? t('musicOff') : t('musicOn'));
  };
  const stopFade = () => { if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; } };
  const startMusic = async () => {
    if (!music || !music.paused) return;
    try {
      stopFade();
      music.volume = 0;
      await music.play();
      fadeTimer = setInterval(() => {
        if (music.paused) { stopFade(); return; }
        if (music.volume < 0.7) music.volume = Math.min(0.7, music.volume + 0.05);
        else stopFade();
      }, 80);
    } catch (e) { console.warn('music play failed', e); }
  };
  musicBtn?.addEventListener('click', async () => {
    if (!music) return;
    if (music.paused) {
      await startMusic();
    } else { stopFade(); music.pause(); }
  });
  music?.addEventListener('pause', () => { stopFade(); setPlaying(false); });
  music?.addEventListener('play', () => setPlaying(true));

  // ---------- Invitation gate ----------
  const introGate = document.getElementById('intro-gate');
  const introOpen = document.getElementById('intro-open');
  const INTRO_KEY = `shakyru.introGate.${BASE || 'root'}.v1`;

  const introCopy = document.getElementById('intro-copy');
  if (introCopy) {
    const label = (introCopy.dataset[getLang()] || introCopy.textContent).trim();
    introCopy.setAttribute('aria-label', label);
    const letters = document.createElement('span');
    letters.className = 'intro-copy-letters';
    letters.setAttribute('aria-hidden', 'true');
    Array.from(label).forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'intro-letter';
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      letters.appendChild(s);
    });
    introCopy.textContent = '';
    introCopy.appendChild(letters);
    introCopy.classList.add('is-floating');
  }
  if (introGate && introOpen) {
    let seenIntro = false;
    try { seenIntro = sessionStorage.getItem(INTRO_KEY) === 'true'; } catch (_) {}
    const forceIntro = new URLSearchParams(window.location.search).get('intro') === '1';

    const introPage = document.querySelector('.page');
    const setIntroLocked = (locked) => {
      document.body.classList.toggle('has-intro-gate', locked);
      if (introPage) introPage.inert = locked;
    };

    if (seenIntro && !forceIntro) {
      introGate.hidden = true;
    } else {
      setIntroLocked(true);
      let started = false;
      let revealed = false;

      const revealIntro = () => {
        if (revealed) return;
        revealed = true;
        try { sessionStorage.setItem(INTRO_KEY, 'true'); } catch (_) {}
        introGate.classList.add('is-blooming');
        document.body.classList.add('intro-revealing');
        setTimeout(() => introGate.classList.add('is-revealing'), 260);
        setTimeout(() => {
          introGate.hidden = true;
          setIntroLocked(false);
          document.body.classList.remove('intro-revealing');
          introGate.classList.remove('is-blooming', 'is-revealing');
        }, 1180);
      };

      const playIntro = async () => {
        if (started) return;
        started = true;
        introGate.classList.add('is-playing');
        startMusic();
        setTimeout(revealIntro, 900);
      };

      introOpen.addEventListener('click', playIntro);
    }
  }

  // ---------- Calendar ----------
  const calGrid = document.getElementById('cal-grid');
  const calMonth = document.getElementById('cal-month');
  const isoForCal = document.body.dataset.dateIso || '';
  const calMatch = isoForCal.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (calGrid && calMatch) {
    const year = +calMatch[1], monthIdx = +calMatch[2] - 1, eventDay = +calMatch[3];
    const setCalMonth = () => { if (calMonth) calMonth.textContent = `${year} оны ${t('months')[monthIdx] || ''}`; };
    setCalMonth();
    onLang(setCalMonth);
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const firstDow = (new Date(year, monthIdx, 1).getDay() + 6) % 7;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < firstDow; i++) { const f = document.createElement('span'); f.setAttribute('aria-hidden', 'true'); frag.appendChild(f); }
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('span');
      cell.textContent = String(d);
      if (d === eventDay) {
        cell.className = 'cal-event';
        cell.setAttribute('aria-current', 'date');
        cell.insertAdjacentHTML('beforeend', '<svg class="cal-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"/></svg>');
      }
      frag.appendChild(cell);
    }
    calGrid.appendChild(frag);
  }

  // ---------- Gallery ----------
  const stage = document.getElementById('carousel-stage');
  const dotsEl = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const galleryPhotos = PHOTOS.length > 0 ? PHOTOS : ['detail.jpg', 'candid.jpg'];
  const len = galleryPhotos.length;

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (stage && len > 0) {
    galleryPhotos.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const img = document.createElement('img');
      img.src = BASE ? `${BASE}/assets/photos/${src}` : `assets/photos/${src}`;
      img.alt = '';
      slide.appendChild(img);
      stage.appendChild(slide);

      if (dotsEl) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
      }
    });

    const slides = stage.querySelectorAll('.carousel-slide');
    const dots = dotsEl ? dotsEl.querySelectorAll('.carousel-dot') : [];
    let current = 0;

    const render = () => {
      slides.forEach((slide, i) => {
        let offset = i - current;
        if (offset > len / 2) offset -= len;
        if (offset < -len / 2) offset += len;
        slide.classList.remove('is-active', 'is-side', 'is-hidden');
        if (offset === 0) { slide.style.transform = 'translateX(0) scale(1)'; slide.classList.add('is-active'); slide.style.opacity = '1'; }
        else if (Math.abs(offset) === 1) { slide.style.transform = `translateX(${offset * 88}%) scale(0.78)`; slide.classList.add('is-side'); }
        else { slide.style.transform = `translateX(${offset * 110}%) scale(0.55)`; slide.classList.add('is-hidden'); }
      });
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    };
    const goTo = (i) => { current = ((i % len) + len) % len; render(); };
    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));
    render();
  }

  // ---------- Helper for Telegram Notifications ----------
  const sendTelegramMessage = async (botToken, chatId, messageText) => {
    if (!botToken || !chatId) return false;
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML'
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('Telegram Notification Error:', err);
      return false;
    }
  };

  // ---------- Wishes wall ----------
  const fmtDate = (s) => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : ''; };
  const wishStage = document.getElementById('wishes-stage');
  const wishDots = document.getElementById('wishes-dots');
  const wishPrev = document.getElementById('wishes-prev');
  const wishNext = document.getElementById('wishes-next');
  const wishForm = document.getElementById('wish-form');
  const wishMsg = document.getElementById('wish-msg');

  let localWishes = [];
  try { localWishes = JSON.parse(localStorage.getItem('khoserdene_wishes_v4') || '[]'); } catch (_) { localWishes = []; }
  let wishes = [...localWishes];
  let wishCurrent = 0;

  const buildWishSlide = (w) => {
    const slide = document.createElement('div');
    slide.className = 'wish-slide';
    const name = document.createElement('p'); name.className = 'wish-name'; name.textContent = w.name;
    const label = document.createElement('p'); label.className = 'wish-label'; label.textContent = t('wishLabel');
    const msg = document.createElement('p'); msg.className = 'wish-msg'; msg.textContent = w.message;
    const date = document.createElement('p'); date.className = 'wish-date'; date.textContent = fmtDate(w.created_at);
    slide.append(name, label, msg, date);
    return slide;
  };

  const renderWishesView = () => {
    if (!wishStage) return;
    if (!wishes.length) {
      wishStage.innerHTML = `<p class="wishes-empty" style="color:var(--ink-soft);font-size:.85rem;padding:20px;text-align:center;">Шинэ гэр бүлд хамгийн анхны сэтгэлийн үгээ үлдээгээрэй ♡</p>`;
      if (wishPrev) wishPrev.style.display = 'none';
      if (wishNext) wishNext.style.display = 'none';
      return;
    }
    if (wishPrev) wishPrev.style.display = wishes.length > 1 ? '' : 'none';
    if (wishNext) wishNext.style.display = wishes.length > 1 ? '' : 'none';

    wishCurrent = ((wishCurrent % wishes.length) + wishes.length) % wishes.length;
    wishStage.replaceChildren(buildWishSlide(wishes[wishCurrent]));
  };

  const fetchServerWishes = async () => {
    try {
      const wishesUrl = BASE ? `${BASE}/wishes.json?t=${Date.now()}` : `wishes.json?t=${Date.now()}`;
      const res = await fetch(wishesUrl);
      if (res.ok) {
        const serverData = await res.json();
        if (Array.isArray(serverData)) {
          const combined = [...localWishes, ...serverData];
          const unique = [];
          const seen = new Set();
          for (const item of combined) {
            const key = `${item.name}-${item.message}`;
            if (!seen.has(key)) { seen.add(key); unique.push(item); }
          }
          wishes = unique;
          renderWishesView();
        }
      }
    } catch (_) { /* ignore network error */ }
  };

  renderWishesView();
  fetchServerWishes();

  wishPrev?.addEventListener('click', () => { wishCurrent--; renderWishesView(); });
  wishNext?.addEventListener('click', () => { wishCurrent++; renderWishesView(); });

  // Wish submit with Real-Time update & Telegram notification
  wishForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    wishMsg.className = 'form-msg';
    wishMsg.textContent = '';
    const fd = new FormData(wishForm);
    const name = String(fd.get('name') || '').trim();
    const message = String(fd.get('message') || '').trim();
    if (!name) { wishMsg.className = 'form-msg is-err'; wishMsg.textContent = t('needName'); return; }
    if (!message) { wishMsg.className = 'form-msg is-err'; wishMsg.textContent = t('needWish'); return; }

    const btn = wishForm.querySelector('.submit-btn');
    if (btn) { btn.disabled = true; btn.classList.add('is-loading'); }

    // Telegram Bot notify
    const rsvpForm = document.getElementById('rsvp-form');
    const botToken = rsvpForm?.dataset.botToken || wishForm.dataset.botToken || window.TELEGRAM_BOT_TOKEN || '';
    const chatId = rsvpForm?.dataset.chatId || wishForm.dataset.chatId || window.TELEGRAM_CHAT_ID || '';

    if (botToken && chatId) {
      const tgText = `💌 <b>ШИНЭ СЭТГЭЛИЙН ҮГ / ЕРӨӨЛ</b>\n\n👤 <b>Нэр:</b> ${escapeHTML(name)}\n💬 <b>Ерөөл:</b> "${escapeHTML(message)}"\n📅 <b>Огноо:</b> ${new Date().toLocaleString('mn-MN')}`;
      await sendTelegramMessage(botToken, chatId, tgText);
    }

    const newWish = { name, message, created_at: new Date().toISOString().replace('T', ' ').slice(0, 19) };
    wishes.unshift(newWish);
    try { localStorage.setItem('khoserdene_wishes_v4', JSON.stringify(wishes)); } catch (_) {}
    wishCurrent = 0;
    renderWishesView();

    setTimeout(() => {
      if (btn) { btn.disabled = false; btn.classList.remove('is-loading'); }
      wishForm.reset();
      wishMsg.className = 'form-msg is-ok';
      wishMsg.textContent = t('wishOk');
    }, 400);
  });

  // ---------- Countdown ----------
  guard(() => {
    const cdEl = document.getElementById('countdown');
    if (!cdEl) return;
    const target = new Date(cdEl.dataset.target || document.body.dataset.dateIso || '').getTime();
    if (Number.isNaN(target)) return;
    const dEl = cdEl.querySelector('[data-d]');
    const hEl = cdEl.querySelector('[data-h]');
    const mEl = cdEl.querySelector('[data-m]');
    const sEl = cdEl.querySelector('[data-s]');
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      if (dEl) dEl.textContent = Math.floor(diff / 86400000);
      if (hEl) hEl.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
      if (mEl) mEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      if (sEl) sEl.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    };
    tick(); setInterval(tick, 1000);
  });

  // ---------- RSVP form with Telegram Bot Integration ----------
  guard(() => {
    const form = document.getElementById('rsvp-form');
    if (!form) return;
    const submitBtn = form.querySelector('.submit-btn');
    const msg = document.getElementById('form-msg');
    const setMsg = (cls, key) => { if (msg) { msg.className = cls; msg.textContent = key ? t(key) : ''; } };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setMsg('form-msg', null);
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const attendance = String(fd.get('attendance') || '');

      if (!name) { setMsg('form-msg is-err', 'needName'); return; }
      if (!attendance) { setMsg('form-msg is-err', 'needAttend'); return; }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('is-loading'); }

      const attendanceLabels = {
        yes: '🟢 Баяртайгаар оролцоно',
        with_spouse: '👩‍❤️‍👨 Хамтрагчтайгаа оролцоно',
        no: '🔴 Харамсалтай нь ирж чадахгүй'
      };
      const labelText = attendanceLabels[attendance] || attendance;

      // Telegram Bot notify
      const botToken = form.dataset.botToken || window.TELEGRAM_BOT_TOKEN || '';
      const chatId = form.dataset.chatId || window.TELEGRAM_CHAT_ID || '';

      if (botToken && chatId) {
        const tgText = `💒 <b>ХУРИМЫН RSVP БАТАЛГААЖУУЛАЛТ</b>\n\n👤 <b>Зочны нэр:</b> ${escapeHTML(name)}\n📌 <b>Шийдвэр:</b> ${labelText}\n📅 <b>Илгээсэн цаг:</b> ${new Date().toLocaleString('mn-MN')}`;
        await sendTelegramMessage(botToken, chatId, tgText);
      }

      // Local storage save
      localStorage.setItem('khoserdene_rsvp', JSON.stringify({ name, attendance, date: new Date().toISOString() }));

      setTimeout(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('is-loading'); }
        setMsg('form-msg is-ok', 'rsvpOk');
        form.reset();
      }, 400);
    });
  });

  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
})();
