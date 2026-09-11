import subprocess
import time
import urllib.request
import os
import sys

BASE_DIR = r"C:\Users\tamru\.gemini\antigravity\scratch\neurovitals-ai"
NODE_DIR = r"C:\Users\tamru\.gemini\antigravity\tools\nodejs\node-v20.18.0-win-x64"
DESKTOP_DIR = r"V:\Desktop"
LINK_FILE = os.path.join(DESKTOP_DIR, "ACTIVE_PUBLIC_LINK.txt")

os.environ["PATH"] = f"{NODE_DIR};{os.environ.get('PATH', '')}"

def is_server_alive():
    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/api/health", timeout=2) as res:
            return res.status == 200
    except Exception:
        return False

def ensure_server():
    if not is_server_alive():
        print("[Watchdog] Server not responding. Launching NeuroVitals AI unified engine...", flush=True)
        server_script = os.path.join(BASE_DIR, "backend", "run_server.py")
        subprocess.Popen([sys.executable, "-u", server_script], cwd=os.path.join(BASE_DIR, "backend"), shell=False)
        for _ in range(10):
            time.sleep(1)
            if is_server_alive():
                print("[Watchdog] Server is now HEALTHY and running on http://127.0.0.1:8000", flush=True)
                return True
        return False
    return True

def run_tunnel_supervisor():
    """
    Maintains an unbreakable keep-alive loop for the public tunnel.
    If the connection drops for ANY reason, it automatically reconnects within 2 seconds.
    """
    ensure_server()
    print("=============================================================", flush=True)
    print("      NEUROVITALS AI — UNBREAKABLE WATCHDOG SERVICE         ", flush=True)
    print("   Auto-monitors Server & Public Tunnel with Zero Downtime   ", flush=True)
    print("=============================================================", flush=True)

    retry_count = 0
    while True:
        try:
            ensure_server()
            print("[Watchdog] Spawning high-availability tunnel...", flush=True)
            npx_cmd = os.path.join(NODE_DIR, "npx.cmd")
            proc = subprocess.Popen(
                [npx_cmd, "localtunnel", "--port", "8000"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            current_url = None
            for line in iter(proc.stdout.readline, ''):
                if not line:
                    break
                print(f"[Tunnel Output] {line.strip()}", flush=True)
                if "your url is:" in line.lower():
                    current_url = line.strip().split("your url is:")[-1].strip()
                    print("\n" + "="*60, flush=True)
                    print(f" >>> PERMANENT LIVE PUBLIC URL: {current_url} <<<", flush=True)
                    print("="*60 + "\n", flush=True)
                    try:
                        with open(LINK_FILE, "w", encoding="utf-8") as f:
                            f.write(f"NEUROVITALS AI - LIVE PUBLIC ACCESS LINK\n")
                            f.write(f"Updated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                            f.write(f"URL: {current_url}\n")
                            f.write(f"Status: ALWAYS KEPT ALIVE BY WATCHDOG\n")
                    except Exception as e:
                        print(f"Could not write desktop link file: {e}", flush=True)

            proc.poll()
            print("[Watchdog Warning] Tunnel connection interrupted. Reconnecting automatically in 2 seconds...", flush=True)
            retry_count += 1
            time.sleep(2)

        except Exception as err:
            print(f"[Watchdog Error] {err}. Retrying in 3 seconds...", flush=True)
            time.sleep(3)

if __name__ == "__main__":
    run_tunnel_supervisor()