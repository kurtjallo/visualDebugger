import * as vscode from "vscode";
import { ExtToWebviewMessage, WebviewToExtMessage } from "../types";

const LOG = "[FlowFixer:ErrorPanel]";

export class ErrorPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "flowfixer.errorPanel";
  private view?: vscode.WebviewView;
  private onMessageEmitter = new vscode.EventEmitter<WebviewToExtMessage>();
  readonly onMessage = this.onMessageEmitter.event;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((msg: WebviewToExtMessage) => {
      this.onMessageEmitter.fire(msg);
    });

    console.log(`${LOG} view resolved`);
  }

  postMessage(message: ExtToWebviewMessage): void {
    if (this.view) {
      this.view.webview.postMessage(message);
      this.view.show?.(true);
    } else {
      console.warn(`${LOG} no active view to post message to`);
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = getNonce();
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "src", "webview", "styles.css")
    );

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <link rel="stylesheet" href="${styleUri}">
  <title>Error Explanation</title>
</head>
<body>
  <div id="root">
    <p id="status-live" class="sr-only" aria-live="polite"></p>
    <div id="empty-state" class="empty-state">
      <p>No errors detected yet.</p>
      <p class="muted">Visual Debugger will explain errors when they appear in your code.</p>
    </div>
    <div id="error-content" style="display:none;">
      <h2 id="panel-title" tabindex="-1">Error Explanation</h2>
      <div class="badge-row">
        <span id="category-badge" class="badge"></span>
        <span id="location" class="muted"></span>
      </div>
      <p id="raw-error" class="muted"></p>
      <section class="card">
        <h3>TL;DR</h3>
        <p id="tldr"></p>
        <div id="key-terms" class="mt-8"></div>
      </section>
      <div class="toolbar-row">
        <button id="simplified-toggle" class="btn btn--secondary" aria-pressed="false">Simplified Mode</button>
        <button id="focus-toggle" class="btn btn--secondary" aria-pressed="false">Focus Mode</button>
        <button id="read-aloud-btn" class="btn btn--secondary">Read Aloud</button>
      </div>
      <div id="focus-controls" class="toolbar-row" style="display:none;">
        <button id="prev-card" class="btn btn--secondary" disabled>Previous</button>
        <button id="next-card" class="btn btn--secondary">Next</button>
      </div>
      <div id="cards">
        <details class="info-card" data-card-index="0">
          <summary>What happened?</summary>
          <p id="explanation"></p>
        </details>
        <details class="info-card" data-card-index="1">
          <summary>How to fix it</summary>
          <p id="how-to-fix"></p>
        </details>
        <details class="info-card" data-card-index="2">
          <summary>How to prevent it</summary>
          <p id="how-to-prevent"></p>
        </details>
        <details class="info-card" data-card-index="3">
          <summary>Best practices</summary>
          <p id="best-practices"></p>
        </details>
      </div>
      <section id="quiz-section" style="display:none;">
        <h3>Test yourself</h3>
        <p id="quiz-question"></p>
        <div id="quiz-options"></div>
        <p id="quiz-feedback" style="display:none;" aria-live="polite"></p>
      </section>
    </div>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    vscode.postMessage({ type: 'ready' });

    let rawData = undefined;
    let simplifiedMode = false;
    let focusMode = false;
    let focusIndex = 0;
    let currentAudio = undefined;

    function setStatus(msg) {
      const status = document.getElementById('status-live');
      status.textContent = msg;
    }

    function simplify(text) {
      return text
        .replace(/undefined/gi, 'missing value')
        .replace(/runtime/gi, 'run time')
        .replace(/syntax/gi, 'code format')
        .replace(/nullish coalescing/gi, 'default value operator')
        .replace(/optional chaining/gi, 'safe access operator');
    }

    function renderKeyTerms(terms) {
      const wrap = document.getElementById('key-terms');
      wrap.innerHTML = '';
      if (!terms || terms.length === 0) return;
      wrap.innerHTML = terms.slice(0, 3).map((term) => '<mark class="key-term">' + term + '</mark>').join(' ');
    }

    function highlightTerms(text, terms) {
      let out = text;
      for (const term of (terms || []).slice(0, 3)) {
        if (!term) continue;
        const escaped = term.replace(/[.*+?^()|[\\]\\\\]/g, '\\\\$&');
        out = out.replace(new RegExp(escaped, 'ig'), (match) => '<mark class="key-term">' + match + '</mark>');
      }
      return out;
    }

    function applyFocusMode() {
      const cards = Array.from(document.querySelectorAll('.info-card'));
      cards.forEach((card, idx) => {
        card.style.display = !focusMode || idx === focusIndex ? 'block' : 'none';
      });
      document.getElementById('focus-controls').style.display = focusMode ? 'flex' : 'none';
      document.getElementById('prev-card').disabled = focusIndex === 0;
      document.getElementById('next-card').disabled = focusIndex === cards.length - 1;
    }

    function getReadableText(data) {
      return [data.tldr, data.explanation, data.howToFix, data.howToPrevent, data.bestPractices].join('. ');
    }

    function render(data) {
      rawData = data;
      const output = simplifiedMode
        ? {
            ...data,
            tldr: simplify(data.tldr),
            explanation: simplify(data.explanation),
            howToFix: simplify(data.howToFix),
            howToPrevent: simplify(data.howToPrevent),
            bestPractices: simplify(data.bestPractices)
          }
        : data;

      const badge = document.getElementById('category-badge');
      badge.textContent = output.category;
      badge.className = 'badge badge-' + output.category.toLowerCase().replace(/\\s+/g, '-');
      document.getElementById('location').textContent = output.location;
      document.getElementById('tldr').textContent = output.tldr;
      document.getElementById('explanation').textContent = output.explanation;
      document.getElementById('how-to-fix').textContent = output.howToFix;
      document.getElementById('how-to-prevent').textContent = output.howToPrevent;
      document.getElementById('best-practices').textContent = output.bestPractices;

      renderKeyTerms(output.keyTerms);
      document.getElementById('raw-error').innerHTML = highlightTerms(output.raw.message || '', output.keyTerms);

      const cards = Array.from(document.querySelectorAll('.info-card'));
      cards.forEach((card) => { card.open = false; });
      applyFocusMode();

      if (output.quiz) {
        const qs = document.getElementById('quiz-section');
        qs.style.display = 'block';
        document.getElementById('quiz-question').textContent = output.quiz.question;
        const opts = document.getElementById('quiz-options');
        opts.innerHTML = '';
        const feedback = document.getElementById('quiz-feedback');
        feedback.style.display = 'none';
        output.quiz.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.className = 'quiz-option';
          btn.textContent = opt;
          btn.setAttribute('aria-label', 'Answer option ' + opt);
          btn.onclick = () => {
            const letter = opt.charAt(0);
            vscode.postMessage({ type: 'quizAnswer', answer: letter });
            feedback.style.display = 'block';
            if (letter === output.quiz.correct) {
              feedback.textContent = 'Correct! ' + output.quiz.explanation;
              feedback.className = 'quiz-correct';
            } else {
              feedback.textContent = 'Not quite. ' + output.quiz.explanation;
              feedback.className = 'quiz-incorrect';
            }
            opts.querySelectorAll('button').forEach((b) => b.disabled = true);
          };
          opts.appendChild(btn);
        });
      }

      document.getElementById('panel-title').focus();
      setStatus('Error explanation updated.');
    }

    document.getElementById('simplified-toggle').addEventListener('click', () => {
      simplifiedMode = !simplifiedMode;
      document.getElementById('simplified-toggle').setAttribute('aria-pressed', simplifiedMode ? 'true' : 'false');
      if (rawData) render(rawData);
    });

    document.getElementById('focus-toggle').addEventListener('click', () => {
      focusMode = !focusMode;
      focusIndex = 0;
      document.getElementById('focus-toggle').setAttribute('aria-pressed', focusMode ? 'true' : 'false');
      applyFocusMode();
    });

    document.getElementById('prev-card').addEventListener('click', () => {
      focusIndex = Math.max(0, focusIndex - 1);
      applyFocusMode();
    });

    document.getElementById('next-card').addEventListener('click', () => {
      const cards = document.querySelectorAll('.info-card');
      focusIndex = Math.min(cards.length - 1, focusIndex + 1);
      applyFocusMode();
    });

    document.getElementById('read-aloud-btn').addEventListener('click', () => {
      if (!rawData) return;
      const text = getReadableText(simplifiedMode ? {
        ...rawData,
        tldr: simplify(rawData.tldr),
        explanation: simplify(rawData.explanation),
        howToFix: simplify(rawData.howToFix),
        howToPrevent: simplify(rawData.howToPrevent),
        bestPractices: simplify(rawData.bestPractices)
      } : rawData);
      vscode.postMessage({ type: 'requestTts', text });
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'showError') {
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('error-content').style.display = 'block';
        render(msg.data);
      } else if (msg.type === 'playAudio') {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = undefined;
        }
        const audio = new Audio('data:' + msg.data.mimeType + ';base64,' + msg.data.base64Audio);
        currentAudio = audio;
        audio.onended = () => { currentAudio = undefined; setStatus('Audio playback finished.'); };
        audio.play().then(
          () => setStatus('Playing TTS audio.'),
          () => { currentAudio = undefined; setStatus('Audio playback failed.'); }
        );
      } else if (msg.type === 'ttsError') {
        setStatus(msg.data.message);
        if ('speechSynthesis' in window && rawData) {
          const text = getReadableText(rawData);
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          speechSynthesis.cancel();
          speechSynthesis.speak(utterance);
        }
      } else if (msg.type === 'clear') {
        document.getElementById('empty-state').style.display = 'block';
        document.getElementById('error-content').style.display = 'none';
      }
    });
  </script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
