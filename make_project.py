from pathlib import Path
import re, shutil
cfg={}
for line in Path('config.txt').read_text().splitlines():
    if '=' in line:
        k,v=line.split('=',1); cfg[k.strip()]=v.strip()
p=Path('app/src/main/res/values/strings.xml')
p.write_text(f'''<resources><string name="app_name">{cfg.get("APP_NAME","Your App Name")}</string></resources>''')
print("Configured app. Now push this project to GitHub and run Actions -> Build Android APK.")
