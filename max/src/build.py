#!/usr/bin/env python3
"""Junta kit.css + kit.js + <jogo>.js num único ficheiro em ../jogos/<jogo>.html"""
import os,sys,re
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda f:open(os.path.join(here,f),encoding='utf-8').read()
for f in sorted(os.listdir(here)):
    m=re.match(r'^g_(\w+)\.js$',f)
    args=[a for a in sys.argv[1:] if a!='--force']
    if not m or (args and m.group(1) not in args):continue
    src=rd(f);title=re.search(r'^// TITLE: (.+)$',src,re.M).group(1)
    css=rd('kit.css')
    extra=os.path.join(here,'extra_'+m.group(1)+'.html');extra=open(extra,encoding='utf-8').read() if os.path.exists(extra) else ''
    html='<!DOCTYPE html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><title>'+title+'</title>\n<style>\n'+css+'</style>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n</head><body>\n<script>\n'+rd('kit.js')+'</script>\n<script>\n'+src+'</script>\n'+extra+'</body></html>\n'
    assert '</script>' not in src and '</script>' not in rd('kit.js')
    out=os.path.join(here,'..','jogos',m.group(1)+'.html')
    # os ficheiros em ../jogos foram corrigidos diretamente (são a versão verdadeira): não os apagar sem --force
    if os.path.exists(out) and open(out,encoding='utf-8').read()!=html and '--force' not in sys.argv:
        print(m.group(1),'IGNORADO: ../jogos/'+m.group(1)+'.html tem alterações que não estão aqui (usa --force para substituir)');continue
    open(out,'w',encoding='utf-8').write(html)
    print(m.group(1),len(html))
