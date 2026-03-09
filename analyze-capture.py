import json
import sys
from collections import defaultdict

with open("/Users/aenglander/personal/riseup-api/captured-api.json", "r") as f:
    data = json.load(f)

print(f"Total API calls captured: {len(data)}")

# Deduplicate by method+path
endpoints = defaultdict(lambda: {"count": 0, "statuses": set(), "has_request_body": False, "sample_request": None, "sample_response": None})

for entry in data:
    method = entry.get("method", "?")
    path = entry.get("path", "?")
    status = entry.get("status", "?")

    # Normalize dynamic path segments (IDs, dates)
    import re
    normalized = re.sub(r'/\d{4}-\d{2}/\d+', '/:date/:day', path)
    normalized = re.sub(r'/[0-9a-f]{24}', '/:id', normalized)
    normalized = re.sub(r'/\d+$', '/:id', normalized)

    key = f"{method} {normalized}"
    endpoints[key]["count"] += 1
    endpoints[key]["statuses"].add(status)

    if entry.get("requestBody") and not endpoints[key]["has_request_body"]:
        endpoints[key]["has_request_body"] = True
        endpoints[key]["sample_request"] = entry["requestBody"]

    if entry.get("responseBody") and endpoints[key]["sample_response"] is None:
        resp = entry["responseBody"]
        if isinstance(resp, dict):
            endpoints[key]["sample_response"] = resp
        elif isinstance(resp, str) and len(resp) < 500:
            endpoints[key]["sample_response"] = resp

# Group by category
categories = defaultdict(list)
for key, info in sorted(endpoints.items()):
    method, path = key.split(" ", 1)

    if "/logged-in" in path or "/login" in path or "/logout" in path or "/partial-auth" in path:
        cat = "Auth & Session"
    elif "/budget" in path:
        cat = "Budget"
    elif "/cashflow" in path:
        cat = "Cashflow"
    elif "/credentials" in path or "/creds-to" in path or "/aggregator" in path or "/clearing-house" in path or "/consent" in path:
        cat = "Credentials & Banking"
    elif "/subscription" in path or "/offering" in path or "/cancel-subscription" in path:
        cat = "Subscription & Billing"
    elif "/tracking-categor" in path:
        cat = "Tracking Categories"
    elif "/investigator" in path:
        cat = "Investigator (Data Classification)"
    elif "/prediction" in path or "/plan" in path:
        cat = "Plans & Predictions"
    elif "/insight" in path or "/daily-routine" in path or "/daily-routines" in path:
        cat = "Insights & Daily Routines"
    elif "/hamster" in path or "/saving" in path:
        cat = "Savings & Trends"
    elif "/benefit" in path or "/voucher" in path:
        cat = "Benefits & Vouchers"
    elif "/feature-flag" in path or "/dynamic-feature" in path:
        cat = "Feature Flags"
    elif "/dynamic-component" in path:
        cat = "Dynamic Components"
    elif "/customer" in path or "/restricted-customer" in path or "/demographic" in path:
        cat = "Customer & Profile"
    elif "/mortgage" in path:
        cat = "Mortgages"
    elif "/action" in path or "/journey" in path:
        cat = "Actions & Journeys"
    elif "/nati" in path or "/communication" in path or "/whatsapp" in path:
        cat = "Notifications & Communication"
    else:
        cat = "Other"

    categories[cat].append((method, path, info))

# Output
print(f"\nUnique endpoints: {len(endpoints)}\n")
print("=" * 80)

for cat in sorted(categories.keys()):
    items = categories[cat]
    print(f"\n## {cat} ({len(items)} endpoints)")
    print("-" * 60)
    for method, path, info in items:
        statuses = ",".join(str(s) for s in sorted(info["statuses"]))
        body_marker = " [body]" if info["has_request_body"] else ""
        print(f"  {method:6s} {path:55s} [{statuses}] x{info['count']}{body_marker}")

# Save structured output
output = {}
for cat in sorted(categories.keys()):
    output[cat] = []
    for method, path, info in categories[cat]:
        entry = {
            "method": method,
            "path": path,
            "call_count": info["count"],
            "statuses": sorted(info["statuses"]),
            "has_request_body": info["has_request_body"],
        }
        if info["sample_request"]:
            entry["sample_request"] = info["sample_request"]
        if info["sample_response"]:
            # Truncate large responses
            resp = info["sample_response"]
            if isinstance(resp, dict):
                entry["sample_response_keys"] = list(resp.keys())[:20]
            else:
                entry["sample_response_preview"] = str(resp)[:200]
        output[cat] = output.get(cat, [])
        output[cat].append(entry)

with open("/Users/aenglander/personal/riseup-api/api-map.json", "w") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\n\nStructured API map saved to: api-map.json")
