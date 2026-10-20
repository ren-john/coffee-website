import bpy, math, bmesh
from mathutils import Vector
from studio import mesh, bevel_box

def normals(ob):
    bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(ob.data);bm.free()
    return ob

def lathe(name,profile,mat,center=(0,0,0),N=64):
    vs=[];rings=[];fs=[]
    for r,z in profile:
        if r==0:rings.append([len(vs)]);vs.append((center[0],center[1],center[2]+z))
        else:
            rings.append(list(range(len(vs),len(vs)+N)))
            vs.extend((center[0]+r*math.cos(i*2*math.pi/N),center[1]+r*math.sin(i*2*math.pi/N),center[2]+z) for i in range(N))
    for a,b in zip(rings,rings[1:]):
        for i in range(N):
            j=(i+1)%N
            if len(a)==len(b)==1:break
            if len(a)==1:fs.append((a[0],b[j],b[i]))
            elif len(b)==1:fs.append((a[i],a[j],b[0]))
            else:fs.append((a[i],a[j],b[j],b[i]))
    return normals(mesh(name,vs,fs,mat))

def cylinder(name,a,b,r,mat,r2=None,N=48):
    a,b=Vector(a),Vector(b);d=b-a
    bpy.ops.mesh.primitive_cone_add(vertices=N,radius1=r,radius2=r if r2 is None else r2,depth=d.length,location=(a+b)/2)
    ob=bpy.context.object;ob.name=name;ob.rotation_euler=d.to_track_quat('Z','Y').to_euler();ob.data.materials.append(mat)
    for p in ob.data.polygons:p.use_smooth=len(p.vertices)==4
    mod=ob.modifiers.new('Machined edge radius','BEVEL');mod.width=min(r*.15,.001);mod.segments=2
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=mod.name)
    ob.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return ob

def tube(name,points,r,mat):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=12;curve.bevel_depth=r;curve.bevel_resolution=3;curve.use_fill_caps=True
    sp=curve.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
    for p,co in zip(sp.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    ob=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
    return bpy.context.object

def text(name,value,loc,size,mat):
    c=bpy.data.curves.new(name,'FONT');c.body=value;c.size=size;c.align_x='CENTER';c.align_y='CENTER';c.extrude=.00003;c.resolution_u=4
    ob=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(math.pi/2,0,0);c.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
    return bpy.context.object

def cut_box(ob,loc,dims):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);cut=bpy.context.object;cut.dimensions=dims;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bpy.context.view_layer.objects.active=ob;mod=ob.modifiers.new('Recess','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cut
    bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cut,do_unlink=True)
    mod=ob.modifiers.new('Recess edge softening','BEVEL');mod.width=.001;mod.segments=2
    bpy.ops.object.modifier_apply(modifier=mod.name)
