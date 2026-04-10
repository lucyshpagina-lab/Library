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
  'All tests passed! Time to mass-deploy straight to production. What could go wrong? 🚀💥',
  '100% pass rate! Your code is so clean, it could eat off itself. 🧹✨',
  'Every test green! Even the intern is impressed. 👶👏',
  'All passed! Somewhere, a QA engineer just shed a tear of joy. 😭💚',
  'Perfect score! Your tests are more reliable than my WiFi. 📡',
  'All green! The bugs have left the building. Elvis would be proud. 🕺',
  '100% passed! Quick, screenshot this before it changes! 📸',
  'Flawless victory! FATALITY on all bugs! 🎮💀',
];

const FAIL_JOKES = [
  'Some tests failed... but hey, at least they FOUND the bugs! Better here than in prod, right? RIGHT? 😅',
  "Failed tests detected! Time to blame the framework. It's never our code. 🤷",
  'Tests failed. Have you tried turning it off and on again? 🔄',
  "Houston, we have a problem. But it's fine. Everything is fine. 🔥🐕☕🔥",
  'Some tests failed... Looks like the code needs a hug. 🤗🐛',
  "Red tests! Don't panic. Panic is for people who don't have git revert. 😏",
  "Failed! The code just said 'it's not a bug, it's a feature' and crashed. 💫",
];

const FUN_FACTS = [
  '🦕 Fun fact: The first computer bug was an actual moth found in a relay of the Harvard Mark II computer in 1947.',
  '🎮 Fun fact: The Konami Code (↑↑↓↓←→←→BA) works on some websites. Try it!',
  '🐧 Fun fact: Linux was created by Linus Torvalds in 1991 when he was just 21 years old.',
  "☕ Fun fact: Java was originally called 'Oak' after an oak tree outside James Gosling's office.",
  '🐍 Fun fact: Python is named after Monty Python, not the snake.',
  '📖 Fun fact: The Library of Alexandria held ~400,000 scrolls. Your Library app has 200 books. Getting there!',
  "🤖 Fun fact: The term 'robot' comes from Czech 'robota' meaning forced labor.",
  '🌐 Fun fact: The first website ever created is still online: info.cern.ch',
];

const MOTIVATIONAL = [
  'Remember: every expert was once a beginner who refused to give up! 💪',
  "Code is like humor. When you have to explain it, it's bad. — Cory House 😄",
  'First, solve the problem. Then, write the code. — John Johnson 🧠',
  'The best error message is the one that never shows up. — Thomas Fuchs 🎯',
];

interface TabCategory {
  key: string;
  label: string;
  color: string;
  matcher: (filePath: string) => boolean;
}

const TAB_CATEGORIES: TabCategory[] = [
  {
    key: 'positive',
    label: 'Positive',
    color: '#34d399',
    matcher: (f) => f.includes('/positive/'),
  },
  {
    key: 'negative',
    label: 'Negative',
    color: '#f87171',
    matcher: (f) => f.includes('/negative/'),
  },
  {
    key: 'security',
    label: 'Security',
    color: '#a78bfa',
    matcher: (f) => f.includes('/security/'),
  },
  { key: 'load', label: 'Load', color: '#7dd3fc', matcher: (f) => f.includes('/load/') },
  { key: 'chatbot', label: 'Chatbot', color: '#ec4899', matcher: (f) => f.includes('/chatbot/') },
  { key: 'db', label: 'DB', color: '#14b8a6', matcher: (f) => f.includes('/db/') },
  { key: 'regression', label: 'Regression', color: '#fbbf24', matcher: (f) => true },
];

function classifyTest(filePath: string): string {
  if (filePath.includes('/positive/')) return 'positive';
  if (filePath.includes('/negative/')) return 'negative';
  if (filePath.includes('/security/')) return 'security';
  if (filePath.includes('/load/')) return 'load';
  if (filePath.includes('/chatbot/')) return 'chatbot';
  if (filePath.includes('/db/')) return 'db';
  if (filePath.includes('/regression/')) return 'regression';
  return 'regression';
}

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
    const type = filePath.includes('/positive/')
      ? '\x1b[42m P \x1b[0m'
      : filePath.includes('/negative/')
        ? '\x1b[41m N \x1b[0m'
        : filePath.includes('/security/')
          ? '\x1b[45m S \x1b[0m'
          : filePath.includes('/load/')
            ? '\x1b[44m L \x1b[0m'
            : filePath.includes('/regression/')
              ? '\x1b[43m R \x1b[0m'
              : '   ';
    console.log(`  ${emoji} #${num} ${type} │ ${test.title} (${duration}s)`);
  }

  onEnd(_result: FullResult) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const passed = this.results.filter((r) => r.result.status === 'passed').length;
    const failed = this.results.filter((r) => r.result.status === 'failed').length;
    const skipped = this.results.filter((r) => r.result.status === 'skipped').length;
    const total = this.results.length;

    const positive = this.results.filter((r) => r.test.location.file.includes('/positive/')).length;
    const negative = this.results.filter((r) => r.test.location.file.includes('/negative/')).length;
    const security = this.results.filter((r) => r.test.location.file.includes('/security/')).length;
    const load = this.results.filter((r) => r.test.location.file.includes('/load/')).length;
    const posPass = this.results.filter(
      (r) => r.test.location.file.includes('/positive/') && r.result.status === 'passed',
    ).length;
    const negPass = this.results.filter(
      (r) => r.test.location.file.includes('/negative/') && r.result.status === 'passed',
    ).length;
    const secPass = this.results.filter(
      (r) => r.test.location.file.includes('/security/') && r.result.status === 'passed',
    ).length;
    const loadPass = this.results.filter(
      (r) => r.test.location.file.includes('/load/') && r.result.status === 'passed',
    ).length;
    const chatbot = this.results.filter((r) => r.test.location.file.includes('/chatbot/')).length;
    const chatbotPass = this.results.filter(
      (r) => r.test.location.file.includes('/chatbot/') && r.result.status === 'passed',
    ).length;
    const db = this.results.filter((r) => r.test.location.file.includes('/db/')).length;
    const dbPass = this.results.filter(
      (r) => r.test.location.file.includes('/db/') && r.result.status === 'passed',
    ).length;
    const regression = this.results.filter((r) =>
      r.test.location.file.includes('/regression/'),
    ).length;
    const regPass = this.results.filter(
      (r) => r.test.location.file.includes('/regression/') && r.result.status === 'passed',
    ).length;

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
    console.log(`  🔵 Load:      ${loadPass}/${load}`);
    console.log(`  🩷 Chatbot:   ${chatbotPass}/${chatbot}`);
    console.log(`  🟠 DB:        ${dbPass}/${db}`);
    console.log(`  🟡 Regression: ${regPass}/${regression}`);
    console.log('═'.repeat(60));

    const joke =
      failed === 0
        ? PASS_JOKES[Math.floor(Math.random() * PASS_JOKES.length)]
        : FAIL_JOKES[Math.floor(Math.random() * FAIL_JOKES.length)];
    const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
    const motivation = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];

    console.log(`\n  😂 ${joke}`);
    console.log(`\n  ${fact}`);
    console.log(`\n  💡 ${motivation}`);

    this.generateHtmlReport(passed, failed, skipped, total, duration, joke, fact, motivation, {
      positive,
      negative,
      security,
      load,
      chatbot,
      db,
      regression,
      posPass,
      negPass,
      secPass,
      loadPass,
      chatbotPass,
      dbPass,
      regPass,
    });
  }

  private generateHtmlReport(
    passed: number,
    failed: number,
    skipped: number,
    total: number,
    duration: string,
    joke: string,
    fact: string,
    motivation: string,
    types: {
      positive: number;
      negative: number;
      security: number;
      load: number;
      chatbot: number;
      db: number;
      regression: number;
      posPass: number;
      negPass: number;
      secPass: number;
      loadPass: number;
      chatbotPass: number;
      dbPass: number;
      regPass: number;
    },
  ) {
    const reportDir = path.join(__dirname, '..', 'report');
    const dataDir = path.join(reportDir, 'data');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    // Load previous result for comparison
    const historyPath = path.join(dataDir, 'last-result.json');
    let prev: {
      passed: number;
      failed: number;
      skipped: number;
      total: number;
      duration: string;
      date: string;
    } | null = null;
    try {
      if (fs.existsSync(historyPath)) prev = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch {}
    // Save current result for next comparison
    fs.writeFileSync(
      historyPath,
      JSON.stringify({ passed, failed, skipped, total, duration, date: new Date().toISOString() }),
    );

    // Group results by category, then by file within each category
    const categorized: Record<string, { test: TestCase; result: TestResult; num: number }[]> = {
      positive: [],
      negative: [],
      security: [],
      load: [],
      chatbot: [],
      db: [],
      regression: [],
    };

    let num = 0;
    for (const r of this.results) {
      num++;
      const cat = classifyTest(r.test.location.file);
      categorized[cat].push({ ...r, num });
    }

    // Compute per-category stats
    const catStats: Record<string, { passed: number; total: number; failed: number }> = {};
    for (const cat of Object.keys(categorized)) {
      const items = categorized[cat];
      catStats[cat] = {
        total: items.length,
        passed: items.filter((i) => i.result.status === 'passed').length,
        failed: items.filter((i) => i.result.status === 'failed').length,
      };
    }

    // Determine default active tab: first with failures, or 'positive'
    let defaultTab = 'positive';
    for (const cat of TAB_CATEGORIES) {
      if (catStats[cat.key].failed > 0) {
        defaultTab = cat.key;
        break;
      }
    }

    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const moodEmoji =
      passRate === 100 ? '🎉🥳🏆' : passRate >= 80 ? '😊👍' : passRate >= 50 ? '😬🔧' : '😱🆘🚒';
    const moodText =
      passRate === 100
        ? 'PERFECT! ALL TESTS PASSED!'
        : passRate >= 80
          ? 'Almost there! Just a few hiccups.'
          : passRate >= 50
            ? "Hmm... we've got some work to do."
            : 'MAYDAY MAYDAY! BUGS EVERYWHERE!';

    const barColor =
      passRate === 100
        ? '#10b981'
        : passRate >= 80
          ? '#84cc16'
          : passRate >= 50
            ? '#f59e0b'
            : '#ef4444';

    // Build test rows for each category
    let screenshotCounter = 0;
    const tabContents: Record<string, string> = {};

    for (const cat of TAB_CATEGORIES) {
      const items = categorized[cat.key];
      if (items.length === 0) {
        tabContents[cat.key] =
          `<div class="empty-tab">No ${cat.label.toLowerCase()} tests in this run.</div>`;
        continue;
      }

      // Group by subfolder (auth, book-crud, catalog, etc.)
      const byGroup: Record<string, typeof items> = {};
      for (const item of items) {
        const parts = item.test.location.file.split('/');
        const fileName = parts.pop() || 'unknown';
        const parentDir = parts.pop() || '';
        const groupKey =
          parentDir === cat.key || parentDir === 'tests'
            ? fileName.replace('.spec.ts', '')
            : parentDir;
        if (!byGroup[groupKey]) byGroup[groupKey] = [];
        byGroup[groupKey].push(item);
      }

      let rows = '';
      for (const [group, tests] of Object.entries(byGroup)) {
        const g = group.toLowerCase();
        const groupLabel = g.includes('auth')
          ? '🔐 Auth'
          : g.includes('catalog')
            ? '📚 Catalog'
            : g.includes('crud') || g.includes('book-crud')
              ? '📖 Book CRUD'
              : g.includes('interact')
                ? '⭐ Book Interactions'
                : g.includes('fav')
                  ? '❤️ Favorites'
                  : g.includes('api')
                    ? '🛡️ API'
                    : g.includes('book')
                      ? '📖 Book'
                      : g.includes('load')
                        ? '⚡ Load'
                        : g.includes('chat')
                          ? '💬 Chatbot'
                          : g.includes('db')
                            ? '🗄️ DB'
                            : g.includes('reg')
                              ? '📋 Regression'
                              : `📋 ${group}`;
        const filePass = tests.filter((t) => t.result.status === 'passed').length;
        const fileTotal = tests.length;
        rows += `<tr class="file-header"><td colspan="5">${groupLabel} <span class="file-stats">${filePass}/${fileTotal} passed</span></td></tr>`;

        for (const { test: t, result: r, num: n } of tests) {
          const emoji = EMOJIS[r.status] || '❓';
          const statusClass =
            r.status === 'passed' ? 'pass' : r.status === 'failed' ? 'fail' : 'skip';
          const dur = (r.duration / 1000).toFixed(2);

          let stepsHtml = '';
          if (r.status === 'failed' && r.steps && r.steps.length > 0) {
            stepsHtml = '<div class="steps">';
            const isInternalStep = (title: string) =>
              /^(Before Hooks|After Hooks|Worker Cleanup|Fixture '|browserContext\.|page\.)/.test(
                title,
              );
            const flattenSteps = (steps: typeof r.steps): typeof r.steps => {
              const result: typeof r.steps = [];
              for (const step of steps) {
                if (isInternalStep(step.title)) {
                  if (step.steps) result.push(...flattenSteps(step.steps));
                } else {
                  result.push(step);
                }
              }
              return result;
            };
            const userSteps = flattenSteps(r.steps);
            for (const step of userSteps) {
              const sIcon = step.error ? '❌' : '✅';
              const sDur = step.duration
                ? ` <span class="step-dur">${(step.duration / 1000).toFixed(2)}s</span>`
                : '';
              const sClass = step.error ? 'step-fail' : 'step-pass';
              stepsHtml += `<div class="step ${sClass}">${sIcon} ${esc(step.title)}${sDur}</div>`;
              if (step.steps) {
                const userSubs = step.steps.filter((s) => !isInternalStep(s.title));
                for (const sub of userSubs) {
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
                  if (fs.existsSync(att.path)) {
                    screenshotCounter++;
                    const ext = path.extname(att.path) || '.png';
                    const destName = `screenshot-${screenshotCounter}${ext}`;
                    const destPath = path.join(dataDir, destName);
                    fs.copyFileSync(att.path, destPath);
                    screenshotHtml += `<div class="screenshot"><p class="screenshot-label">📸 Screenshot on failure:</p><img src="data/${destName}" alt="Failed test screenshot" /></div>`;
                  }
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
            const tagClass = tag.includes('EP')
              ? 'tag-ep'
              : tag.includes('BVA')
                ? 'tag-bva'
                : tag.includes('State')
                  ? 'tag-state'
                  : tag.includes('Use Case') || tag.includes('Scenario')
                    ? 'tag-uc'
                    : tag.includes('Cause')
                      ? 'tag-ce'
                      : tag.includes('SQL')
                        ? 'tag-sql'
                        : tag.includes('XSS')
                          ? 'tag-xss'
                          : tag.includes('Auth') ||
                              tag.includes('Token') ||
                              tag.includes('Security')
                            ? 'tag-sec'
                            : tag.includes('DoS')
                              ? 'tag-dos'
                              : 'tag-other';
            tags += `<span class="technique-tag ${tagClass}">${esc(tag)}</span>`;
            titleClean = titleClean.replace(`[${esc(tag)}]`, '');
          }

          rows += `
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

      tabContents[cat.key] = `<table><tbody>${rows}</tbody></table>`;
    }

    // Build tab buttons HTML — no tab active by default
    let tabButtonsHtml = '';
    for (const cat of TAB_CATEGORIES) {
      const stats = catStats[cat.key];
      tabButtonsHtml += `<button class="tab-btn" data-tab="${cat.key}" style="--tab-color:${cat.color}">${cat.label} <span class="tab-count">${stats.passed}/${stats.total}</span></button>`;
    }

    // Build tab content panels — none active by default, show welcome instead
    let tabPanelsHtml = `<div class="tab-panel welcome-panel active" data-tab="welcome"><div class="welcome-msg"><div class="welcome-emoji">${failed > 0 ? '🐛' : '🧘'}</div><p>now buddy I walk you through the bugs (or not)</p><p class="welcome-hint">pick a tab above to explore</p></div></div>`;
    for (const cat of TAB_CATEGORIES) {
      tabPanelsHtml += `<div class="tab-panel" data-tab="${cat.key}">${tabContents[cat.key]}</div>`;
    }

    const randomAnimal = ['🦄', '🐙', '🦊', '🐲', '🦋', '🐬', '🦜', '🐢'][
      Math.floor(Math.random() * 8)
    ];
    const now = new Date();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${passRate === 100 ? '🏆' : '📊'} Library Tests — ${passed}/${total} passed</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;background:linear-gradient(180deg,#f0fdf4 0%,#dcfce7 40%,#bbf7d0 100%);color:#14532d;padding:1.5rem;cursor:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text y='24' font-size='24'>☀️</text></svg>") 16 16, auto}
.container{max-width:1000px;margin:0 auto}

.header{text-align:center;padding:1.5rem 0 1rem}
.header h1{font-size:2.4rem;color:#166534;margin-bottom:.3rem}
.header .mood{font-size:1.2rem;margin:.3rem 0 .8rem;color:#15803d}
.header .date{font-size:.8rem;color:#92400e;background:#fef3c7;border:1px solid #fde68a;display:inline-block;padding:4px 16px;border-radius:99px}

/* Summary row: pie chart + duration */
.summary-row{display:flex;gap:1.2rem;margin-bottom:1.5rem;align-items:stretch}
.prev-panel{width:140px;background:rgba(255,255,255,.6);border:1px dashed rgba(150,150,150,.3);border-radius:16px;padding:1rem .8rem;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.panel-label{font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:.3rem}
.panel-date{font-size:.65rem;color:#9ca3af;margin-bottom:.5rem}
.panel-stats{display:flex;flex-direction:column;gap:.3rem;width:100%}
.ps{font-size:.8rem;font-weight:600;display:flex;align-items:center;gap:.3rem}
.ps.passed{color:#059669}.ps.failed{color:#dc2626}.ps.skipped{color:#d97706}.ps.total{color:#166534}
.pie-wrap{flex:1;position:relative;background:rgba(255,255,255,.75);border:1px solid rgba(34,197,94,.2);border-radius:16px;padding:1.5rem;display:flex;align-items:center;gap:1rem}
.dur-diff{font-size:.65rem;margin-top:.3rem;font-weight:600}
.pie-svg-wrap{position:relative;width:120px;height:120px;flex-shrink:0}
.pie-chart{width:120px;height:120px;transform:rotate(-90deg)}
.pie-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.pie-val{font-size:1.8rem;font-weight:800;color:#166534}
.pie-lbl{font-size:.65rem;opacity:.5}
.pie-stats{display:grid;grid-template-columns:1fr 1fr;gap:.5rem .8rem;margin-left:.5rem}
.stat-item{display:flex;align-items:center;gap:.4rem}
.stat-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.stat-val{font-size:1.3rem;font-weight:800}
.stat-lbl{font-size:.65rem;opacity:.5}
.stat-group{display:flex;flex-direction:column}
.duration-frame{width:160px;background:rgba(255,255,255,.75);border:2px dashed rgba(185,160,100,.35);border-radius:16px;padding:1.5rem 1rem;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.dur-icon{font-size:2.2rem;margin-bottom:.4rem}
.dur-val{font-size:2rem;font-weight:800;color:#0d9488}
.dur-lbl{font-size:.7rem;opacity:.5;margin-top:.2rem}
.dur-avg{font-size:.7rem;color:#059669;margin-top:.5rem;background:#d1fae5;padding:3px 10px;border-radius:8px}

/* Category cards */
.cards{display:flex;gap:.5rem;margin-bottom:1.5rem}
.card{flex:1;min-width:0;background:rgba(255,255,255,.75);backdrop-filter:blur(10px);border:1px solid rgba(34,197,94,.2);border-radius:12px;padding:.6rem .3rem;text-align:center;transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(34,197,94,.12)}
.card .icon{font-size:1rem;margin-bottom:.15rem}
.card .val{font-size:1.1rem;font-weight:800}
.card .lbl{font-size:.55rem;opacity:.6;margin-top:.1rem;text-transform:uppercase;letter-spacing:.5px}
.card-link{cursor:pointer;position:relative;overflow:hidden}
.card-link::after{content:'';position:absolute;inset:0;border-radius:inherit;opacity:0;transition:opacity .2s;background:radial-gradient(circle at center,rgba(255,255,255,.12) 0%,transparent 70%)}
.card-link:hover::after{opacity:1}

/* Creative divider */
.divider{display:flex;align-items:center;justify-content:center;gap:.8rem;margin:1.2rem 0;padding:.8rem}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(34,197,94,.3),transparent)}
.divider-leaf{font-size:1.2rem}
.divider-text{font-size:1rem;font-weight:700;color:#166534;white-space:nowrap}

/* Tabs */
.tab-panel{display:none}
.tab-panel.active{display:block}
.tabs-content{background:rgba(255,255,255,.6);border-radius:16px;overflow:hidden;border:1px solid rgba(34,197,94,.15);margin-bottom:1.5rem}
.empty-tab{padding:2rem;text-align:center;opacity:.5;font-size:.95rem}

.welcome-msg{text-align:center;padding:3rem 1rem}
.welcome-emoji{font-size:4rem;margin-bottom:1rem;animation:float 3s ease-in-out infinite}
.welcome-msg p{font-size:1.2rem;color:#166534;font-weight:600}
.welcome-hint{font-size:.85rem!important;opacity:.5;margin-top:.5rem;font-weight:400!important}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

table{width:100%;border-collapse:collapse}
td{padding:.6rem 1rem;border-bottom:1px solid rgba(34,197,94,.1);vertical-align:top}
.file-header td{background:rgba(34,197,94,.08);font-weight:700;font-size:.9rem;color:#166534;padding:.5rem 1rem}
.file-stats{float:right;font-size:.75rem;opacity:.6;font-weight:400}
.test-row{position:relative}
.test-row:hover{background:rgba(34,197,94,.06)}
.test-row::after{content:'';position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:1.1rem;opacity:0;transition:opacity .2s}
.test-row:hover::after{opacity:1}
.test-row.pass::after{content:'🌿'}
.test-row.fail::after{content:'🔥'}
.test-row.skip::after{content:'💤'}
.test-num{font-weight:700;opacity:.5;font-size:.85rem;white-space:nowrap;width:40px}
.test-emoji{width:30px;text-align:center}
.test-name{font-weight:600;margin-bottom:.3rem}
.test-dur{opacity:.4;font-size:.85rem;white-space:nowrap;width:60px}
.test-status{font-weight:700;font-size:.8rem;width:70px;text-align:center;border-radius:6px;white-space:nowrap}
.status-pass{color:#059669}.status-fail{color:#dc2626}.status-skip{color:#d97706}

.steps{margin-top:.4rem;padding-left:.6rem;border-left:2px solid rgba(16,185,129,.25)}
.step{font-size:.78rem;padding:2px 0 2px 8px;opacity:.7}
.step.sub{padding-left:24px}
.step-pass{opacity:.6}.step-fail{opacity:1;color:#dc2626}
.step-dur{opacity:.4}
.error-box{margin-top:.5rem;padding:.6rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:.78rem;color:#991b1b;font-family:monospace;word-break:break-all}

.badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:.65rem;font-weight:700;letter-spacing:1px;margin-left:6px;vertical-align:middle}
.badge-pos{background:#10b981;color:#fff}.badge-neg{background:#ef4444;color:#fff}.badge-sec{background:#8b5cf6;color:#fff}.badge-load{background:#60a5fa;color:#fff}.badge-reg{background:#f59e0b;color:#fff}
.c-pos .val{color:#059669}.c-neg .val{color:#dc2626}.c-sec .val{color:#7c3aed}.c-load .val{color:#0284c7}.c-chat .val{color:#db2777}.c-db .val{color:#0d9488}.c-reg .val{color:#d97706}


.technique-tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:.65rem;font-weight:700;margin-left:4px;vertical-align:middle}
.tag-ep{background:#dbeafe;color:#1d4ed8}.tag-bva{background:#fef3c7;color:#92400e}
.tag-state{background:#d1fae5;color:#065f46}.tag-uc{background:#e0e7ff;color:#3730a3}
.tag-ce{background:#fce7f3;color:#9d174d}.tag-sql{background:#fee2e2;color:#991b1b}
.tag-xss{background:#ffedd5;color:#9a3412}.tag-sec{background:#ede9fe;color:#5b21b6}
.tag-dos{background:#fee2e2;color:#991b1b}.tag-other{background:#f1f5f9;color:#475569}

.screenshot{margin-top:.5rem;padding:.5rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);border-radius:8px}
.screenshot img{max-width:100%;border-radius:6px;margin-top:.3rem;border:1px solid rgba(100,200,140,.15)}
.screenshot-label{font-size:.75rem;color:#dc2626;font-weight:600}
.screenshot img{border:1px solid rgba(34,197,94,.2)}

@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.card,.summary-row,.divider,.tabs-content{animation:fadeUp .5s ease forwards}
.card:nth-child(2){animation-delay:.05s}.card:nth-child(3){animation-delay:.1s}.card:nth-child(4){animation-delay:.15s}.card:nth-child(5){animation-delay:.2s}
@media(max-width:640px){.cards{grid-template-columns:repeat(3,1fr)}.fun-box{grid-template-columns:1fr}.tabs-nav{flex-direction:column}}
</style>
</head>
<body>
<div class="container">

<div class="header">
  <h1>${randomAnimal} Library Test Report</h1>
  <div class="mood">${moodEmoji} ${moodText}</div>
  <div class="date">Generated: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
</div>

<div class="summary-row">
  ${
    prev
      ? `<div class="result-panel prev-panel">
    <div class="panel-label">Previous Run</div>
    <div class="panel-date">${new Date(prev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &middot; ${prev.duration}s</div>
    <div class="panel-stats">
      <span class="ps passed">✅ ${prev.passed}</span>
      <span class="ps failed">❌ ${prev.failed}</span>
      <span class="ps skipped">⏭️ ${prev.skipped}</span>
      <span class="ps total">📊 ${prev.total}</span>
    </div>
  </div>`
      : ''
  }
  <div class="pie-wrap">
    <div class="panel-label" style="position:absolute;top:8px;left:12px">Current Run</div>
    <div class="pie-svg-wrap">
      <svg viewBox="0 0 36 36" class="pie-chart">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" stroke-width="3"/>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#059669" stroke-width="3" stroke-dasharray="${passRate} ${100 - passRate}" stroke-dashoffset="25" stroke-linecap="round"/>
        ${failed > 0 ? `<circle cx="18" cy="18" r="15.9" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="${Math.round((failed / total) * 100)} ${100 - Math.round((failed / total) * 100)}" stroke-dashoffset="${25 - passRate}" stroke-linecap="round"/>` : ''}
      </svg>
      <div class="pie-center">
        <div class="pie-val">${passRate}%</div>
        <div class="pie-lbl">${total} tests</div>
      </div>
    </div>
    <div class="pie-stats">
      <div class="stat-item"><span class="stat-dot" style="background:#059669"></span><div class="stat-group"><span class="stat-val" style="color:#059669">${passed}</span><span class="stat-lbl">Passed</span></div></div>
      <div class="stat-item"><span class="stat-dot" style="background:#dc2626"></span><div class="stat-group"><span class="stat-val" style="color:#dc2626">${failed}</span><span class="stat-lbl">Failed</span></div></div>
      <div class="stat-item"><span class="stat-dot" style="background:#d97706"></span><div class="stat-group"><span class="stat-val" style="color:#d97706">${skipped}</span><span class="stat-lbl">Skipped</span></div></div>
      <div class="stat-item"><span class="stat-dot" style="background:#166534"></span><div class="stat-group"><span class="stat-val" style="color:#166534">${total}</span><span class="stat-lbl">Total</span></div></div>
    </div>
  </div>
  <div class="duration-frame">
    <div class="dur-icon">⚡</div>
    <div class="dur-val">${duration}s</div>
    <div class="dur-lbl">Total Duration</div>
    <div class="dur-avg">${(parseFloat(duration) / total).toFixed(2)}s avg</div>
    ${prev ? `<div class="dur-diff">${parseFloat(duration) < parseFloat(prev.duration) ? '🟢' : '🔴'} ${parseFloat(duration) < parseFloat(prev.duration) ? '' : '+'}${(parseFloat(duration) - parseFloat(prev.duration)).toFixed(1)}s</div>` : ''}
  </div>
</div>

<div class="cards">
  <div class="card card-link c-pos" data-nav-tab="positive"><div class="icon">🟢</div><div class="val">${types.posPass}/${types.positive}</div><div class="lbl">Positive</div></div>
  <div class="card card-link c-neg" data-nav-tab="negative"><div class="icon">🔴</div><div class="val">${types.negPass}/${types.negative}</div><div class="lbl">Negative</div></div>
  <div class="card card-link c-sec" data-nav-tab="security"><div class="icon">🟣</div><div class="val">${types.secPass}/${types.security}</div><div class="lbl">Security</div></div>
  <div class="card card-link c-load" data-nav-tab="load"><div class="icon">🔵</div><div class="val">${types.loadPass}/${types.load}</div><div class="lbl">Load</div></div>
  <div class="card card-link c-chat" data-nav-tab="chatbot"><div class="icon">💬</div><div class="val">${types.chatbotPass}/${types.chatbot}</div><div class="lbl">Chatbot</div></div>
  <div class="card card-link c-db" data-nav-tab="db"><div class="icon">🗄️</div><div class="val">${types.dbPass}/${types.db}</div><div class="lbl">DB</div></div>
  <div class="card card-link c-reg" data-nav-tab="regression"><div class="icon">🟡</div><div class="val">${types.regPass}/${types.regression}</div><div class="lbl">Regression</div></div>
</div>

<div class="divider">
  <span class="divider-leaf">🌿</span>
  <span class="divider-text">${passRate === 100 ? '🏆 FLAWLESS VICTORY!' : passRate >= 80 ? '💪 Almost perfect!' : `🔧 ${100 - passRate}% needs fixing`}</span>
  <span class="divider-leaf">🌿</span>
</div>

<div class="tabs-content">
  ${tabPanelsHtml}
</div>


</div>
<script>
(function(){
  var panels = document.querySelectorAll('.tab-panel');
  function switchTab(tab){
    panels.forEach(function(p){ p.classList.remove('active'); });
    var panel = document.querySelector('.tab-panel[data-tab="' + tab + '"]');
    if(panel) panel.classList.add('active');
    var content = document.querySelector('.tabs-content');
    if(content) content.scrollIntoView({behavior:'smooth',block:'start'});
  }
  document.querySelectorAll('.card-link[data-nav-tab]').forEach(function(card){
    card.addEventListener('click', function(){ switchTab(card.getAttribute('data-nav-tab')); });
  });
})();
</script>
</body>
</html>`;

    const reportPath = path.join(reportDir, 'index.html');
    fs.writeFileSync(reportPath, html);
    console.log(`\n  📄 Report: file://${reportPath}\n`);
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default FunReporter;
