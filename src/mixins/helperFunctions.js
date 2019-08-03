import * as THREE from "three"

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
THREE.OrbitControls = OrbitControls;
THREE.GLTFLoader = GLTFLoader;

var helper = {
    data: () => ({
        textlabels: []
    }),

    mixins: [],

    components: {},

    watch: {},

    created() {},

    mounted() {
        window.addEventListener('resize', this.resizeHandler)
        window.addEventListener('orientationchange', this.resizeHandler)
    },

    computed: {},

    methods: {
        updateSize() {
            this.width = this.container.offsetWidth
            this.height = this.container.offsetHeight
        },

        resizeHandler() {
            if (!this.renderer) {
                return
            }

            this.updateSize();
            this.renderer.setSize(this.width, this.height);
            this.camera.aspect = this.width/this.height
            this.camera.updateProjectionMatrix()
        },

        initObject(geometry, material, position) {
            let mesh = new THREE.Mesh(geometry, material)
            position && mesh.position.copy(position);
            this.scene.add(mesh);

            return mesh
        },

        initLoadingManager() {
            let manager = new THREE.LoadingManager();
            let self = this

            manager.onProgress = function(item, loaded, total) {
                self.loadedPercent = (loaded / total * 100).toFixed(0);
            };

            manager.onLoad = () => {
                self.loaded = true
            };

            manager.onError = () => { 
                // console.error(e);
            }

            return manager;
        },

        initDirectionalLight(color, intensity, position, name, visualize) {
            let light = new THREE.DirectionalLight(color, intensity);
            light.name = name
            position && light.position.copy(position);
            this.scene.add(light);

            if(visualize) {
                let lightObj = this.initObject(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshBasicMaterial(), position)
                lightObj.name = name
                lightObj.material.color.set(color)
                this.objects.push(lightObj)

                let text = this.createTextLabel();
                text.setHTML(name);
                text.setParent(lightObj);
                this.container.appendChild(text.element);
                this.textlabels.push(text);
            }
        },

        initPointLight(color, intensity, position, name, visualize) {
            let light = new THREE.PointLight(color, intensity);
            light.name = name
            position && light.position.copy(position);
            this.scene.add(light);

            if(visualize) {
                let lightObj = this.initObject(new THREE.SphereGeometry(3, 32, 32), new THREE.MeshBasicMaterial(), position)
                lightObj.name = name
                lightObj.material.color.set(color)
                this.objects.push(lightObj)

                let text = this.createTextLabel();
                text.setHTML(name);
                text.setParent(lightObj);
                this.container.appendChild(text.element);
                this.textlabels.push(text);
            }
        },

        loadModel(gltf, position, scale) {
            let self = this
            let loader = new THREE.GLTFLoader(this.manager);

            let onLoad = (gltf, position, scale) => {
                let model = gltf.scene.children[0];

                scale && model.scale.copy(scale);

                position && model.position.copy(position);

                // let bbox = new THREE.BoundingBoxHelper(model, 0xffffff);
                // bbox.update()
                // self.scene.add(bbox)

                let animation = gltf.animations[0]
                if (animation) {
                    let mixer = new THREE.AnimationMixer(gltf.scene);
                    self.mixers.push(mixer)
                    model.action = mixer.clipAction(animation)
                    model.action.play()
                    model.action.isPlaying = true
                }

                model.castShadow = true
                model.name = "Model"
                self.objects.push(model)
                self.scene.add(gltf.scene);
            };

            loader.load(gltf, gltf => onLoad(gltf, position, scale))
        },

        createTextLabel() {
            var div = document.createElement('div');
            div.className = 'text-label';
            div.style.position = 'absolute';
            div.style.width = 100;
            div.style.height = 100;
            div.innerHTML = "hi there!";
            div.style.top = -1000;
            div.style.left = -1000;
            
            let self = this;
            
            return {
                element: div,
                parent: false,
                position: new THREE.Vector3(0,0,0),

                setHTML: function(html) {
                    this.element.innerHTML = html;
                },

                setParent: function(threejsobj) {
                    this.parent = threejsobj;
                },

                updatePosition: function() {
                    if(parent) {
                        this.position.copy(this.parent.position)
                    }

                    var coords2d = this.get2DCoords(this.position, self.camera);
                    this.element.style.left = coords2d.x + 'px';
                    this.element.style.top = coords2d.y + 'px';
                },

                get2DCoords: function(position, camera) {
                    var vector = position.project(camera);
                    vector.x = (vector.x + 1)/2 * self.width;
                    vector.y = -(vector.y - 1)/2 * self.height;
                    return vector;
                }
            };
        },

        onMouseClick(event) {
            event.preventDefault()

            let raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();

            this.mouse.x = ( event.clientX / this.width ) * 2 - 1;
            this.mouse.y = - ( event.clientY / this.height ) * 2 + 1;

            raycaster.setFromCamera(this.mouse, this.camera);

            let intersects = raycaster.intersectObjects(this.objects, true);

            if (intersects.length > 0){
                let selected = intersects[0].object
                let par = intersects[0].object.parent;
                while(par.type !== "Scene"){
                    selected = par;
                    par = par.parent;
                } 

                this.selected = selected
            }
        },
    }
}


export default helper;