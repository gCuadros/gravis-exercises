import bpy, sys, types, importlib, json, math
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion

config = json.loads(Path(sys.argv[sys.argv.index("--") + 1]).read_text())
root = Path(config["inputs"])
out = Path(config["output"])
if bpy.app.version_string != "4.5.15 LTS":
    assert bpy.app.version[:3] == (4, 5, 15), "Use pinned Blender 4.5.15"
package = types.ModuleType("bl_ext.gravis")
package.__path__ = [str(root / "mpfb2-2.0.18/src")]
sys.modules["bl_ext.gravis"] = package
bpy.context.preferences.addons.new().module = "bl_ext.gravis.mpfb"
mpfb = importlib.import_module("bl_ext.gravis.mpfb")
mpfb.register()
H = importlib.import_module("bl_ext.gravis.mpfb.services.humanservice").HumanService
T = importlib.import_module("bl_ext.gravis.mpfb.services.targetservice").TargetService
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
m = T.get_default_macro_info_dict()
m.update({"gender": 1.0, "age": 0.5, "muscle": 1.0, "weight": 0.6, "height": 0.58})
m["race"] = {"caucasian": 0.75, "african": 0.15, "asian": 0.1}
body = H.create_human(macro_detail_dict=m)
body.name = "Gravis_Athlete_body"
bpy.context.view_layer.update()
assert body.dimensions.z > 1.4, "Unexpected character scale"
rig = H.add_builtin_rig(body, "game_engine")
rig.name = "Gravis_Athlete_rig"

assets = root / "assets"
H.set_character_skin(
    str(assets / "skins/young_caucasian_male/young_caucasian_male.mhmat"),
    body,
    skin_type="MAKESKIN",
)
for name, kind in [
    ("eyes/high-poly/high-poly", "Eyes"),
    ("hair/short01/short01", "Hair"),
    ("eyebrows/eyebrow008/eyebrow008", "Eyebrows"),
    ("clothes/shoes05/shoes05", "Clothes"),
]:
    obj = H.add_mhclo_asset(
        str(assets / (name + ".mhclo")), body, asset_type=kind, subdiv_levels=1
    )
    obj.name = "Gravis_" + name.split("/")[-1]
# Fitted third-party CC0 garments; original neutral material override.
shirt = H.add_mhclo_asset(
    str(assets / "clothes/elvs_crude_t-shirt_male/elvs_crude_t-shirt_male.mhclo"),
    body,
    subdiv_levels=1,
)
shorts = H.add_mhclo_asset(
    str(assets / "clothes/cortu_jeans_shorts/cortu_jeans_shorts.mhclo"),
    body,
    subdiv_levels=1,
)
for obj, name in [(shirt, "Gravis_training_top"), (shorts, "Gravis_training_shorts")]:
    obj.name = name
    obj.data.materials.clear()
    mat = bpy.data.materials.new(name + "_fabric")
    mat.use_nodes = True
    p = mat.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (0.018, 0.026, 0.032, 1)
    p.inputs["Roughness"].default_value = 0.75
    noise = mat.node_tree.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 450
    bump = mat.node_tree.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.2
    bump.inputs["Distance"].default_value = 0.001
    mat.node_tree.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    mat.node_tree.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    obj.data.materials.append(mat)
for material in body.data.materials:
    if material and material.use_nodes:
        p = material.node_tree.nodes.get("Principled BSDF")
        if p:
            p.inputs["Emission Strength"].default_value = 0
            p.inputs["Roughness"].default_value = 0.48
            p.inputs["Subsurface Weight"].default_value = 0.08
# Bake phenotype only after all fitted assets have been added.
bpy.ops.object.select_all(action="DESELECT")
bpy.context.view_layer.objects.active = body
body.select_set(True)
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)


# Review-only broad masks. These are not anatomically segmented muscles or measured activation.
def highlight(obj):
    attribute = obj.data.color_attributes.new(
        name="gravis_primary_region", type="FLOAT_COLOR", domain="POINT"
    )
    for i, v in enumerate(obj.data.vertices):
        x, y, z = v.co
        quad = (
            max(0, 1 - ((abs(x) - 0.12) / 0.105) ** 2 - ((z - 0.66) / 0.19) ** 2)
            if y < -0.035
            else 0
        )
        glute = (
            max(0, 1 - ((abs(x) - 0.09) / 0.12) ** 2 - ((z - 0.83) / 0.12) ** 2)
            if y > 0.045
            else 0
        )
        weight = max(quad, glute)
        attribute.data[i].color = (weight, weight, weight, 1)
    for material in obj.data.materials:
        if not material or not material.use_nodes:
            continue
        nodes = material.node_tree.nodes
        links = material.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        if not bsdf:
            continue
        original = (
            bsdf.inputs["Base Color"].links[0].from_socket
            if bsdf.inputs["Base Color"].is_linked
            else None
        )
        mix = nodes.new("ShaderNodeMixRGB")
        mix.name = "Gravis_primary_highlight"
        mix.blend_type = "MIX"
        mix.inputs[1].default_value = bsdf.inputs["Base Color"].default_value
        mix.inputs[2].default_value = (0.65, 0.008, 0.018, 1)
        if original:
            links.new(original, mix.inputs[1])
        attr = nodes.new("ShaderNodeVertexColor")
        attr.layer_name = "gravis_primary_region"
        strength = nodes.new("ShaderNodeMath")
        strength.operation = "MULTIPLY"
        strength.name = "Gravis_highlight_visibility"
        strength.inputs[1].default_value = 0.72
        rig["highlight_regions"] = True
        driver = strength.inputs[1].driver_add("default_value").driver
        variable = driver.variables.new()
        variable.name = "show"
        variable.type = "SINGLE_PROP"
        variable.targets[0].id = rig
        variable.targets[0].data_path = '["highlight_regions"]'
        driver.expression = "0.72 if show else 0.0"
        links.new(attr.outputs["Color"], strength.inputs[0])
        links.new(strength.outputs[0], mix.inputs[0])
        links.new(mix.outputs[0], bsdf.inputs["Base Color"])
        material["review"] = (
            "Unreviewed broad region mask; not an anatomical segmentation"
        )


highlight(body)
highlight(shorts)
# Smooth surfaces and retain actual source provenance in the scene.
sub = body.modifiers.new("Skin surface", "SUBSURF")
sub.levels = 1
for obj in bpy.context.scene.objects:
    if obj.type == "MESH":
        for p in obj.data.polygons:
            p.use_smooth = True
rig["status"] = "unreviewed-development-sample"
rig["source"] = "MakeHuman/MPFB core assets CC0; original Gravis setup"
rig["anatomy_approved"] = False
rest = {b.name: b.matrix_local.copy() for b in rig.data.bones}
heads = {b.name: b.head_local.copy() for b in rig.data.bones}
tails = {b.name: b.tail_local.copy() for b in rig.data.bones}


def setbone(name, head, rotation):
    p = rig.pose.bones[name]
    p.matrix = (
        Matrix.Translation(head)
        @ rotation.to_matrix().to_4x4()
        @ rest[name].to_3x3().to_4x4()
    )
    bpy.context.view_layer.update()


def pointbone(name, head, direction):
    delta = (
        (tails[name] - heads[name])
        .normalized()
        .rotation_difference(direction.normalized())
    )
    setbone(name, head, delta)


anchor = heads["pelvis"]
# Derive the bottom pose from this character's proportions, keeping the thigh near horizontal.
shin_length = (tails["calf_l"] - heads["calf_l"]).length
thigh_length = (tails["thigh_l"] - heads["thigh_l"]).length
lateral_offset = heads["thigh_l"].x - heads["foot_l"].x
bottom_knee = heads["foot_l"] + Vector(
    (0, -shin_length * math.sin(0.64), shin_length * math.cos(0.64))
)
bottom_hip = bottom_knee + Vector(
    (lateral_offset, math.sqrt(thigh_length**2 - lateral_offset**2), 0)
)
bottom_shift = bottom_hip - heads["thigh_l"]
for frame in range(301):
    d = config["depths"][frame]
    bpy.context.scene.frame_set(frame)
    for p in rig.pose.bones:
        p.matrix_basis = Matrix.Identity(4)
    shift = bottom_shift * d
    setbone("pelvis", heads["pelvis"] + shift, Quaternion())
    lean = Quaternion((1, 0, 0), 0.52 * d)
    for n in ["spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r"]:
        setbone(n, anchor + shift + lean @ (heads[n] - anchor), lean)
    for n in ["neck_01", "head"]:
        setbone(
            n,
            anchor + shift + lean @ (heads[n] - anchor),
            Quaternion((1, 0, 0), 0.12 * d),
        )
    for side in ["l", "r"]:
        a = heads["thigh_" + side] + shift
        c = heads["foot_" + side]
        length1 = (tails["thigh_" + side] - heads["thigh_" + side]).length
        length2 = (tails["calf_" + side] - heads["calf_" + side]).length
        axis = (c - a).normalized()
        dist = (c - a).length
        along = (length1**2 - length2**2 + dist**2) / (2 * dist)
        bend = Vector((0, -1, 0))
        bend = (bend - axis * bend.dot(axis)).normalized()
        knee = a + axis * along + bend * math.sqrt(max(0, length1**2 - along**2))
        pointbone("thigh_" + side, a, knee - a)
        pointbone("calf_" + side, knee, c - knee)
        setbone("foot_" + side, c, Quaternion())
        shoulder = anchor + shift + lean @ (heads["upperarm_" + side] - anchor)
        angle = 0.08 + 1.7 * d
        upper = Vector((0, -math.sin(angle), -math.cos(angle)))
        lower = Vector((0, -math.sin(angle + 0.1), -math.cos(angle + 0.1)))
        elbow = (
            shoulder
            + upper * (tails["upperarm_" + side] - heads["upperarm_" + side]).length
        )
        pointbone("upperarm_" + side, shoulder, upper)
        pointbone("lowerarm_" + side, elbow, lower)
    for p in rig.pose.bones:
        p.rotation_mode = "QUATERNION"
        p.keyframe_insert("location", frame=frame)
        p.keyframe_insert("rotation_quaternion", frame=frame)
        p.keyframe_insert("scale", frame=frame)
rig.animation_data.action.name = "Squat_full_draft"
scene = bpy.context.scene
scene.frame_start = 0
scene.frame_end = 300
scene.render.fps = config["fps"]
scene.frame_set(81)
bpy.context.view_layer.update()
thigh = rig.pose.bones["thigh_l"]
bottom_thigh_vertical_ratio = abs((thigh.tail - thigh.head).z) / thigh.length
assert (
    bottom_thigh_vertical_ratio < 0.08
), "Bottom thigh deviates from approximate parallel"
samples = []
for f in range(0, 301, 3):
    scene.frame_set(f)
    bpy.context.view_layer.update()
    error = max(
        (rig.pose.bones["foot_" + side].head - heads["foot_" + side]).length
        for side in ["l", "r"]
    )
    samples.append(error)
assert max(samples) < 0.0001, "Foot-bone contact drift exceeds 0.1mm"
(out / "native-validation.json").write_text(
    json.dumps(
        {
            "sampledFrames": len(samples),
            "bottomThighVerticalRatio": bottom_thigh_vertical_ratio,
            "highlightToggleVerified": False,
            "maxFootBoneDriftMetres": max(samples),
            "frames": 301,
            "fps": config["fps"],
            "skinMeshes": sum(
                1
                for o in scene.objects
                if o.type == "MESH" and any(m.type == "ARMATURE" for m in o.modifiers)
            ),
            "limits": "Bone contacts only; no mesh collision, biomechanics or anatomy certification",
        },
        indent=2,
    )
)
scene.world.use_nodes = True
scene.world.node_tree.nodes.get("Background").inputs["Color"].default_value = (
    0.66,
    0.68,
    0.65,
    1,
)
scene.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.35
bpy.ops.mesh.primitive_plane_add(size=2000, location=(0, 0, -0.025))
floor = bpy.context.object
floor.name = "Studio_floor"
mat = bpy.data.materials.new("Studio_neutral")
mat.diffuse_color = (0.66, 0.68, 0.65, 1)
floor.data.materials.append(mat)
for name, location, power, size in [
    ("Key", (3, -4, 5), 600, 4),
    ("Fill", (-3, -2, 3), 350, 3),
    ("Rim", (1, 3, 4), 500, 3),
]:
    light = bpy.data.lights.new(name, "AREA")
    light.energy = power
    light.shape = "DISK"
    light.size = size
    o = bpy.data.objects.new(name, light)
    scene.collection.objects.link(o)
    o.location = location
    o.rotation_euler = (
        (Vector((0, 0, 0.9)) - o.location).to_track_quat("-Z", "Y").to_euler()
    )
cam = bpy.data.cameras.new("Review_camera")
camera = bpy.data.objects.new("Review_camera", cam)
scene.collection.objects.link(camera)
scene.camera = camera
cam.type = "ORTHO"
cam.ortho_scale = 2.45
scene.render.engine = "CYCLES"
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 900
scene.render.resolution_y = 1100
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = "AgX"
bpy.ops.file.pack_all()
scene.frame_set(0)
camera.location = (2.5, -4.5, 2)
camera.rotation_euler = (
    (Vector((0, 0, 0.8)) - camera.location).to_track_quat("-Z", "Y").to_euler()
)
bpy.ops.wm.save_as_mainfile(filepath=str(out / "gravis-athlete-v2.blend"))
# Verify the saved native artifact, including driver evaluation after a clean reload.
bpy.ops.wm.open_mainfile(filepath=str(out / "gravis-athlete-v2.blend"))
scene = bpy.context.scene
rig = bpy.data.objects["Gravis_Athlete_rig"]
camera = scene.camera
floor = bpy.data.objects["Studio_floor"]
# Verify the actual native shader switch independently from the stored property.
for visible in [False, True]:
    rig["highlight_regions"] = visible
    rig.update_tag()
    scene.frame_set(81)
    bpy.context.view_layer.update()
    for material in bpy.data.materials:
        if material.use_nodes:
            node = material.node_tree.nodes.get("Gravis_highlight_visibility")
            if node:
                assert (
                    abs(node.inputs[1].default_value - (0.72 if visible else 0)) < 1e-5
                )
validation = json.loads((out / "native-validation.json").read_text())
validation["highlightToggleVerified"] = True
validation["savedSceneReopened"] = True
(out / "native-validation.json").write_text(json.dumps(validation, indent=2))

for name, frame, position in [
    ("standing", 0, (2.5, -4.5, 2.0)),
    ("squat-front", 81, (2.4, -4.5, 1.8)),
    ("squat-rear", 81, (-2.7, 4.2, 1.8)),
]:
    scene.frame_set(frame)
    camera.location = position
    camera.rotation_euler = (
        (Vector((0, 0, 0.8)) - camera.location).to_track_quat("-Z", "Y").to_euler()
    )
    scene.render.filepath = str(out / (name + ".png"))
    bpy.ops.render.render(write_still=True)
scene.frame_set(0)
bpy.ops.object.select_all(action="DESELECT")
for obj in scene.objects:
    if obj == rig or (obj.type == "MESH" and obj != floor):
        obj.select_set(True)
for material in bpy.data.materials:
    if not material.use_nodes:
        continue
    nodes = material.node_tree.nodes
    mix = nodes.get("Gravis_primary_highlight")
    bsdf = nodes.get("Principled BSDF")
    if mix and bsdf:
        source = mix.inputs[1].links[0].from_socket if mix.inputs[1].is_linked else None
        if source:
            material.node_tree.links.new(source, bsdf.inputs["Base Color"])
        else:
            for link in list(bsdf.inputs["Base Color"].links):
                material.node_tree.links.remove(link)
            bsdf.inputs["Base Color"].default_value = mix.inputs[1].default_value
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(
    filepath=str(out / "character-base.glb"),
    export_format="GLB",
    use_selection=True,
    export_animations=True,
    export_force_sampling=True,
    export_frame_range=True,
    export_apply=True,
    export_extras=True,
    export_yup=True,
    export_morph=False,
    export_vertex_color="NONE",
)
print("CHARACTER_READY", str(out))
