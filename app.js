Potree.scriptPath = new URL("./potree/build/potree", window.location.href).href;

(function(){
  const container = document.getElementById('potree_render_area');
  const viewer = new Potree.Viewer(container);
  const demoSelect = document.getElementById('demo_select');

  const demos = {
    groningen: {
      files: [
        {
          path: './data/groningen/facades.copc.laz',
          type: 'COPC',
          apply(pointcloud) {
            pointcloud.material.size = 1.0;
            pointcloud.material.pointSizeType = Potree.PointSizeType.FIXED;
            pointcloud.material.shape = Potree.PointShape.ROUND;
          },
        },
        {
          path: './data/groningen/target_point.copc.laz',
          type: 'COPC',
          apply(pointcloud, viewer) {
            pointcloud.material.size = 10.0;
            pointcloud.material.pointSizeType = Potree.PointSizeType.FIXED;
            pointcloud.material.shape = Potree.PointShape.ROUND;
            pointcloud.material.color = new THREE.Color(1, 1, 1);
            
            // Add annotation for the target point
            const position = pointcloud.boundingBox.getCenter(new THREE.Vector3());
            const annotation = new Potree.Annotation({
              position: position,
              title: "source",
              description: "This point is the source point for the viewshed analysis.",
              cameraTarget: position.clone().add(new THREE.Vector3(0, 1, 2)),
              cameraPosition: position.clone().add(new THREE.Vector3(0, 0, 2)),
            });
            
            viewer.scene.annotations.add(annotation);
          },
        },
        {
          path: './data/groningen/viewshed_2d.copc.laz',
          type: 'COPC',
          apply(pointcloud) {
            pointcloud.material.size = 1.0;
            pointcloud.material.pointSizeType = Potree.PointSizeType.FIXED;
            pointcloud.material.shape = Potree.PointShape.ROUND;

            // Hijack the intensity attribute to visualize the viewshed results
            pointcloud.material.activeAttributeName = 'intensity gradient';
            pointcloud.material.intensityRange = [0, 65535];
            const color = pointcloud.material.color.constructor;
            pointcloud.material.gradient = [
              [0.0, new color(0, 0, 1.0)],
              [0.5, new color(1.0, 1.0, 0.0)],
              [1.0, new color(1.0, 0.0, 0.0)],
            ];
          },
        },
      ],
    },
    delft: {
      files: [
        {
          path: './data/bouwkunde/facades.copc.laz',
          type: 'COPC',
          apply(pointcloud) {
            pointcloud.material.size = 1.0;
            pointcloud.material.pointSizeType = Potree.PointSizeType.FIXED;
            pointcloud.material.shape = Potree.PointShape.ROUND;

            // HACK: Lock the material so Potree cannot force it to clip
            Object.defineProperty(pointcloud.material, 'clipTask', {
              get: () => Potree.ClipTask.NONE,
              set: () => {} // An empty setter makes it impossible to overwrite
            });
          },
        },
        {
          path: './data/bouwkunde/target_point.copc.laz',
          type: 'COPC',
          apply(pointcloud, viewer) {
            pointcloud.material.size = 10.0;
            pointcloud.material.pointSizeType = Potree.PointSizeType.FIXED;
            pointcloud.material.shape = Potree.PointShape.ROUND;
            pointcloud.material.color = new THREE.Color(1, 1, 1);
            
            // Add annotation for the target point
            const position = pointcloud.boundingBox.getCenter(new THREE.Vector3());
            const annotation = new Potree.Annotation({
              position: position,
              title: "source",
              description: "This point is the source point for the viewshed analysis.",
              cameraTarget: position.clone().add(new THREE.Vector3(0, 1, 2)),
              cameraPosition: position.clone().add(new THREE.Vector3(0, 0, 2)),
            });
            
            viewer.scene.annotations.add(annotation);
          },
        },
        {
          path: './data/bouwkunde/viewshed_3d_voxel.copc.laz',
          type: 'COPC',
          apply(pointcloud, viewer) {
            // Point styling
            pointcloud.material.size = 0.4;
            pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
            pointcloud.material.shape = Potree.PointShape.SQUARE;

            // Hijack the intensity attribute to visualize the viewshed results
            pointcloud.material.activeAttributeName = 'intensity gradient';
            pointcloud.material.intensityRange = [0, 65535];
            const color = pointcloud.material.color.constructor;
            pointcloud.material.gradient = [
              [0.0, new color(0, 0, 1.0)],
              [0.5, new color(1.0, 1.0, 0.0)],
              [1.0, new color(1.0, 0.0, 0.0)],
            ];

            // Z-Dimension Slicing Feature
            const box = pointcloud.boundingBox;
            const centerX = (box.min.x + box.max.x) / 2;
            const centerY = (box.min.y + box.max.y) / 2;
            const widthX = box.max.x - box.min.x;
            const widthY = box.max.y - box.min.y;

            // Create the clipping box
            const volume = new Potree.BoxVolume();
            volume.name = "Z-Slice";
            volume.visible = false;
            volume.scale.set(widthX + 10, widthY + 10, 2); 
            
            const initialZ = box.min.z + 5;
            volume.position.set(centerX, centerY, initialZ);
            volume.clip = true; 

            viewer.scene.addVolume(volume);
            viewer.setClipTask(Potree.ClipTask.SHOW_INSIDE);

            // Custom slider UI
            const uiPanel = document.getElementById('custom_ui_panel');
            const zSlider = document.getElementById('z_slider');
            const zDisplay = document.getElementById('z_value_display');

            uiPanel.style.display = 'flex'; // Use flex to match the new CSS

            // Lock slider limits strictly to the point cloud's min and max Z
            const tightBox = pointcloud.pcoGeometry.tightBoundingBox;
            zSlider.min = tightBox.min.z;
            zSlider.max = tightBox.max.z;
            zSlider.step = 0.1; 
            zSlider.value = initialZ;
            zDisplay.innerText = initialZ.toFixed(1) + "m";

            zSlider.addEventListener('input', (e) => {
              const newZ = parseFloat(e.target.value);
              volume.position.z = newZ;
              zDisplay.innerText = newZ.toFixed(1) + "m";
            });
          },
        },
        {
          path: './data/bouwkunde/optimal_path.copc.laz',
          type: 'COPC',
          apply(pointcloud) {
            pointcloud.material.size = 1.0;
            pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
            pointcloud.material.shape = Potree.PointShape.SQUARE;

            const color = pointcloud.material.color.constructor;
            pointcloud.material.activeAttributeName = 'elevation';
            pointcloud.material.gradient = [
              [0.0, new color(1, 1, 1)],
              [1.0, new color(1, 1, 1)],
            ];

            // Lock the material so Potree cannot force it to clip
            Object.defineProperty(pointcloud.material, 'clipTask', {
              get: () => Potree.ClipTask.NONE,
              set: () => {} // An empty setter makes it impossible to overwrite
            });
          },
        },
      ],
    },
    ventoux: {
      files: [
        {
          path: './data/ventoux/facades.copc.laz',
          type: 'COPC',
          apply(pointcloud) {
            pointcloud.material.size = 1.0;
            pointcloud.material.pointSizeType = Potree.PointSizeType.FIXED;
            pointcloud.material.shape = Potree.PointShape.ROUND;
            pointcloud.material.activeAttributeName = 'classification';
          },
        },
      ],
    },
  };

  const params = new URLSearchParams(window.location.search);
  const demoName = demos[params.get('demo')] ? params.get('demo') : 'groningen';

  if (demoSelect) {
    demoSelect.value = demoName;
    demoSelect.addEventListener('change', () => {
      const next = demoSelect.value;
      const url = new URL(window.location.href);
      url.searchParams.set('demo', next);
      window.location.assign(url.href);
    });
  }

  function loadDemo(name) {
    if (document.getElementById('custom_ui_panel')) {
       document.getElementById('custom_ui_panel').style.display = 'none';
    }

    const demo = demos[name] || demos.groningen;

    for (const item of demo.files) {
      Potree.loadPointCloud(item.path, item.type, (event) => {
        const pointcloud = event.pointcloud;
        item.apply(pointcloud, viewer);
        viewer.scene.addPointCloud(pointcloud);
        if (item.path === demo.files[0].path) {
          viewer.fitToScreen(0.5);
        }
      });
    }

    if (demo.onReady) {
      demo.onReady();
    }
  }

  viewer.setEDLEnabled(true);
  viewer.setFOV(60);
  viewer.setPointBudget(3_000_000);
  viewer.setEDLEnabled(false);
  viewer.loadSettingsFromURL();

  viewer.loadGUI(() => {
    viewer.setLanguage('en');
    
    loadDemo(demoName);
  });

})();