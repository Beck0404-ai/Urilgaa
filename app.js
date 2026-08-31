(() => {
  // =========================================================================
  // TELEGRAM BOT INTEGRATION CONFIGURATION
  // -------------------------------------------------------------------------
  // Replace these with your Telegram Bot Token & Chat ID:
  // 1. Create a bot with @BotFather on Telegram -> get BOT_TOKEN
  // 2. Get your Chat ID with @userinfobot -> get CHAT_ID
  // =========================================================================
  const TELEGRAM_BOT_TOKEN = window.TELEGRAM_BOT_TOKEN || '';
  const TELEGRAM_CHAT_ID = window.TELEGRAM_CHAT_ID || '';

  const BASE = document.body.dataset.base || '';
  let PHOTOS = [];
  try { PHOTOS = JSON.parse(document.body.dataset.photos || '[]'); } catch { PHOTOS = []; }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const guard = (fn) => { try { fn(); } catch (_) { /* no-op */ } };

  // ---------- Language ----------
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
      wishPending: 'Баярлалаа! Сэтгэлийн үг нийтлэгдлээ ♡',
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
      wishPending: 'Teşekkürler! Dileğiniz alındı ♡',
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
  onLang(() => setPlaying(!!music && !music.paused));

  // ---------- Gate ----------
  const introGate = document.getElementById('intro-gate');
  const introVideo = document.getElementById('intro-video');
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
      if (themeBtn) themeBtn.inert = locked;
      if (langBtn) langBtn.inert = locked;
      if (musicBtn) musicBtn.inert = locked;
    };

    if (seenIntro && !forceIntro) {
      introGate.hidden = true;
      if (getTheme() === 'dark') activateHeroVideo();
    } else {
      setIntroLocked(true);
      let started = false;
      let revealed = false;
      let revealTimer = null;

      const revealIntro = () => {
        if (revealed) return;
        revealed = true;
        if (revealTimer) clearTimeout(revealTimer);
        try { sessionStorage.setItem(INTRO_KEY, 'true'); } catch (_) {}
        if (getTheme() === 'dark') activateHeroVideo();
        introGate.classList.add('is-blooming');
        document.body.classList.add('intro-revealing');
        setTimeout(() => introGate.classList.add('is-revealing'), 260);
        setTimeout(() => {
          introGate.hidden = true;
          introVideo?.pause();
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
        if (reduceMotion) {
          revealIntro();
          return;
        }
        revealTimer = setTimeout(revealIntro, 900);
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
  const galleryPhotos = PHOTOS.length > 0 ? PHOTOS : ['hero.jpg', 'candid.jpg', 'detail.jpg', 'venue.jpg'];
  const len = galleryPhotos.length;

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let lightboxOpen = false;
  let lightboxIdx = 0;

  if (stage && len > 0) {
    let justSwiped = false;
    galleryPhotos.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const img = document.createElement('img');
      img.src = `${BASE}/assets/photos/${src}`;
      img.alt = '';
      img.loading = i === 0 ? 'eager' : 'lazy';
      slide.appendChild(img);
      slide.addEventListener('click', () => {
        if (justSwiped) return;
        if (slide.classList.contains('is-active')) openLightbox(i);
        else if (slide.classList.contains('is-side')) goTo(i, true);
      });
      stage.appendChild(slide);

      if (dotsEl) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', t('photo')(i + 1));
        dot.addEventListener('click', () => goTo(i, true));
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
      dots.forEach((d, i) => { const on = i === current; d.classList.toggle('is-active', on); if (on) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    };
    const goTo = (i) => { current = ((i % len) + len) % len; render(); };
    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    render();

    const showInLightbox = (idx) => { lightboxIdx = ((idx % len) + len) % len; lightboxImg.src = `${BASE}/assets/photos/${galleryPhotos[lightboxIdx]}`; };
    const openLightbox = (idx) => {
      if (!lightbox) return;
      showInLightbox(idx);
      lightbox.removeAttribute('hidden');
      lightboxOpen = true;
    };
    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.setAttribute('hidden', '');
      lightboxOpen = false;
    };
    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', () => showInLightbox(lightboxIdx - 1));
    lightboxNext?.addEventListener('click', () => showInLightbox(lightboxIdx + 1));
  }

  // ---------- Wishes wall ----------
  const fmtDate = (s) => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : ''; };
  const wishStage = document.getElementById('wishes-stage');
  const wishDots = document.getElementById('wishes-dots');
  const wishPrev = document.getElementById('wishes-prev');
  const wishNext = document.getElementById('wishes-next');
  const wishReadAll = document.getElementById('wishes-readall');
  const wishModal = document.getElementById('wishes-modal');
  const wishModalClose = document.getElementById('wishes-modal-close');
  const wishList = document.getElementById('wishes-list');
  const wishForm = document.getElementById('wish-form');
  const wishMsg = document.getElementById('wish-msg');
  const lampEl = document.getElementById('wish-lamp');

  let wishes = JSON.parse(localStorage.getItem('khoserdene_wishes') || '[]');
  if (!wishes.length) {
    wishes = [
      { name: 'Бат & Оюунаа', message: 'Хоёр дүүдээ насан туршийн аз жаргал хүсэн ерөөе!', created_at: '2026-08-30 14:20' },
      { name: 'Ганзориг', message: 'Түмэн насалж, буман жаргаарай! Хурим нь сайхан болоорой.', created_at: '2026-08-31 09:15' }
    ];
  }
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
  const renderWish = (i) => {
    if (!wishStage || !wishes.length) return;
    wishCurrent = ((i % wishes.length) + wishes.length) % wishes.length;
    wishStage.replaceChildren(buildWishSlide(wishes[wishCurrent]));
  };

  renderWish(0);

  wishPrev?.addEventListener('click', () => renderWish(wishCurrent - 1));
  wishNext?.addEventListener('click', () => renderWish(wishCurrent + 1));

  // Wish submit -> Telegram & LocalStorage
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
    btn.disabled = true; btn.classList.add('is-loading');

    // Send Telegram Notification
    const token = TELEGRAM_BOT_TOKEN || wishForm.dataset.telegramToken;
    const chatId = TELEGRAM_CHAT_ID || wishForm.dataset.telegramChatId;
    if (token && chatId) {
      const text = `💬 <b>Шинэ Сэтгэлийн Үг ирлээ!</b>\n\n👤 <b>Нэр:</b> ${name}\n📝 <b>Ерөөл:</b> ${message}\n📅 <b>Хурим:</b> М.Хос-Эрдэнэ & Б.Одонтулгалаг (2026.09.28)`;
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
        });
      } catch (err) {
        console.warn('Telegram wish failed:', err);
      }
    }

    setTimeout(() => {
      btn.disabled = false; btn.classList.remove('is-loading');
      wishForm.reset();
      wishMsg.className = 'form-msg is-ok';
      wishMsg.textContent = t('wishOk');
      wishes.unshift({ name, message, created_at: new Date().toISOString().replace('T', ' ').slice(0, 19) });
      localStorage.setItem('khoserdene_wishes', JSON.stringify(wishes));
      renderWish(0);
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

  // ---------- RSVP Form -> Telegram ----------
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

      // Mongolian status text
      let attendText = 'Баяртайгаар оролцоно';
      if (attendance === 'with_spouse') attendText = 'Хамтрагчтайгаа оролцоно';
      if (attendance === 'no') attendText = 'Харамсалтай нь ирж чадахгүй';

      // Send to Telegram Bot
      const token = TELEGRAM_BOT_TOKEN || form.dataset.telegramToken || document.body.dataset.telegramToken;
      const chatId = TELEGRAM_CHAT_ID || form.dataset.telegramChatId || document.body.dataset.telegramChatId;

      if (token && chatId) {
        const text = `💍 <b>ШИНЭ RSVP ХАРИУ ИРЛЭЭ!</b>\n\n👤 <b>Зочны нэр:</b> ${name}\n📌 <b>Оролцох эсэх:</b> ${attendText}\n📅 <b>Хуримын өдөр:</b> 2026.09.28\n💒 <b>Хос:</b> М.Хос-Эрдэнэ & Б.Одонтулгалаг`;
        try {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
          });
        } catch (err) {
          console.warn('Telegram RSVP send failed:', err);
        }
      }

      setTimeout(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('is-loading'); }
        setMsg('form-msg is-ok', 'rsvpOk');
        form.reset();
        localStorage.setItem('khoserdene_rsvp', JSON.stringify({ name, attendance }));
      }, 400);
    });
  });
})();
