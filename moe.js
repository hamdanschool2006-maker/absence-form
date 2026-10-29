/* بوابة المعلم ← البوابة التعليمية: إدخال غياب اليوم الكامل لصف كامل بضغطة واحدة
   يعمل داخل صفحة «تسجيل الغياب والتأخر الصباحي للطلبة» في متصفح الشخص المخوّل وبحسابه هو.
   لا يحفظ ولا يرسل كلمة مرور البوابة التعليمية إطلاقًا. */
(function () {
  'use strict';
  if (window.__hmMoe) { window.__hmMoe.show(); return; }
  var API = 'https://script.google.com/macros/s/AKfycbz40K2J9UpT7Qc6E3Nfhywqs3LdnX9wAHUZ64fo-kbF1Rp9seJIJ-2TUpUJbjLZo1-duw/exec';
  var SAVED_TXT = 'تم تسجيل الحضور والغياب';
  var GRADES = ['السابع', 'الثامن', 'التاسع', 'العاشر'];
  var AR = '٠١٢٣٤٥٦٧٨٩';
  var ar = function (n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var $ = function (id, d) { return (d || document).getElementById(id); };
  var sget = function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  var sset = function (k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} };

  var form0 = document.getElementById('Form1');
  if (!form0 || !$('SchoolFilterCtrl1_ddlClasses') || !$('txtDate')) {
    alert('افتح صفحة «تسجيل الغياب والتأخر الصباحي للطلبة» في البوابة التعليمية أولًا، ثم اضغط الزر.');
    return;
  }

  /* ---------- الواجهة ---------- */
  var css = '#hmMoe{position:fixed;z-index:2147483000;top:12px;left:12px;width:420px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;' +
    'background:#fff;border:2px solid #7a1c22;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);font:15px/1.6 Tahoma,Arial,sans-serif;color:#222;direction:rtl;text-align:right}' +
    '#hmMoe .hd{background:#7a1c22;color:#fff;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;font-weight:bold}' +
    '#hmMoe .hd button{background:none;border:0;color:#fff;font-size:20px;cursor:pointer}' +
    '#hmMoe .bd{padding:14px}#hmMoe input[type=text],#hmMoe input[type=password]{width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #bbb;border-radius:8px;margin:4px 0 10px;font:inherit}' +
    '#hmMoe .btn{display:block;width:100%;padding:10px;border:0;border-radius:10px;background:#7a1c22;color:#fff;font:bold 16px Tahoma,Arial;cursor:pointer;margin-top:10px}' +
    '#hmMoe .btn[disabled]{opacity:.5;cursor:default}#hmMoe .btn.g{background:#eee;color:#333}' +
    '#hmMoe .s{border:1px solid #e5d9c3;border-radius:10px;padding:7px 10px;margin:6px 0;background:#fbf7ef}' +
    '#hmMoe .s b{display:inline-block;min-width:80px}#hmMoe .ok{color:#1d7a3a}#hmMoe .er{color:#b3261e}#hmMoe .mu{color:#777;font-size:13px}' +
    '#hmMoe ul{margin:4px 0 0;padding-right:18px}#hmMoe label.c{display:flex;gap:6px;align-items:center;margin-top:8px;font-size:14px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var box = document.createElement('div'); box.id = 'hmMoe';
  box.innerHTML = '<div class="hd"><span>بوابة المعلم ← البوابة التعليمية</span><button title="إغلاق">×</button></div><div class="bd" id="hmMoeBd"></div>';
  document.body.appendChild(box);
  var busy = false;
  box.querySelector('.hd button').onclick = function () { if (busy && !confirm('الإدخال جارٍ. هل تريد إغلاق النافذة؟')) return; box.style.display = 'none'; };
  var bd = $('hmMoeBd');
  window.__hmMoe = { show: function () { box.style.display = ''; if (!busy) start(); } };

  /* ---------- الاتصال ببوابة المعلم ---------- */
  function api(action, args) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: action, args: args }) })
      .then(function (r) { return r.text(); })
      .then(function (t) { var j; try { j = JSON.parse(t); } catch (e) { throw new Error('رد غير متوقع من بوابة المعلم.'); } if (!j.ok) throw new Error(j.error || 'خطأ'); return j.data; });
  }
  function loginView(msg) {
    bd.innerHTML = '<div>سجّل الدخول بحسابك في <b>بوابة المعلم</b> (وليس البوابة التعليمية):</div>' +
      (msg ? '<div class="er">' + esc(msg) + '</div>' : '') +
      '<input type="text" id="hmCiv" placeholder="الرقم المدني" inputmode="numeric"><input type="password" id="hmPw" placeholder="كلمة المرور">' +
      '<button class="btn" id="hmLg">دخول</button><div class="mu">يبقى الدخول في هذه النافذة فقط حتى إغلاق المتصفح.</div>';
    $('hmLg').onclick = function () {
      var b = $('hmLg'); b.disabled = true; b.textContent = 'جارٍ الدخول…';
      api('login', [$('hmCiv').value.trim(), $('hmPw').value, false]).then(function (r) {
        if (r.canLog === false) { loginView('ليست لديك صلاحية «سجل الغياب» في بوابة المعلم.'); return; }
        sset('hmMoeTok', r.token); sset('hmMoeName', r.name); start();
      }).catch(function (e) { loginView(e.message); });
    };
    $('hmPw').onkeydown = function (e) { if (e.key === 'Enter') $('hmLg').click(); };
  }

  /* ---------- قراءة الاختيار في صفحة الوزارة ---------- */
  function selText(sel) { var o = sel && sel.options[sel.selectedIndex]; return o ? o.text.trim() : ''; }
  function curGrade() {
    var t = selText($('SchoolFilterCtrl1_ddlGrades'));
    for (var i = 0; i < GRADES.length; i++) if (t.indexOf(GRADES[i]) > -1) return GRADES[i];
    return '';
  }
  function toYmd(dmy) { var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(dmy).trim()); return m ? m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2) : ''; }
  function classList() {
    var s = $('SchoolFilterCtrl1_ddlClasses'), out = [];
    for (var i = 0; i < s.options.length; i++) { var n = s.options[i].text.replace(/[٠-٩]/g, function (d) { return AR.indexOf(d); }).trim(); if (/^\d+$/.test(n)) out.push({ value: s.options[i].value, sec: n }); }
    return out;
  }

  /* ---------- مطابقة الأسماء ---------- */
  function norm(s) {
    s = String(s || '').replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/عبد\s+/g, 'عبد').replace(/\s+/g, ' ').trim();
    return s.split(' ').filter(function (w) { return w && w !== 'بن' && w !== 'بنت' && w !== 'ابن'; });
  }
  // يعيد أفضل صف مطابق لاسم الطالب، أو null إن لم يوجد تطابق مؤكد
  function matchRow(name, rows) {
    var a = norm(name), aj = a.join(' '), best = null, bestS = 0, second = 0;
    rows.forEach(function (r) {
      var b = r.tok, bj = b.join(' '), s;
      if (aj === bj) s = 100;
      else if (a[0] !== b[0] || a[a.length - 1] !== b[b.length - 1]) s = 0;
      else {
        var n = Math.min(a.length, b.length), k = 0; for (var i = 0; i < n; i++) if (a[i] === b[i]) k++;
        s = (k >= 3 || (n <= 3 && k === n)) ? 50 + k : 0;
      }
      if (s > bestS) { second = bestS; bestS = s; best = r; } else if (s > second) second = s;
    });
    return bestS && bestS > second ? best : null;
  }

  /* ---------- إرسال النموذج كما يفعل المتصفح ---------- */
  var CS = (document.characterSet || 'utf-8').toLowerCase();
  var ENC = null;   // جدول ترميز windows-1256 إن كانت الصفحة به
  if (/1256|arabic/.test(CS)) {
    ENC = {}; var dec = new TextDecoder('windows-1256');
    for (var b = 128; b < 256; b++) ENC[dec.decode(new Uint8Array([b]))] = b;
  }
  function encPart(v) {
    if (!ENC) return encodeURIComponent(v);
    var out = '';
    for (var i = 0; i < v.length; i++) {
      var c = v[i], code = c.charCodeAt(0);
      if (/[A-Za-z0-9\-_.*]/.test(c)) out += c;
      else if (c === ' ') out += '+';
      else if (code < 128) out += '%' + ('0' + code.toString(16).toUpperCase()).slice(-2);
      else if (ENC[c] !== undefined) out += '%' + ENC[c].toString(16).toUpperCase();
      else out += '%3F';
    }
    return out;
  }
  function serialize(form, opts) {
    var parts = [], els = form.elements;
    for (var i = 0; i < els.length; i++) {
      var el = els[i], nm = el.name, t = (el.type || '').toLowerCase();
      if (!nm || el.disabled || el.hasAttribute('disabled')) continue;
      if (t === 'image' || t === 'submit' || t === 'button' || t === 'reset' || t === 'file') continue;
      if (opts.skip && opts.skip(nm)) continue;
      var v;
      if (opts.set && Object.prototype.hasOwnProperty.call(opts.set, nm)) v = opts.set[nm];
      else if (t === 'checkbox' || t === 'radio') { if (!el.checked) continue; v = el.getAttribute('value') || 'on'; }
      else if (el.tagName === 'SELECT') { var o = el.options[el.selectedIndex]; if (!o) continue; v = o.value; }
      else v = el.value;
      parts.push(encPart(nm) + '=' + encPart(String(v)));
    }
    parts.push(encPart(opts.click + '.x') + '=7', encPart(opts.click + '.y') + '=7');
    return parts.join('&');
  }
  var ACTION = new URL(form0.getAttribute('action') || location.href, location.href).href;
  function post(body) {
    return fetch(ACTION, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) {
        if (!r.ok) throw new Error('رد البوابة التعليمية: ' + r.status);
        var m = /charset=([^;]+)/i.exec(r.headers.get('content-type') || '');
        return r.arrayBuffer().then(function (buf) {
          var cs = m ? m[1].trim() : CS, txt;
          try { txt = new TextDecoder(cs).decode(buf); } catch (e) { txt = new TextDecoder('utf-8').decode(buf); }
          var d = new DOMParser().parseFromString(txt, 'text/html');
          if (!d.getElementById('Form1')) throw new Error('انتهت جلسة البوابة التعليمية أو تغيّرت الصفحة. أعد تحميل الصفحة وسجّل الدخول.');
          return d;
        });
      });
  }
  function selVal(d, id) { var s = d.getElementById(id); return s && s.options[s.selectedIndex] ? s.options[s.selectedIndex].value : ''; }
  function gridRows(d) {
    var out = [];
    var sels = d.querySelectorAll('#dgAttendanceSheet select[id$="_ddlAttendance"]');
    for (var i = 0; i < sels.length; i++) {
      var tr = sels[i].closest('tr'), nmEl = tr.querySelector('#UserName') || tr.cells[0];
      var name = (nmEl.textContent || '').replace(/\s+/g, ' ').trim();
      out.push({ sel: sels[i], pre: sels[i].id.replace(/_ddlAttendance$/, ''), name: name, tok: norm(name) });
    }
    return out;
  }

  /* ---------- الخطوات ---------- */
  var DATA = null, G = '', DMY = '', CLS = [];
  function start() {
    if (!sget('hmMoeTok')) { loginView(''); return; }
    G = curGrade(); DMY = $('txtDate').value.trim(); CLS = classList();
    var ymd = toYmd(DMY);
    if (!G) { bd.innerHTML = '<div class="er">اختر <b>الصف</b> في الصفحة (السابع إلى العاشر)، ثم اضغط الزر مرة أخرى.</div><button class="btn g" id="hmRe">تحديث</button>'; $('hmRe').onclick = start; return; }
    if (!ymd) { bd.innerHTML = '<div class="er">اكتب <b>التاريخ</b> في الصفحة بصيغة يوم/شهر/سنة.</div><button class="btn g" id="hmRe">تحديث</button>'; $('hmRe').onclick = start; return; }
    if (!CLS.length) { bd.innerHTML = '<div class="er">لم تظهر شعب الصف في الصفحة بعد. انتظر لحظة ثم اضغط «تحديث».</div><button class="btn g" id="hmRe">تحديث</button>'; $('hmRe').onclick = start; return; }
    bd.innerHTML = '<div>جارٍ إحضار غياب <b>' + esc(G) + '</b> ليوم <b>' + esc(DMY) + '</b> من بوابة المعلم…</div>';
    api('moeAbsences', [sget('hmMoeTok'), G, ymd]).then(function (r) { DATA = r; review(); })
      .catch(function (e) { if (/انتهت الجلسة|سجّل الدخول/.test(e.message)) { sset('hmMoeTok', null); loginView(e.message); } else bd.innerHTML = '<div class="er">' + esc(e.message) + '</div>'; });
  }
  function review() {
    var tot = 0, html = '<div>الصف <b>' + esc(G) + '</b> — يوم <b>' + esc(DMY) + '</b><br><span class="mu">المستخدم: ' + esc(sget('hmMoeName') || '') + '</span></div>';
    CLS.forEach(function (c) {
      var n = (DATA.secs[c.sec] || []).length; tot += n;
      html += '<div class="s"><b>' + esc(G) + ' / ' + ar(c.sec) + '</b> ' + (n ? '<span class="er">' + ar(n) + ' غائب يومًا كاملًا</span>' : '<span class="mu">لا غياب يوم كامل</span>') + '</div>';
    });
    var extra = Object.keys(DATA.secs).filter(function (k) { return !CLS.some(function (c) { return c.sec === k; }); });
    if (extra.length) html += '<div class="er">شعب في بوابة المعلم غير موجودة في البوابة التعليمية: ' + extra.map(ar).join('، ') + '</div>';
    html += '<label class="c"><input type="checkbox" id="hmAll"> حفظ الشعب التي ليس فيها غياب أيضًا (الجميع حاضر)</label>' +
      '<button class="btn" id="hmGo"' + (tot ? '' : ' disabled') + '>إدخال الغياب وحفظه في البوابة التعليمية</button>' +
      '<button class="btn g" id="hmRe">تحديث</button>';
    bd.innerHTML = html;
    $('hmAll').onchange = function () { $('hmGo').disabled = !tot && !this.checked; };
    $('hmRe').onclick = start;
    $('hmGo').onclick = function () { run($('hmAll').checked); };
  }
  function run(saveEmpty) {
    busy = true;
    var list = CLS.filter(function (c) { return saveEmpty || (DATA.secs[c.sec] || []).length; });
    bd.innerHTML = '<div id="hmProg">جارٍ الإدخال… لا تغلق الصفحة.</div><div id="hmLog"></div>';
    var logEl = $('hmLog'), doc = document, report = [];
    var gradeVal = selVal(document, 'SchoolFilterCtrl1_ddlGrades');
    var i = 0;
    function next() {
      if (i >= list.length) return finish();
      var c = list[i++], names = DATA.secs[c.sec] || [];
      var line = document.createElement('div'); line.className = 's'; line.innerHTML = '<b>' + esc(G) + ' / ' + ar(c.sec) + '</b> <span class="mu">جارٍ فتح الكشف…</span>';
      logEl.appendChild(line);
      var setO = {}; setO['SchoolFilterCtrl1$ddlClasses'] = c.value; setO['txtDate'] = DMY;
      var body = serialize(doc.getElementById('Form1'), { click: 'btnOpenAttendanceSheet', set: setO, skip: function (n) { return n.indexOf('dgAttendanceSheet$') === 0; } });
      post(body).then(function (d) {
        if (selVal(d, 'SchoolFilterCtrl1_ddlClasses') !== c.value || selVal(d, 'SchoolFilterCtrl1_ddlGrades') !== gradeVal || d.getElementById('txtDate').value.trim() !== DMY)
          throw new Error('لم يُفتح كشف هذه الشعبة كما يجب.');
        var pg = d.getElementById('ctl02_ddlCurrentPage');
        if (pg && pg.options.length > 1) throw new Error('الكشف مقسّم على أكثر من صفحة. اختر «عرض ٥٠» في الصفحة ثم أعد المحاولة.');
        var rows = gridRows(d); if (!rows.length) throw new Error('لا يوجد طلاب في كشف الوزارة لهذه الشعبة.');
        var done = [], already = [], miss = [];
        names.forEach(function (nm) {
          var r = matchRow(nm, rows);
          if (!r) { miss.push(nm); return; }
          if (r.sel.value === 'a') { already.push(nm); return; }
          for (var k = 0; k < r.sel.options.length; k++) r.sel.options[k].selected = r.sel.options[k].value === 'a';
          var cbs = d.querySelectorAll('#' + r.pre + '_cblSessions input[type=checkbox]');
          for (var k2 = 0; k2 < cbs.length; k2++) { cbs[k2].checked = false; cbs[k2].setAttribute('disabled', 'disabled'); }
          var h = d.getElementById(r.pre + '_selectedAbsenceReasonHidden'); if (h) h.value = '1';
          done.push(nm);
        });
        line.querySelector('.mu').textContent = 'جارٍ الحفظ…';
        return post(serialize(d.getElementById('Form1'), { click: 'btnSaveSheet' })).then(function (d2) {
          var ok = (d2.body.textContent || '').indexOf(SAVED_TXT) > -1;
          if (!ok) throw new Error('لم تظهر رسالة «تم التسجيل» من البوابة التعليمية؛ تحقّق من هذه الشعبة يدويًا.');
          doc = d2;
          var h = '<b>' + esc(G) + ' / ' + ar(c.sec) + '</b> <span class="ok">✔ حُفظ</span> — ' + ar(done.length) + ' غائب';
          if (already.length) h += '<div class="mu">مسجّلون غائبين مسبقًا: ' + already.map(esc).join('، ') + '</div>';
          if (miss.length) h += '<div class="er">لم يُعثر عليهم في كشف الوزارة (أدخلهم يدويًا):<ul><li>' + miss.map(esc).join('</li><li>') + '</li></ul></div>';
          line.innerHTML = h; report.push({ sec: c.sec, ok: true, miss: miss.length });
        });
      }).catch(function (e) {
        line.innerHTML = '<b>' + esc(G) + ' / ' + ar(c.sec) + '</b> <span class="er">✖ ' + esc(e.message) + '</span>';
        report.push({ sec: c.sec, ok: false });
        if (/انتهت جلسة/.test(e.message)) { i = list.length; }
      }).then(next);
    }
    function finish() {
      busy = false;
      var ok = report.filter(function (r) { return r.ok; }).length, bad = report.length - ok, miss = report.reduce(function (a, r) { return a + (r.miss || 0); }, 0);
      $('hmProg').innerHTML = '<b>' + (bad ? '<span class="er">انتهى مع ملاحظات</span>' : '<span class="ok">تم الانتهاء</span>') + '</b>: حُفظت ' + ar(ok) + ' شعبة' +
        (bad ? '، وتعذّرت ' + ar(bad) : '') + (miss ? '، و' + ar(miss) + ' طالب يحتاج إدخالًا يدويًا' : '') + '.';
      var b = document.createElement('button'); b.className = 'btn g'; b.textContent = 'إعادة تحميل الصفحة لمراجعة الكشوف';
      b.onclick = function () { location.reload(); }; bd.appendChild(b);
    }
    next();
  }
  start();
})();
