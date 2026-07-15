<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS Feed</title>
        <style>
          :root {
            --canvas: #F4F1EB;
            --card: #FFFFFF;
            --elevated: #E8DFD1;
            --text: #16202E;
            --muted: #4A5D6F;
            --anchor: #256997;
            --cta: #B8324F;
            --border: rgba(22,32,46,0.14);
            --border-strong: rgba(22,32,46,0.22);
            --paper: #FAF8F4;
          }
          * { box-sizing: border-box; margin:0; padding:0; }
          html { background: var(--canvas); color: var(--text); font-family: "Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
          body { min-height: 100vh; display:flex; flex-direction:column; background: radial-gradient(60% 50% at 50% 0%, rgba(37,105,151,0.10), transparent 70%), radial-gradient(50% 40% at 90% 20%, rgba(184,50,79,0.08), transparent 60%), var(--canvas); }
          a { color: var(--anchor); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .wrap { max-width: 64rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; width:100%; }
          .header { display:flex; flex-direction:column; gap:1.25rem; padding: 2.5rem 2rem; background: var(--card); border: 1px solid var(--border); border-radius: 24px; box-shadow: 0 1px 2px rgba(22,32,46,0.06), 0 6px 20px -8px rgba(22,32,46,0.12); }
          .kicker { font-family: ui-monospace, SFMono-Regular, monospace; font-size:0.68rem; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color: var(--cta); }
          .title { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800; letter-spacing:-0.03em; line-height:1.05; color: var(--text); }
          .desc { font-size: 1.05rem; line-height:1.65; color: var(--muted); max-width: 38rem; }
          .pill-row { display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.5rem; }
          .pill { display:inline-flex; align-items:center; gap:0.4rem; padding:0.45rem 0.9rem; border-radius:9999px; background: var(--elevated); border:1px solid var(--border); font-size:0.78rem; font-weight:600; color: var(--text); }
          .pill.accent { background: var(--text); color: var(--canvas); border-color: var(--text); }
          .cta-row { display:flex; flex-wrap:wrap; gap:0.75rem; margin-top:1rem; }
          .btn { display:inline-flex; align-items:center; justify-content:center; min-height:2.6rem; padding:0 1.25rem; border-radius:9999px; font-size:0.875rem; font-weight:700; letter-spacing:-0.01em; transition: all 0.15s ease; text-decoration:none !important; }
          .btn-primary { background: var(--text); color: var(--canvas); }
          .btn-primary:hover { opacity:0.9; transform: translateY(-1px); }
          .btn-ghost { background: var(--card); border:1px solid var(--border); color: var(--text); }
          .btn-ghost:hover { border-color: var(--border-strong); }
          .explain { margin-top:2rem; display:grid; gap:1rem; grid-template-columns: repeat(auto-fit, minmax(18rem,1fr)); }
          .card { background: var(--card); border:1px solid var(--border); border-radius:20px; padding:1.25rem 1.35rem; }
          .card h3 { font-size:0.95rem; font-weight:700; margin-bottom:0.35rem; letter-spacing:-0.01em; }
          .card p { font-size:0.88rem; line-height:1.6; color: var(--muted); }
          .card code { font-family: ui-monospace, monospace; font-size:0.8em; background: var(--elevated); padding:0.15rem 0.35rem; border-radius:6px; border:1px solid var(--border); }
          .feed-list { margin-top:2.5rem; }
          .feed-list h2 { font-size:1.1rem; font-weight:700; letter-spacing:-0.02em; margin-bottom:1rem; display:flex; align-items:center; gap:0.6rem; }
          .count { display:inline-flex; min-width:1.5rem; height:1.5rem; align-items:center; justify-content:center; padding:0 0.45rem; border-radius:9999px; background: var(--text); color: var(--canvas); font-size:0.7rem; font-weight:700; }
          .items { display:grid; gap:0.85rem; }
          .item { display:block; background: var(--card); border:1px solid var(--border); border-radius:16px; padding:1.15rem 1.25rem; transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }
          .item:hover { border-color: rgba(37,105,151,0.25); box-shadow: 0 2px 10px -4px rgba(22,32,46,0.12); transform: translateY(-1px); text-decoration:none; }
          .item-title { font-size:1.05rem; font-weight:650; letter-spacing:-0.015em; line-height:1.3; color: var(--text); }
          .item-meta { margin-top:0.35rem; font-family: ui-monospace, monospace; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.12em; color: var(--muted); display:flex; gap:0.75rem; flex-wrap:wrap; }
          .item-desc { margin-top:0.5rem; font-size:0.9rem; line-height:1.6; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow:hidden; }
          footer { margin-top:auto; border-top:1px solid var(--border); padding:1.5rem; text-align:center; font-family: ui-monospace, monospace; font-size:0.62rem; letter-spacing:0.14em; text-transform:uppercase; color: var(--muted); }
          @media (max-width: 640px) {
            .header { padding:1.5rem 1.25rem; }
            .wrap { padding:1.5rem 1rem 3rem; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="header">
            <div class="kicker">MakerPortal • San Francisco • On-device first</div>
            <h1 class="title"><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
            <div class="pill-row">
              <span class="pill">RSS 2.0 • Valid XML for readers</span>
              <span class="pill"><xsl:value-of select="count(/rss/channel/item)"/> notes indexed</span>
              <a class="pill accent" href="{/rss/channel/link}">Open hub →</a>
            </div>
            <div class="cta-row">
              <a class="btn btn-primary" href="https://www.makerportal.ai/blog">Read all notes →</a>
              <a class="btn btn-ghost" href="/rss.xml" download="makerportal-rss.xml">Download .xml</a>
            </div>
          </div>

          <div class="explain">
            <div class="card">
              <h3>What is this?</h3>
              <p>This is an <strong>RSS feed</strong> — a machine-readable list of our latest field notes. Feed readers, AI agents, and tools like NetNewsWire, Reeder, Feedly poll this file to get updates instantly. It’s still valid XML — this page is just a human-friendly preview via XSLT.</p>
            </div>
            <div class="card">
              <h3>How to subscribe</h3>
              <p>Copy this URL <code><xsl:value-of select="/rss/channel/link"/>/rss.xml</code> and paste it into your RSS reader. Or use <code>/llms.txt</code> for agent-readable context, or add <code>?theme=dark</code> to URLs to force dark mode. No newsletter, no spam — just notes.</p>
            </div>
            <div class="card">
              <h3>On-device, privacy-first</h3>
              <p>MakerPortal builds iOS apps with CoreML, ANE, Metal — on-device where possible, transparent hybrid where cloud is needed. This feed contains only public field notes, no tracking. SF studio → Worldwide.</p>
            </div>
          </div>

          <div class="feed-list">
            <h2>Latest notes <span class="count"><xsl:value-of select="count(/rss/channel/item)"/></span></h2>
            <div class="items">
              <xsl:for-each select="/rss/channel/item">
                <a class="item" href="{link}">
                  <div class="item-title"><xsl:value-of select="title"/></div>
                  <div class="item-meta">
                    <span><xsl:value-of select="pubDate"/></span>
                    <span>•</span>
                    <span><xsl:value-of select="substring(link,1,80)"/></span>
                  </div>
                  <xsl:if test="description">
                    <div class="item-desc"><xsl:value-of select="description"/></div>
                  </xsl:if>
                </a>
              </xsl:for-each>
            </div>
          </div>
        </div>
        <footer>MakerPortal © 2026 • RSS • <a href="/blog">Journal</a> • <a href="/llms.txt">llms.txt</a> • SF → Worldwide</footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
