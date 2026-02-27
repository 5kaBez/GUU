import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    # Test root
    resp = urllib.request.urlopen('https://localhost:5000/', context=ctx, timeout=5)
    print(f'✓ Root endpoint: {resp.status}')
except Exception as e:
    print(f'✗ Root error: {type(e).__name__}')

try:
    # Test miniapp
    resp = urllib.request.urlopen('https://localhost:5000/miniapp', context=ctx, timeout=5)
    print(f'✓ Miniapp endpoint: {resp.status}')
    content = resp.read()
    print(f'✓ Content size: {len(content)} bytes')
    print(f'✓ Contains HTML: {"html" in content.decode("utf-8", errors="ignore").lower()}')
except Exception as e:
    print(f'✗ Miniapp error: {type(e).__name__}: {str(e)[:80]}')
