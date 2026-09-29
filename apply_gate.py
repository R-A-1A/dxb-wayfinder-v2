from pathlib import Path
p=Path("index.html")
s=p.read_text()
s=s.replace('placeholder="DXB2026"','placeholder="Enter access code"')
needle='</body>'
if 'role-code-gate.js' not in s:
    s=s.replace(needle,'<script src="./role-code-gate.js"></script>\n'+needle,1)
p.write_text(s)
