import sys, os, subprocess
sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import dynamic_credential_entry
entry = dynamic_credential_entry("custom.cloudflare", "access_token")
env = dict(os.environ)
env["CLOUDFLARE_API_TOKEN"] = entry["surrogate"]
r = subprocess.run(
    ["npx", "-y", "wrangler", "pages", "deploy", "/home/hatch/workspace/apm-site",
     "--project-name", "agatepreciousmetals", "--branch", "main"],
    env=env, capture_output=True, text=True, timeout=600)
print("exit:", r.returncode)
print((r.stdout or "")[-1500:])
print((r.stderr or "")[-800:])
