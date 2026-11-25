# Build the demo and adapt dist/index.html to the artifact host (no doctype/html/head/body tags).
import subprocess, re, os, sys, json
SP=os.environ.get('OUT_DIR','/tmp/comfymind-artifact'); os.makedirs(SP,exist_ok=True); OUT=os.path.join(SP,'artifact-dist')
subprocess.run(['rm','-rf',OUT],check=True)
subprocess.run(['npx','vite','build','--mode','demo','--outDir',OUT],cwd=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','frontend'),check=True,stdout=subprocess.DEVNULL)
html=open(os.path.join(OUT,'index.html')).read()
head=re.search(r'<head>(.*?)</head>',html,re.S).group(1)
keep=[l.strip() for l in re.findall(r'(<script[^>]*></script>|<link rel="(?:stylesheet|modulepreload)"[^>]*>)',head)]
page='<title>ComfyMind Demo</title>\n<meta name="theme-color" content="#14202F">\n<style>html,body{margin:0;background:#F2F0F5}</style>\n'+'\n'.join(keep)+'\n<div id="app"></div>\n'
open(os.path.join(OUT,'index.html'),'w').write(page)
files={}
for root,_,fs in os.walk(OUT):
    for f in fs:
        rel=os.path.relpath(os.path.join(root,f),OUT)
        if rel!='index.html': files[rel]=os.path.join(root,f)
json.dump(files,open(os.path.join(SP,'artifact-files.json'),'w'),indent=1)
print(page); print(len(files),'files'); 
import collections; print(collections.Counter(os.path.splitext(k)[1] for k in files))
print(sum(os.path.getsize(v) for v in files.values())//1024,'KB')
