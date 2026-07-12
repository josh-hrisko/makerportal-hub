#!/usr/bin/env python3
"""
MakerPortal GSC Dashboard
--------------------------
Pulls Google Search Console data for makerportal.ai and generates
an interactive HTML dashboard + saves raw data to CSV.

First run: opens a browser for Google login and saves token.json.
Subsequent runs: uses token.json silently (no browser needed).

Usage:
    python3 gsc_dashboard.py
    python3 gsc_dashboard.py --days 90   # custom date range (default: 90)
    python3 gsc_dashboard.py --days 28   # last 4 weeks only
"""

import os
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# ── Config ────────────────────────────────────────────────────────────────────
SITE_URL   = "sc-domain:makerportal.ai"
SCOPES     = ["https://www.googleapis.com/auth/webmasters.readonly"]
SCRIPT_DIR = Path(__file__).parent
TOKEN_FILE = SCRIPT_DIR / "token.json"
OUTPUT_DIR = SCRIPT_DIR / "reports"

# Auto-find credentials file (client_secret_*.json or credentials.json)
CREDS_FILE = next(
    (f for f in sorted(SCRIPT_DIR.glob("client_secret*.json")) + [SCRIPT_DIR / "credentials.json"] if f.exists()),
    None
)

# ── Auth ──────────────────────────────────────────────────────────────────────
def get_credentials():
    if CREDS_FILE is None:
        print("ERROR: No credentials file found in analytics/")
        sys.exit(1)

    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing access token...")
            creds.refresh(Request())
        else:
            print("Opening browser for Google login (one-time only)...")
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json())
        print(f"Token saved to {TOKEN_FILE.name}")

    return creds

# ── API fetch ─────────────────────────────────────────────────────────────────
def fetch_gsc_data(service, start_date, end_date, dimensions, row_limit=5000):
    body = {
        "startDate":  start_date,
        "endDate":    end_date,
        "dimensions": dimensions,
        "rowLimit":   row_limit,
        "dataState":  "all",
    }
    response = service.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
    rows = response.get("rows", [])
    if not rows:
        return pd.DataFrame()

    records = []
    for row in rows:
        record = {dim: row["keys"][i] for i, dim in enumerate(dimensions)}
        record.update({
            "clicks":      row["clicks"],
            "impressions": row["impressions"],
            "ctr":         round(row["ctr"] * 100, 2),
            "position":    round(row["position"], 1),
        })
        records.append(record)
    return pd.DataFrame(records)

# ── Dashboard ─────────────────────────────────────────────────────────────────
def build_dashboard(df_date, df_pages, df_queries, df_countries, days, output_path):
    BRAND  = "#6366f1"
    ACCENT = "#06b6d4"
    WARN   = "#f59e0b"
    BG     = "#0f141c"
    CARD   = "#161d2b"
    MUTED  = "#64748b"
    TEXT   = "#e2e8f0"

    fig = make_subplots(
        rows=4, cols=2,
        subplot_titles=(
            "Daily Clicks & Impressions",
            "Average Position Over Time (lower = better)",
            "Top 10 Pages by Clicks",
            "Top 10 Queries by Clicks",
            "Top 10 Countries",
            "Optimization Targets (high impressions, low CTR)",
            "CTR vs Impressions by Query",
            "",
        ),
        vertical_spacing=0.1,
        horizontal_spacing=0.12,
    )

    # Row 1: Traffic trend
    if not df_date.empty:
        df_date["date"] = pd.to_datetime(df_date["date"])
        fig.add_trace(go.Scatter(
            x=df_date["date"], y=df_date["clicks"],
            name="Clicks", line=dict(color=BRAND, width=2.5),
            fill="tozeroy", fillcolor="rgba(99,102,241,0.12)",
            hovertemplate="%{x|%b %d}: <b>%{y}</b> clicks<extra></extra>",
        ), row=1, col=1)
        fig.add_trace(go.Scatter(
            x=df_date["date"], y=df_date["impressions"],
            name="Impressions", line=dict(color=ACCENT, width=2, dash="dot"),
            hovertemplate="%{x|%b %d}: <b>%{y}</b> impressions<extra></extra>",
        ), row=1, col=1)
        fig.add_trace(go.Scatter(
            x=df_date["date"], y=df_date["position"],
            name="Avg Position", line=dict(color=WARN, width=2),
            hovertemplate="%{x|%b %d}: position <b>%{y:.1f}</b><extra></extra>",
        ), row=1, col=2)

    # Row 2: Top pages & queries
    if not df_pages.empty:
        top_pages = df_pages.nlargest(10, "clicks").copy()
        top_pages["label"] = top_pages["page"].str.replace("https://www.makerportal.ai", "", regex=False).replace("", "/")
        fig.add_trace(go.Bar(
            x=top_pages["clicks"], y=top_pages["label"],
            orientation="h", name="Page Clicks",
            marker=dict(color=BRAND),
            text=top_pages["clicks"], textposition="outside",
            hovertemplate="%{y}<br>Clicks: <b>%{x}</b><extra></extra>",
        ), row=2, col=1)

    if not df_queries.empty:
        top_q = df_queries.nlargest(10, "clicks")
        fig.add_trace(go.Bar(
            x=top_q["clicks"], y=top_q["query"],
            orientation="h", name="Query Clicks",
            marker=dict(color=ACCENT),
            text=top_q["clicks"], textposition="outside",
            hovertemplate="%{y}<br>Clicks: <b>%{x}</b><extra></extra>",
        ), row=2, col=2)

    # Row 3: Countries & optimization targets
    if not df_countries.empty:
        top_c = df_countries.nlargest(10, "clicks")
        fig.add_trace(go.Bar(
            x=top_c["country"], y=top_c["clicks"],
            name="Country", marker=dict(color=BRAND, opacity=0.85),
            hovertemplate="%{x}: <b>%{y}</b> clicks<extra></extra>",
        ), row=3, col=1)

    if not df_pages.empty:
        targets = df_pages[df_pages["impressions"] > 20].copy()
        med_ctr = targets["ctr"].median()
        targets = targets[targets["ctr"] < med_ctr].nlargest(10, "impressions")
        targets["label"] = targets["page"].str.replace("https://www.makerportal.ai", "", regex=False).replace("", "/")
        fig.add_trace(go.Bar(
            x=targets["impressions"], y=targets["label"],
            orientation="h", name="Low-CTR pages",
            marker=dict(color=WARN, opacity=0.9),
            text=targets["ctr"].apply(lambda v: f"{v}% CTR"),
            textposition="outside",
            hovertemplate="%{y}<br>Impressions: <b>%{x}</b><extra></extra>",
        ), row=3, col=2)

    # Row 4: Scatter CTR vs impressions
    if not df_queries.empty:
        sizes = df_queries["clicks"].clip(lower=1).apply(lambda v: max(6, min(v * 2, 30)))
        fig.add_trace(go.Scatter(
            x=df_queries["impressions"], y=df_queries["ctr"],
            mode="markers",
            marker=dict(
                size=sizes,
                color=df_queries["position"],
                colorscale="RdYlGn_r",
                showscale=True,
                colorbar=dict(title="Position", x=0.46, len=0.22, y=0.06, thickness=12),
                opacity=0.75,
                line=dict(width=0.5, color="rgba(255,255,255,0.3)"),
            ),
            text=df_queries["query"],
            hovertemplate="<b>%{text}</b><br>Impressions: %{x}<br>CTR: %{y}%<extra></extra>",
            name="Queries",
        ), row=4, col=1)

    fig.update_layout(
        title=dict(
            text=f"<b>MakerPortal · Google Search Console Dashboard</b>   Last {days} days · {datetime.now().strftime('%b %d, %Y')}",
            font=dict(size=18, color=TEXT, family="Inter, system-ui, sans-serif"),
            x=0.01,
        ),
        paper_bgcolor=BG,
        plot_bgcolor=CARD,
        font=dict(color=TEXT, family="Inter, system-ui, sans-serif", size=11),
        height=1500,
        showlegend=True,
        legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color=MUTED)),
        margin=dict(l=40, r=40, t=80, b=40),
    )
    fig.update_xaxes(gridcolor="#1e293b", zerolinecolor="#334155", tickfont=dict(color=MUTED))
    fig.update_yaxes(gridcolor="#1e293b", zerolinecolor="#334155", tickfont=dict(color=MUTED))
    fig.update_yaxes(autorange="reversed", row=1, col=2)  # lower position = better

    fig.write_html(str(output_path), include_plotlyjs="cdn")
    return output_path

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="MakerPortal GSC Dashboard")
    parser.add_argument("--days", type=int, default=90, help="Days to pull (default: 90)")
    args = parser.parse_args()

    end_date   = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=args.days + 2)).strftime("%Y-%m-%d")

    print(f"\nMakerPortal GSC Dashboard")
    print(f"Range: {start_date} to {end_date} ({args.days} days)\n")

    creds   = get_credentials()
    service = build("searchconsole", "v1", credentials=creds)

    print("Fetching data from Search Console API...")
    df_date      = fetch_gsc_data(service, start_date, end_date, ["date"])
    df_pages     = fetch_gsc_data(service, start_date, end_date, ["page"])
    df_queries   = fetch_gsc_data(service, start_date, end_date, ["query"])
    df_countries = fetch_gsc_data(service, start_date, end_date, ["country"])

    OUTPUT_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")

    # Save raw CSVs
    for name, df in [("date", df_date), ("pages", df_pages), ("queries", df_queries), ("countries", df_countries)]:
        if not df.empty:
            path = OUTPUT_DIR / f"gsc_{name}_{timestamp}.csv"
            df.to_csv(path, index=False)
            print(f"CSV saved: {path.name}")

    # Print terminal summary
    if not df_date.empty:
        print(f"\n--- Summary ({args.days} days) ---")
        print(f"Total clicks:      {int(df_date['clicks'].sum()):,}")
        print(f"Total impressions: {int(df_date['impressions'].sum()):,}")
        print(f"Avg position:      {df_date['position'].mean():.1f}")

    if not df_pages.empty:
        print("\nTop 3 pages:")
        print(df_pages.nlargest(3, "clicks")[["page", "clicks"]].to_string(index=False))

    if not df_queries.empty:
        print("\nTop 3 queries:")
        print(df_queries.nlargest(3, "clicks")[["query", "clicks"]].to_string(index=False))

    # Build & open dashboard
    dashboard_path = OUTPUT_DIR / f"dashboard_{timestamp}.html"
    build_dashboard(df_date, df_pages, df_queries, df_countries, args.days, dashboard_path)
    print(f"\nDashboard: {dashboard_path}")

    import webbrowser
    webbrowser.open(f"file://{dashboard_path.resolve()}")
    print("Done! Dashboard opened in your browser.\n")

if __name__ == "__main__":
    main()
