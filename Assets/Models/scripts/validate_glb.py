"""Validate self-contained GLB structure and finite geometry without dependencies."""
import sys, struct, json, math
from pathlib import Path

def check(path):
    path=Path(path);raw=path.read_bytes()
    magic,version,total=struct.unpack_from('<4sII',raw)
    assert magic==b'glTF' and version==2 and total==len(raw)
    size,kind=struct.unpack_from('<II',raw,12)
    assert kind==0x4E4F534A
    d=json.loads(raw[20:20+size])
    offset=20+size
    bin_size,bin_kind=struct.unpack_from('<II',raw,offset)
    assert bin_kind==0x004E4942
    data=raw[offset+8:offset+8+bin_size]
    assert all('uri' not in x for key in ('images','buffers') for x in d.get(key,[]))
    for view in d['bufferViews']:
        assert view.get('byteOffset',0)+view['byteLength']<=len(data)
    def values(index):
        a=d['accessors'][index];v=d['bufferViews'][a['bufferView']]
        code={5120:'b',5121:'B',5122:'h',5123:'H',5125:'I',5126:'f'}[a['componentType']]
        count={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
        fmt='<'+code*count;stride=v.get('byteStride',struct.calcsize(fmt))
        start=v.get('byteOffset',0)+a.get('byteOffset',0)
        return [struct.unpack_from(fmt,data,start+i*stride) for i in range(a['count'])]
    triangles=0
    for m in d['meshes']:
        for p in m['primitives']:
            pos=values(p['attributes']['POSITION'])
            assert all(math.isfinite(c) for v in pos for c in v)
            if 'NORMAL' in p['attributes']:
                assert all(abs(sum(c*c for c in n)-1)<.01 for n in values(p['attributes']['NORMAL']))
            ids=[x[0] for x in values(p['indices'])]
            assert len(ids)%3==0 and max(ids)<len(pos)
            triangles+=len(ids)//3
    result={'file':path.name,'bytes':len(raw),'meshes':len(d['meshes']),'triangles':triangles,'materials':len(d.get('materials',[])),'embedded_images':len(d.get('images',[])),'self_contained':True,'finite_positions':True,'valid_indices_and_normals':True}
    (path.parent/'validation.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result))

for p in sys.argv[1:]:check(p)
