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
  /* ---------- التنفيذ: الصفحة الحقيقية داخل إطار مخفي، تمامًا كما يضغط المستخدم ---------- */
  var IFR = null;
  function frame() {
    if (IFR) return IFR;
    IFR = document.createElement('iframe');
    IFR.style.cssText = 'position:fixed;left:-4000px;top:0;width:1200px;height:900px;border:0;visibility:hidden';
    document.body.appendChild(IFR);
    return IFR;
  }
  function tame(w) {   // نوافذ التنبيه داخل الإطار لا توقف العمل
    try { w.alert = function (m) { w.__hmAlerts = (w.__hmAlerts || []).concat(String(m)); }; w.confirm = function () { return true; }; } catch (e) {}
  }
  // ينفّذ action ثم ينتظر تحميل الصفحة الجديدة داخل الإطار
  function step(action) {
    var f = frame();
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { f.onload = null; rej(new Error('انتهت مهلة انتظار البوابة التعليمية (٩٠ ثانية).')); }, 90000);
      f.onload = function () {
        clearTimeout(t); f.onload = null;
        var d; try { d = f.contentDocument; } catch (e) { rej(new Error('تعذر قراءة صفحة البوابة التعليمية.')); return; }
        tame(f.contentWindow);
        if (!d || !d.getElementById('Form1')) {
          var info = d ? ((d.title || '') + ' — ' + (d.body ? d.body.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) : '')) : '';
          rej(new Error('لم تظهر صفحة الغياب (ربما انتهت جلسة البوابة التعليمية). ' + info)); return;
        }
        res(d);
      };
      try { action(f); } catch (e) { clearTimeout(t); f.onload = null; rej(e); }
    });
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // ينتظر حتى يتحقق الشرط (القوائم في صفحة الوزارة تُملأ بعد التحميل)، ويعيد true أو false
  function waitFor(fn, ms) {
    var t0 = Date.now();
    return (function loop() { var ok = false; try { ok = fn(); } catch (e) {} return ok ? Promise.resolve(true) : (Date.now() - t0 > ms ? Promise.resolve(false) : sleep(250).then(loop)); })();
  }
  function hasOpt(sel, v) { if (!sel) return false; for (var k = 0; k < sel.options.length; k++) if (sel.options[k].value === v) return true; return false; }
  function fire(el) { try { el.dispatchEvent(new (el.ownerDocument.defaultView.Event)('change', { bubbles: true })); } catch (e) { try { if (el.onchange) el.onchange(); } catch (e2) {} } }
  function setSel(sel, value, text) {
    var found = false;
    for (var k = 0; k < sel.options.length; k++) if (sel.options[k].value === value) found = true;
    if (!found) { var o = sel.ownerDocument.createElement('option'); o.value = value; o.text = text || value; sel.appendChild(o); }
    sel.value = value;
  }
  function click(d, id) {
    var b = d.getElementById(id);
    if (!b) throw new Error('لم يُعثر على زر ' + (id === 'btnSaveSheet' ? '«حفظ»' : '«عرض»') + ' في الصفحة.');
    b.click();
  }
  function run(saveEmpty) {
    busy = true;
    var list = CLS.filter(function (c) { return saveEmpty || (DATA.secs[c.sec] || []).length; });
    bd.innerHTML = '<div id="hmProg">جارٍ الإدخال… لا تغلق الصفحة ولا تنتقل منها.</div><div id="hmLog"></div>';
    var logEl = $('hmLog'), report = [], doc = null;
    var gSel = $('SchoolFilterCtrl1_ddlGrades'), gradeVal = selVal(document, 'SchoolFilterCtrl1_ddlGrades'), gradeTxt = selText(gSel);
    var i = 0;
    var first = step(function (f) { f.src = location.href.split('#')[0]; });
    function openClass(d, c) {
      return Promise.resolve(d).then(function (d) {
        var gS = d.getElementById('SchoolFilterCtrl1_ddlGrades'), cS = d.getElementById('SchoolFilterCtrl1_ddlClasses');
        // اختيار الصف ثم الشعبة كما يفعل المستخدم، وانتظار تحميل الشعب
        var ready = Promise.resolve();
        if (selVal(d, 'SchoolFilterCtrl1_ddlGrades') !== gradeVal) {
          ready = waitFor(function () { return hasOpt(d.getElementById('SchoolFilterCtrl1_ddlGrades'), gradeVal); }, 15000).then(function () {
            gS = d.getElementById('SchoolFilterCtrl1_ddlGrades'); gS.value = gradeVal; fire(gS);
          });
        }
        return ready.then(function () {
          return waitFor(function () { return hasOpt(d.getElementById('SchoolFilterCtrl1_ddlClasses'), c.value); }, 15000);
        }).then(function (okC) {
          return step(function () {
            gS = d.getElementById('SchoolFilterCtrl1_ddlGrades'); cS = d.getElementById('SchoolFilterCtrl1_ddlClasses');
            if (gS.value !== gradeVal) setSel(gS, gradeVal, gradeTxt);
            if (okC) { cS.value = c.value; fire(cS); } else setSel(cS, c.value, c.sec);
            d.getElementById('txtDate').value = DMY;
            click(d, 'btnOpenAttendanceSheet');
          });
        });
      }).then(function (d) {
        doc = d;
        // انتظار استقرار قوائم الصف والشعبة بعد التحميل
        return waitFor(function () { return selVal(d, 'SchoolFilterCtrl1_ddlClasses') === c.value && selVal(d, 'SchoolFilterCtrl1_ddlGrades') === gradeVal; }, 8000).then(function () { return d; });
      }).then(function (d) {
        var fc = selVal(d, 'SchoolFilterCtrl1_ddlClasses'), fg = selVal(d, 'SchoolFilterCtrl1_ddlGrades'), fd = d.getElementById('txtDate').value.trim();
        if (fc !== c.value || fg !== gradeVal || fd !== DMY) {
          var cs = d.getElementById('SchoolFilterCtrl1_ddlClasses'), gs = d.getElementById('SchoolFilterCtrl1_ddlGrades');
          throw new Error('لم يُفتح كشف هذه الشعبة كما يجب. (المطلوب: ' + gradeTxt + ' / ' + c.sec + ' / ' + DMY + ' — الظاهر: ' + selText(gs) + ' / ' + (selText(cs) || '—') + ' / ' + fd + ')');
        }
        return d;
      });
    }
    function next() {
      if (i >= list.length) return finish();
      var c = list[i++], names = DATA.secs[c.sec] || [];
      var line = document.createElement('div'); line.className = 's'; line.innerHTML = '<b>' + esc(G) + ' / ' + ar(c.sec) + '</b> <span class="mu">جارٍ فتح الكشف…</span>';
      logEl.appendChild(line);
      var p = doc ? Promise.resolve(doc) : first;
      p.then(function (d) { return openClass(d, c); }).then(function (d) {
        var pg = d.getElementById('ctl02_ddlCurrentPage');
        if (pg && pg.options.length > 1) throw new Error('الكشف مقسّم على أكثر من صفحة. اختر «عرض ٥٠» في الصفحة ثم أعد المحاولة.');
        var rows = gridRows(d); if (!rows.length) throw new Error('لا يوجد طلاب في كشف الوزارة لهذه الشعبة.');
        var done = [], already = [], miss = [];
        names.forEach(function (nm) {
          var r = matchRow(nm, rows);
          if (!r) { miss.push(nm); return; }
          if (r.sel.value === 'a') { already.push(nm); return; }
          r.sel.value = 'a';
          try { if (typeof r.sel.onchange === 'function') r.sel.onchange(); else r.sel.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
          if (r.sel.value !== 'a') { miss.push(nm + ' (رفضت الصفحة تغييره)'); return; }
          var cbs = d.querySelectorAll('#' + r.pre + '_cblSessions input[type=checkbox]');
          for (var k = 0; k < cbs.length; k++) { cbs[k].checked = false; cbs[k].disabled = true; }
          var h = d.getElementById(r.pre + '_selectedAbsenceReasonHidden'); if (h && !h.value) h.value = '1';
          done.push(nm);
        });
        line.querySelector('.mu').textContent = 'جارٍ الحفظ…';
        return step(function () { click(d, 'btnSaveSheet'); }).then(function (d2) {
          doc = d2;
          var found = function () {
            var docs = [d2]; try { var fr = d2.querySelectorAll('iframe'); for (var q = 0; q < fr.length; q++) { try { if (fr[q].contentDocument) docs.push(fr[q].contentDocument); } catch (e) {} } } catch (e) {}
            return docs.some(function (x) { return x.body && (x.body.textContent || '').indexOf(SAVED_TXT) > -1; }) ||
              (IFR.contentWindow.__hmAlerts || []).some(function (m) { return m.indexOf(SAVED_TXT) > -1; });
          };
          return waitFor(found, 6000).then(function (ok) {
            if (ok || !done.length) return ok ? 'msg' : 'none';
            // لم تظهر الرسالة: يُعاد فتح الكشف للتأكد من أن الغائبين محفوظون فعلًا في نظام الوزارة
            line.querySelector('.mu') && (line.querySelector('.mu').textContent = 'جارٍ التحقق من الحفظ…');
            return openClass(d2, c).then(function (d3) {
              var rows3 = gridRows(d3), bad = [];
              done.forEach(function (nm) {
                var r = matchRow(nm, rows3), h = r && d3.getElementById(r.pre + '_dbAttendanceStatusHidden');
                if (!r || !((h && h.value === 'a') || r.sel.value === 'a')) bad.push(nm);
              });
              if (bad.length) {
                var al = (IFR.contentWindow.__hmAlerts || []).join(' | ');
                throw new Error('لم يُحفظ الغياب في البوابة التعليمية لـ ' + bad.length + ' طالب؛ تحقّق من هذه الشعبة يدويًا.' + (al ? ' رسالة الصفحة: ' + al : ''));
              }
              return 'verified';
            });
          }).then(function (how) {
          var h = '<b>' + esc(G) + ' / ' + ar(c.sec) + '</b> <span class="ok">✔ حُفظ</span> — ' + ar(done.length) + ' غائب';
          if (already.length) h += '<div class="mu">مسجّلون غائبين مسبقًا: ' + already.map(esc).join('، ') + '</div>';
          if (miss.length) h += '<div class="er">لم يُعثر عليهم في كشف الوزارة (أدخلهم يدويًا):<ul><li>' + miss.map(esc).join('</li><li>') + '</li></ul></div>';
          if (how === 'verified') h += '<div class="mu">تأكدنا بإعادة فتح الكشف أن الغياب محفوظ.</div>';
          line.innerHTML = h; report.push({ sec: c.sec, ok: true, miss: miss.length });
          });
        });
      }).catch(function (e) {
        line.innerHTML = '<b>' + esc(G) + ' / ' + ar(c.sec) + '</b> <span class="er">✖ ' + esc(e.message) + '</span>';
        report.push({ sec: c.sec, ok: false });
        if (/جلسة|مهلة/.test(e.message)) { doc = null; first = step(function (f) { f.src = location.href.split('#')[0]; }); }
      }).then(next);
    }
    function finish() {
      busy = false;
      var ok = report.filter(function (r) { return r.ok; }).length, bad = report.length - ok, miss = report.reduce(function (a, r) { return a + (r.miss || 0); }, 0);
      $('hmProg').innerHTML = '<b>' + (bad ? '<span class="er">انتهى مع ملاحظات</span>' : '<span class="ok">تم الانتهاء</span>') + '</b>: حُفظت ' + ar(ok) + ' من ' + ar(report.length) + ' شعب' +
        (miss ? '، و' + ar(miss) + ' طالب يحتاج إدخالًا يدويًا' : '') + '.';
      var b = document.createElement('button'); b.className = 'btn g'; b.textContent = 'إعادة تحميل الصفحة لمراجعة الكشوف';
      b.onclick = function () { location.reload(); }; bd.appendChild(b);
    }
    next();
  }
  start();
})();
