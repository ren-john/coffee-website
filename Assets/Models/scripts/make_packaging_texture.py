from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import random, math

OUT = Path(__file__).resolve().parents[1] / 'CoffeePackaging' / 'textures'
OUT.mkdir(parents=True, exist_ok=True)
S = 2048
cream, wine, pale = '#fff9ef', '#480817', '#e8cbb2'
im = Image.new('RGB', (S, S), cream)
d = ImageDraw.Draw(im)
def font(size, serif=False, italic=False):
    name = 'georgiai.ttf' if italic else ('georgia.ttf' if serif else 'arial.ttf')
    return ImageFont.truetype('C:/Windows/Fonts/' + name, size)
def text(y, value, size, fill=wine, serif=False, italic=False, x=1024):
    d.text((x,y), value, font=font(size,serif,italic), anchor='mm', fill=fill)
def tracked(y, value, size=19, gap=5, fill=wine, x=1024):
    f=font(size)
    widths=[d.textlength(c,font=f) for c in value]
    left=x-(sum(widths)+gap*(len(value)-1))/2
    for c,w in zip(value,widths):
        d.text((left,y),c,font=f,fill=fill,anchor='lm');left+=w+gap
# Wraparound lower block, deliberately separate from the front label.
d.rectangle((0,1710,S,S),fill='#651f2b')
d.line((0,1710,S,1710),fill=pale,width=5)
# Original emblem and brand typography.
d.ellipse((981,305,1067,423),outline=wine,width=4)
d.arc((976,302,1039,427),-75,80,fill=wine,width=4)
text(492,'Mr. Bean',83,serif=True)
tracked(563,'COFFEE ROASTERS',18,4)
d.line((838,623,1210,623),fill='#c8ab93',width=2)
text(690,'A slower morning.',31,serif=True,italic=True)
# Front panel uses generous margins to survive pouch curvature.
d.rounded_rectangle((744,801,1304,1610),radius=4,fill=wine)
d.rectangle((769,826,1279,1585),outline='#aa7a63',width=2)
tracked(888,'THE HOUSE COLLECTION',16,3,fill=pale)
text(1020,'Dawn',91,cream,serif=True)
text(1117,'Blend',91,cream,serif=True)
d.line((846,1220,1202,1220),fill='#ad8069',width=2)
tracked(1280,'MEDIUM ROAST',19,4,fill=cream)
text(1360,'Chocolate · Hazelnut',26,pale)
text(1410,'Candied orange',26,pale)
tracked(1513,'WHOLE BEAN  /  250 g',18,3,fill=cream)
tracked(1812,'ROASTED WITH REVERENCE',17,3,fill=cream)
text(1880,'Crafted for your daily ritual.',25,pale,serif=True,italic=True)
# Back panel, divided at the UV seam: intentionally modest typography.
for x in (130,1918):
    text(800,'Mr. Bean',32,serif=True,x=x)
    for j,line in enumerate(['FRESHLY ROASTED','Store cool and dry.','Grind. Brew. Enjoy.']):
        text(910+j*48,line,17,x=x)
im.save(OUT/'packaging_basecolor.png')
print(OUT/'packaging_basecolor.png')
