#!/usr/bin/env python3
"""Junta kit.css + kit.js + <jogo>.js num único ficheiro em ../jogos/<jogo>.html"""
import os,sys,re
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda f:open(os.path.join(here,f),encoding='utf-8').read()
for f in sorted(os.listdir(here)):
    m=re.match(r'^g_(\w+)\.js$',f)
    if not m or (len(sys.argv)>1 and m.group(1) not in sys.argv[1:]):continue
    src=rd(f);title=re.search(r'^// TITLE: (.+)$',src,re.M).group(1)
    css=rd('kit.css')
    html='<!DOCTYPE html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><title>'+title+'</title>\n<style>\n'+css+'</style>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n</head><body>\n<script>\n'+rd('kit.js')+'</script>\n<script>\n'+src+'</script>\n</body></html>\n'
    assert '</script>' not in src and '</script>' not in rd('kit.js')
    open(os.path.join(here,'..','jogos',m.group(1)+'.html'),'w',encoding='utf-8').write(html)
    print(m.group(1),len(html))
