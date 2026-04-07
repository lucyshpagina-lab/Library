import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

const EMOJIS: Record<string, string> = {
  passed: '✅',
  failed: '❌',
  skipped: '⏭️',
  timedOut: '⏰',
  interrupted: '🛑',
};

const PASS_JOKES = [
  "All tests passed! Time to mass-deploy straight to production. What could go wrong? 🚀💥",
  "100% pass rate! Your code is so clean, it could eat off itself. 🧹✨",
  "Every test green! Even the intern is impressed. 👶👏",
  "All passed! Somewhere, a QA engineer just shed a tear of joy. 😭💚",
  "Perfect score! Your tests are more reliable than my WiFi. 📡",
  "All green! The bugs have left the building. Elvis would be proud. 🕺",
  "100% passed! Quick, screenshot this before it changes! 📸",
  "Flawless victory! FATALITY on all bugs! 🎮💀",
];

const FAIL_JOKES = [
  "Some tests failed... but hey, at least they FOUND the bugs! Better here than in prod, right? RIGHT? 😅",
  "Failed tests detected! Time to blame the framework. It's never our code. 🤷",
  "Tests failed. Have you tried turning it off and on again? 🔄",
  "Houston, we have a problem. But it's fine. Everything is fine. 🔥🐕☕🔥",
  "Some tests failed... Looks like the code needs a hug. 🤗🐛",
  "Red tests! Don't panic. Panic is for people who don't have git revert. 😏",
  "Failed! The code just said 'it's not a bug, it's a feature' and crashed. 💫",
];

const FUN_FACTS = [
  "🦕 Fun fact: The first computer bug was an actual moth found in a relay of the Harvard Mark II computer in 1947.",
  "🎮 Fun fact: The Konami Code (↑↑↓↓←→←→BA) works on some websites. Try it!",
  "🐧 Fun fact: Linux was created by Linus Torvalds in 1991 when he was just 21 years old.",
  "☕ Fun fact: Java was originally called 'Oak' after an oak tree outside James Gosling's office.",
  "🐍 Fun fact: Python is named after Monty Python, not the snake.",
  "📖 Fun fact: The Library of Alexandria held ~400,000 scrolls. Your Library app has 200 books. Getting there!",
  "🤖 Fun fact: The term 'robot' comes from Czech 'robota' meaning forced labor.",
  "🌐 Fun fact: The first website ever created is still online: info.cern.ch",
];

const MOTIVATIONAL = [
  "Remember: every expert was once a beginner who refused to give up! 💪",
  "Code is like humor. When you have to explain it, it's bad. — Cory House 😄",
  "First, solve the problem. Then, write the code. — John Johnson 🧠",
  "The best error message is the one that never shows up. — Thomas Fuchs 🎯",
];

class FunReporter implements Reporter {
  private results: { test: TestCase; result: TestResult }[] = [];
  private startTime = 0;
  private testNumber = 0;

  onBegin() {
    this.startTime = Date.now();
    console.log('\n' + '🌟'.repeat(30));
    console.log('  📚 LIBRARY AUTOTEST SUITE 📚');
    console.log('  🕐 ' + new Date().toLocaleString());
    console.log('🌟'.repeat(30) + '\n');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push({ test, result });
    this.testNumber++;
    const emoji = EMOJIS[result.status] || '❓';
    const duration = (result.duration / 1000).toFixed(1);
    const num = String(this.testNumber).padStart(2, ' ');
    const filePath = test.location.file;
    const type = filePath.includes('/positive/') ? '\x1b[42m P \x1b[0m' :
                 filePath.includes('/negative/') ? '\x1b[41m N \x1b[0m' :
                 filePath.includes('/security/') ? '\x1b[45m S \x1b[0m' : '   ';
    console.log(`  ${emoji} #${num} ${type} │ ${test.title} (${duration}s)`);
  }

  onEnd(_result: FullResult) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const passed = this.results.filter(r => r.result.status === 'passed').length;
    const failed = this.results.filter(r => r.result.status === 'failed').length;
    const skipped = this.results.filter(r => r.result.status === 'skipped').length;
    const total = this.results.length;

    const positive = this.results.filter(r => r.test.location.file.includes('/positive/')).length;
    const negative = this.results.filter(r => r.test.location.file.includes('/negative/')).length;
    const security = this.results.filter(r => r.test.location.file.includes('/security/')).length;
    const posPass = this.results.filter(r => r.test.location.file.includes('/positive/') && r.result.status === 'passed').length;
    const negPass = this.results.filter(r => r.test.location.file.includes('/negative/') && r.result.status === 'passed').length;
    const secPass = this.results.filter(r => r.test.location.file.includes('/security/') && r.result.status === 'passed').length;

    console.log('\n' + '═'.repeat(60));
    console.log(`  📊 SCOREBOARD`);
    console.log(`  ✅ Passed:    ${passed}/${total}`);
    console.log(`  ❌ Failed:    ${failed}/${total}`);
    console.log(`  ⏭️  Skipped:   ${skipped}/${total}`);
    console.log(`  ⏱️  Duration:  ${duration}s`);
    console.log(`  ─────────────────────────────`);
    console.log(`  🟢 Positive:  ${posPass}/${positive}`);
    console.log(`  🔴 Negative:  ${negPass}/${negative}`);
    console.log(`  🟣 Security:  ${secPass}/${security}`);
    console.log('═'.repeat(60));

    const joke = failed === 0
      ? PASS_JOKES[Math.floor(Math.random() * PASS_JOKES.length)]
      : FAIL_JOKES[Math.floor(Math.random() * FAIL_JOKES.length)];
    const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
    const motivation = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];

    console.log(`\n  😂 ${joke}`);
    console.log(`\n  ${fact}`);
    console.log(`\n  💡 ${motivation}`);

    this.generateHtmlReport(passed, failed, skipped, total, duration, joke, fact, motivation,
      { positive, negative, security, posPass, negPass, secPass });
  }

  private generateHtmlReport(passed: number, failed: number, skipped: number, total: number, duration: string, joke: string, fact: string, motivation: string,
    types: { positive: number; negative: number; security: number; posPass: number; negPass: number; secPass: number }) {
    const reportDir = path.join(__dirname, '..', 'report');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const testsByFile: Record<string, { test: TestCase; result: TestResult; num: number }[]> = {};
    let num = 0;
    for (const r of this.results) {
      num++;
      const file = r.test.location.file.split('/').pop() || 'unknown';
      if (!testsByFile[file]) testsByFile[file] = [];
      testsByFile[file].push({ ...r, num });
    }

    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const moodEmoji = passRate === 100 ? '🎉🥳🏆' : passRate >= 80 ? '😊👍' : passRate >= 50 ? '😬🔧' : '😱🆘🚒';
    const moodText = passRate === 100 ? 'PERFECT! ALL TESTS PASSED!' :
      passRate >= 80 ? 'Almost there! Just a few hiccups.' :
      passRate >= 50 ? 'Hmm... we\'ve got some work to do.' : 'MAYDAY MAYDAY! BUGS EVERYWHERE!';

    const barColor = passRate === 100 ? '#10b981' : passRate >= 80 ? '#84cc16' : passRate >= 50 ? '#f59e0b' : '#ef4444';

    let testRows = '';
    for (const [file, tests] of Object.entries(testsByFile)) {
      const fileIcon = file.includes('auth') ? '🔐' : file.includes('catalog') ? '📚' : file.includes('crud') ? '📖' : file.includes('interact') ? '⭐' : file.includes('fav') ? '❤️' : file.includes('api') ? '🛡️' : '📋';
      const fileType = file.includes('positive') ? '<span class="badge badge-pos">POSITIVE</span>' :
                        file.includes('negative') ? '<span class="badge badge-neg">NEGATIVE</span>' :
                        file.includes('security') ? '<span class="badge badge-sec">SECURITY</span>' : '';
      const filePass = tests.filter(t => t.result.status === 'passed').length;
      const fileTotal = tests.length;
      testRows += `<tr class="file-header"><td colspan="5">${fileIcon} ${file} ${fileType} <span class="file-stats">${filePass}/${fileTotal} passed</span></td></tr>`;

      for (const { test: t, result: r, num: n } of tests) {
        const emoji = EMOJIS[r.status] || '❓';
        const statusClass = r.status === 'passed' ? 'pass' : r.status === 'failed' ? 'fail' : 'skip';
        const dur = (r.duration / 1000).toFixed(2);

        let stepsHtml = '';
        if (r.steps && r.steps.length > 0) {
          stepsHtml = '<div class="steps">';
          for (const step of r.steps) {
            const sIcon = step.error ? '❌' : '✅';
            const sDur = step.duration ? ` <span class="step-dur">${(step.duration / 1000).toFixed(2)}s</span>` : '';
            const sClass = step.error ? 'step-fail' : 'step-pass';
            stepsHtml += `<div class="step ${sClass}">${sIcon} ${esc(step.title)}${sDur}</div>`;
            if (step.steps) {
              for (const sub of step.steps) {
                const subIcon = sub.error ? '❌' : '✅';
                stepsHtml += `<div class="step sub ${sub.error ? 'step-fail' : 'step-pass'}">${subIcon} ${esc(sub.title)}</div>`;
              }
            }
          }
          stepsHtml += '</div>';
        }

        let errorHtml = '';
        if (r.errors?.length) {
          errorHtml = `<div class="error-box">💥 ${esc((r.errors[0]?.message || 'Unknown error').substring(0, 500))}</div>`;
        }

        let screenshotHtml = '';
        if (r.status === 'failed' && r.attachments) {
          for (const att of r.attachments) {
            if (att.contentType?.startsWith('image/') && att.path) {
              try {
                const imgData = fs.readFileSync(att.path);
                const base64 = imgData.toString('base64');
                screenshotHtml += `<div class="screenshot"><p class="screenshot-label">📸 Screenshot on failure:</p><img src="data:${att.contentType};base64,${base64}" alt="Failed test screenshot" /></div>`;
              } catch {}
            }
          }
        }

        // Extract technique tags like [EP], [BVA], [Use Case] from title
        const tagRegex = /\[([^\]]+)\]/g;
        let titleClean = esc(t.title);
        let tags = '';
        let match;
        while ((match = tagRegex.exec(t.title)) !== null) {
          const tag = match[1];
          const tagClass = tag.includes('EP') ? 'tag-ep' : tag.includes('BVA') ? 'tag-bva' :
            tag.includes('State') ? 'tag-state' : tag.includes('Use Case') || tag.includes('Scenario') ? 'tag-uc' :
            tag.includes('Cause') ? 'tag-ce' : tag.includes('SQL') ? 'tag-sql' : tag.includes('XSS') ? 'tag-xss' :
            tag.includes('Auth') || tag.includes('Token') || tag.includes('Security') ? 'tag-sec' :
            tag.includes('DoS') ? 'tag-dos' : 'tag-other';
          tags += `<span class="technique-tag ${tagClass}">${esc(tag)}</span>`;
          titleClean = titleClean.replace(`[${esc(tag)}]`, '');
        }

        testRows += `
          <tr class="test-row ${statusClass}">
            <td class="test-num">#${n}</td>
            <td class="test-emoji">${emoji}</td>
            <td class="test-info">
              <div class="test-name">${titleClean.trim()} ${tags}</div>
              ${stepsHtml}
              ${errorHtml}
              ${screenshotHtml}
            </td>
            <td class="test-dur">${dur}s</td>
            <td class="test-status status-${statusClass}">${r.status.toUpperCase()}</td>
          </tr>`;
      }
    }

    const randomAnimal = ['🦄', '🐙', '🦊', '🐲', '🦋', '🐬', '🦜', '🐢'][Math.floor(Math.random() * 8)];
    const now = new Date();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${passRate === 100 ? '🏆' : '📊'} Library Tests — ${passed}/${total} passed</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:#fff;padding:1.5rem}
.container{max-width:1000px;margin:0 auto}

.header{text-align:center;padding:2rem 0 1.5rem}
.header h1{font-size:2.8rem;background:linear-gradient(90deg,#ff6b9a,#c084fc,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem;animation:glow 2s ease-in-out infinite alternate}
@keyframes glow{from{filter:brightness(1)}to{filter:brightness(1.3)}}
.header .mood{font-size:1.5rem;margin:.5rem 0}
.header .date{opacity:.5;font-size:.85rem}

.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:.8rem;margin-bottom:1.5rem}
.card{background:rgba(255,255,255,.08);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1.2rem;text-align:center;transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-4px);box-shadow:0 8px 25px rgba(0,0,0,.3)}
.card .icon{font-size:1.8rem;margin-bottom:.4rem}
.card .val{font-size:2rem;font-weight:800}
.card .lbl{font-size:.75rem;opacity:.6;margin-top:.2rem}
.card.c-pass .val{color:#34d399}.card.c-fail .val{color:#f87171}.card.c-skip .val{color:#fbbf24}.card.c-total .val{color:#a78bfa}.card.c-time .val{color:#60a5fa;font-size:1.4rem}

.bar-wrap{background:rgba(255,255,255,.08);border-radius:16px;padding:1.2rem;margin-bottom:1.2rem;border:1px solid rgba(255,255,255,.1)}
.bar-bg{background:rgba(255,255,255,.1);border-radius:99px;height:36px;overflow:hidden}
.bar-fill{height:100%;border-radius:99px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;transition:width 1.5s cubic-bezier(.4,0,.2,1);background:${barColor}}
.bar-label{text-align:center;margin-top:.8rem;font-size:1.1rem;font-weight:600}

.fun-box{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-bottom:1.5rem}
.fun-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.2rem}
.fun-card h3{font-size:.85rem;opacity:.5;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:1px}
.fun-card p{font-size:.95rem;line-height:1.5}

.table-wrap{background:rgba(255,255,255,.06);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08);margin-bottom:1.5rem}
table{width:100%;border-collapse:collapse}
th{padding:.8rem 1rem;text-align:left;font-size:.8rem;text-transform:uppercase;letter-spacing:1px;opacity:.5;border-bottom:1px solid rgba(255,255,255,.1)}
td{padding:.6rem 1rem;border-bottom:1px solid rgba(255,255,255,.05);vertical-align:top}
.file-header td{background:rgba(99,102,241,.15);font-weight:700;font-size:.9rem;color:#a5b4fc;padding:.5rem 1rem}
.file-stats{float:right;font-size:.75rem;opacity:.6;font-weight:400}
.test-row:hover{background:rgba(255,255,255,.03)}
.test-num{font-weight:700;opacity:.5;font-size:.85rem;white-space:nowrap;width:40px}
.test-emoji{width:30px;text-align:center}
.test-name{font-weight:600;margin-bottom:.3rem}
.test-dur{opacity:.4;font-size:.85rem;white-space:nowrap;width:60px}
.test-status{font-weight:700;font-size:.8rem;width:70px;text-align:center;border-radius:6px;white-space:nowrap}
.status-pass{color:#34d399}.status-fail{color:#f87171}.status-skip{color:#fbbf24}

.steps{margin-top:.4rem;padding-left:.6rem;border-left:2px solid rgba(255,255,255,.1)}
.step{font-size:.78rem;padding:2px 0 2px 8px;opacity:.7}
.step.sub{padding-left:24px}
.step-pass{opacity:.6}.step-fail{opacity:1;color:#f87171}
.step-dur{opacity:.4}
.error-box{margin-top:.5rem;padding:.6rem;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:8px;font-size:.78rem;color:#fca5a5;font-family:monospace;word-break:break-all}

.badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:.65rem;font-weight:700;letter-spacing:1px;margin-left:6px;vertical-align:middle}
.badge-pos{background:#10b981;color:#fff}.badge-neg{background:#ef4444;color:#fff}.badge-sec{background:#8b5cf6;color:#fff}
.c-pos .val{color:#10b981}.c-neg .val{color:#ef4444}.c-sec .val{color:#8b5cf6}

.technique-tag{display:inline-block;padding:1px 6px;border-radius:4px;font-size:.65rem;font-weight:600;margin-left:4px;vertical-align:middle}
.tag-ep{background:rgba(59,130,246,.2);color:#93c5fd}.tag-bva{background:rgba(245,158,11,.2);color:#fcd34d}
.tag-state{background:rgba(16,185,129,.2);color:#6ee7b7}.tag-uc{background:rgba(99,102,241,.2);color:#a5b4fc}
.tag-ce{background:rgba(236,72,153,.2);color:#f9a8d4}.tag-sql{background:rgba(239,68,68,.2);color:#fca5a5}
.tag-xss{background:rgba(249,115,22,.2);color:#fdba74}.tag-sec{background:rgba(139,92,246,.2);color:#c4b5fd}
.tag-dos{background:rgba(220,38,38,.2);color:#fca5a5}.tag-other{background:rgba(148,163,184,.2);color:#cbd5e1}

.screenshot{margin-top:.5rem;padding:.5rem;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:8px}
.screenshot img{max-width:100%;border-radius:6px;margin-top:.3rem;border:1px solid rgba(255,255,255,.1)}
.screenshot-label{font-size:.75rem;color:#fca5a5;font-weight:600}

.footer{text-align:center;padding:2rem 0;opacity:.4;font-size:.8rem}
.footer a{color:#a5b4fc}

@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.card,.bar-wrap,.fun-card,.table-wrap{animation:fadeUp .5s ease forwards}
.card:nth-child(2){animation-delay:.05s}.card:nth-child(3){animation-delay:.1s}.card:nth-child(4){animation-delay:.15s}.card:nth-child(5){animation-delay:.2s}
@media(max-width:640px){.cards{grid-template-columns:repeat(3,1fr)}.fun-box{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="container">

<div class="header">
  <h1>${randomAnimal} Library Test Report</h1>
  <div class="mood">${moodEmoji} ${moodText}</div>
  <div class="date">Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()} | Playwright + TypeScript</div>
</div>

<div class="cards">
  <div class="card c-total"><div class="icon">📊</div><div class="val">${total}</div><div class="lbl">Total Tests</div></div>
  <div class="card c-pass"><div class="icon">✅</div><div class="val">${passed}</div><div class="lbl">Passed</div></div>
  <div class="card c-fail"><div class="icon">${failed > 0 ? '💀' : '😎'}</div><div class="val">${failed}</div><div class="lbl">Failed</div></div>
  <div class="card c-skip"><div class="icon">⏭️</div><div class="val">${skipped}</div><div class="lbl">Skipped</div></div>
  <div class="card c-time"><div class="icon">⚡</div><div class="val">${duration}s</div><div class="lbl">Duration</div></div>
</div>

<div class="cards" style="grid-template-columns:repeat(3,1fr)">
  <div class="card c-pos"><div class="icon">🟢</div><div class="val">${types.posPass}/${types.positive}</div><div class="lbl">Positive</div></div>
  <div class="card c-neg"><div class="icon">🔴</div><div class="val">${types.negPass}/${types.negative}</div><div class="lbl">Negative</div></div>
  <div class="card c-sec"><div class="icon">🟣</div><div class="val">${types.secPass}/${types.security}</div><div class="lbl">Security</div></div>
</div>

<div class="bar-wrap">
  <div class="bar-bg"><div class="bar-fill" style="width:${passRate}%">${passRate}%</div></div>
  <div class="bar-label">${passRate === 100 ? '🏆 FLAWLESS VICTORY!' : passRate >= 80 ? '💪 Almost perfect!' : `🔧 ${100 - passRate}% needs fixing`}</div>
</div>

<div class="fun-box">
  <div class="fun-card">
    <h3>😂 Joke of the Run</h3>
    <p>${esc(joke)}</p>
  </div>
  <div class="fun-card">
    <h3>🧠 Did You Know?</h3>
    <p>${esc(fact)}</p>
  </div>
</div>
<div class="fun-box">
  <div class="fun-card" style="grid-column:1/-1">
    <h3>💡 Motivation</h3>
    <p>${esc(motivation)}</p>
  </div>
</div>

<div class="table-wrap">
  <table>
    <thead><tr><th>#</th><th></th><th>Test</th><th>Time</th><th>Status</th></tr></thead>
    <tbody>${testRows}</tbody>
  </table>
</div>

<div class="footer">
  Built with 🧪 <a href="https://playwright.dev">Playwright</a> | 📚 Library Autotest Suite | ${randomAnimal} Have a great day!
</div>

</div>
</body>
</html>`;

    const reportPath = path.join(reportDir, 'index.html');
    fs.writeFileSync(reportPath, html);
    console.log(`\n  📄 Report: file://${reportPath}\n`);
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default FunReporter;
