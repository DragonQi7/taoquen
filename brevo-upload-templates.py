"""
Brevo Template Uploader
=======================
Uploads all 5 newsletter email templates to your Brevo account via API.

HOW TO RUN:
  1. Open a terminal in the same folder as this script
  2. Run:  python brevo-upload-templates.py
  3. Paste your Brevo API key when prompted (Settings → API Keys in Brevo)

REQUIREMENTS:
  pip install requests
"""

import requests
import os
import json

# ── CONFIG ──────────────────────────────────────────────────────────────────

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "move_offline", "email-templates")

TEMPLATES = [
    {
        "name": "Taoquen Email 1 — What is Qi",
        "subject": "The fatigue, the slow recovery — they are not separate problems",
        "file": "email-1-what-is-qi.html",
    },
    {
        "name": "Taoquen Email 2 — Five Elements",
        "subject": "Your body has been organised this way for 2,500 years",
        "file": "email-2-five-elements.html",
    },
    {
        "name": "Taoquen Email 3 — Why You Can't Push Through",
        "subject": "Every time you pushed through, your body adapted",
        "file": "email-3-why-you-cant-push-through.html",
    },
    {
        "name": "Taoquen Email 4 — Free Class Invite",
        "subject": "Before you decide anything — come to the free class",
        "file": "email-4-dragons-way.html",
    },
    {
        "name": "Taoquen Email 5 — Your Next Step",
        "subject": "You now have the map. The practice is waiting.",
        "file": "email-5-your-next-step.html",
    },
]

SENDER_NAME  = "Taoquen"
SENDER_EMAIL = None  # auto-detected from your verified Brevo senders

# ── MAIN ────────────────────────────────────────────────────────────────────

def main():
    api_key = input("Paste your Brevo API key and press Enter: ").strip()
    if not api_key:
        print("No API key entered. Exiting.")
        return

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": api_key,
    }

    # ── Auto-detect verified sender ──────────────────────────────────────────
    sender_email = SENDER_EMAIL
    sender_name  = SENDER_NAME

    if not sender_email:
        resp = requests.get("https://api.brevo.com/v3/senders", headers=headers)
        if resp.status_code == 200:
            senders = resp.json().get("senders", [])
            active = [s for s in senders if s.get("active")]
            if active:
                sender_email = active[0]["email"]
                sender_name  = active[0].get("name", SENDER_NAME)
                print(f"Using verified sender: {sender_name} <{sender_email}>\n")
            else:
                print("✗ No active verified senders found in your Brevo account.")
                print("  Go to Brevo → Senders & IPs → Add a sender, verify it, then re-run.")
                input("\nPress Enter to close...")
                return
        else:
            print(f"✗ Could not fetch senders: {resp.status_code} {resp.text}")
            input("\nPress Enter to close...")
            return

    # ── Fetch existing templates to avoid duplicates ─────────────────────────
    existing_names = set()
    ex_resp = requests.get("https://api.brevo.com/v3/smtp/templates?limit=50", headers=headers)
    if ex_resp.status_code == 200:
        for tpl in ex_resp.json().get("templates", []):
            existing_names.add(tpl.get("name", ""))

    created = []

    for t in TEMPLATES:
        filepath = os.path.join(TEMPLATE_DIR, t["file"])
        if not os.path.exists(filepath):
            print(f"  ✗  File not found: {filepath}")
            continue

        if t["name"] in existing_names:
            print(f"  –  Skipped (already exists): {t['name']}")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            html_content = f.read()

        payload = {
            "sender": {"name": sender_name, "email": sender_email},
            "templateName": t["name"],
            "subject": t["subject"],
            "htmlContent": html_content,
            "isActive": True,
        }

        resp = requests.post(
            "https://api.brevo.com/v3/smtp/templates",
            headers=headers,
            json=payload,
        )

        if resp.status_code in (200, 201):
            template_id = resp.json().get("id")
            print(f"  ✓  Created: {t['name']}  (id: {template_id})")
            created.append({"name": t["name"], "id": template_id})
        elif resp.status_code == 500:
            # Retry once on server error
            print(f"  ↻  Retrying: {t['name']} (server error, trying again...)")
            import time; time.sleep(3)
            resp2 = requests.post(
                "https://api.brevo.com/v3/smtp/templates",
                headers=headers,
                json=payload,
            )
            if resp2.status_code in (200, 201):
                template_id = resp2.json().get("id")
                print(f"  ✓  Created: {t['name']}  (id: {template_id})")
                created.append({"name": t["name"], "id": template_id})
            else:
                print(f"  ✗  Failed: {t['name']}")
                print(f"     Status: {resp2.status_code}")
                print(f"     Body:   {resp2.text}")
        else:
            print(f"  ✗  Failed: {t['name']}")
            print(f"     Status: {resp.status_code}")
            print(f"     Body:   {resp.text}")

    print("\n── Done ──")
    if created:
        print("Templates created in Brevo:")
        for c in created:
            print(f"  • {c['name']}  (id: {c['id']})")
        print("\nNext step: open Claude.ai in Chrome and paste the workflow prompt")
        print("(see brevo-workflow-prompt.txt in the same folder)")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
    input("\nPress Enter to close...")
