#!/usr/bin/env python3
"""Build the backend-free demo as ONE self-contained HTML file (opens from disk, no server).
Usage: python3 tools/build-single-html.py [out.html]   (default: ComfyMind-demo.html in the repo root)"""
import base64, glob, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, 'ComfyMind-demo.html')
D = '/tmp/comfymind-single'
subprocess.run(['rm', '-rf', D], check=True)
subprocess.run(['npx', 'vite', 'build', '--mode', 'demo', '--config', 'vite.single.mjs', '--outDir', D],
               cwd=os.path.join(ROOT, 'frontend'), check=True, stdout=subprocess.DEVNULL)
html = open(f'{D}/index.html').read()
js = open(glob.glob(f'{D}/assets/*.js')[0]).read()
css = open(glob.glob(f'{D}/assets/*.css')[0]).read()
for path in glob.glob(f'{D}/*.svg'):  # public/ files referenced by URL
    n = os.path.basename(path)
    uri = 'data:image/svg+xml;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
    for pre in ('./', '/'):
        js = js.replace(f'"{pre}{n}"', f'"{uri}"'); css = css.replace(pre + n, uri)
js = js.replace('</script', '<\\/script')
html = re.sub(r'<link rel="icon"[^>]*>', '', html)
html = re.sub(r'<script type="module" crossorigin src="[^"]+"></script>', '', html)
html = re.sub(r'<link rel="stylesheet"[^>]*>', lambda m: '<style>' + css + '</style>', html)
html = html.replace('</body>', '<script type="module">' + js + '</script>\n</body>')
html = re.sub(r'<title>.*?</title>', '<title>ComfyMind Demo</title>', html)
open(OUT, 'w').write(html)
print(OUT, os.path.getsize(OUT) // 1024, 'KB')
