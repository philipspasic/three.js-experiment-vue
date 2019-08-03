<template>
    <div ref='three' class='three' @click='onMouseClick'>
        <div class='loading' :class='{"fade-out" : loaded}'>LOADING {{loadedPercent}}%</div>
    </div>
</template>

<script>
import HelperFunctions from "../mixins/helperFunctions"

import * as THREE from "three"
import * as Stats from "stats.js"

export default {
    name: 'three',

    data: () => ({
        width: 0,
        height: 0,
        loaded: false,
        loadedPercent: 0,
        objects: [],
        mixers: [],
        selected: null
    }),

    props: [],

    mixins: [
        HelperFunctions
    ],

    watch: {
        selected(s) {
            if (s.action) {
                if (!s.action.isPlaying) {
                    s.action.play()
                    s.action.isPlaying = true
                } else {
                    s.action.stop()
                    s.action.isPlaying = false
                }
            }

            console.log(s)
        }
    },

    mounted() {
        this.container = this.$refs.three;
        this.clock = new THREE.Clock();

        this.updateSize();

        this.initScene();

        this.manager = this.initLoadingManager();

        this.loadModel('/models/sexy/scene.gltf', new THREE.Vector3(-60, 0, -30));
        this.loadModel('/models/dancer/scene.gltf', new THREE.Vector3(50, 0, 30));
        this.loadModel('/models/bb8/scene.gltf', new THREE.Vector3(0, 0, 150), new THREE.Vector3(70, 70, 70));
        this.loadModel('/models/skeleton.glb', new THREE.Vector3(0, 0, -70), new THREE.Vector3(1, 1, 1))
        
        this.initObjects();

        this.stats = new Stats();
        this.stats.showPanel(2);
        this.container.appendChild(this.stats.dom);

        this.animate();
    },

    methods: {
        initScene() {
            // SCENE
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xdddddd);

            // RENDERER
            this.renderer = new THREE.WebGLRenderer({antialias: true});
            this.renderer.setSize(this.width, this.height);

            // CAMERA
            this.camera = new THREE.PerspectiveCamera(45, this.width/this.height, 1, 3000);
            this.camera.position.x = 100;
            this.camera.position.y = 200;
            this.camera.position.z = 600;

            // LIGHTS
            let ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
            this.scene.add(ambientLight);

            this.initDirectionalLight(0xeeeeee, 2, new THREE.Vector3(0, 250, 0), "Directional Light", true)
            this.initPointLight(0xffffff, 1, new THREE.Vector3(0, 150, 300), "Light 1", true)
            this.initPointLight(0xffffff, 1, new THREE.Vector3(0, 150, -300), "Light 2", true)

            // CONTROLS
            new THREE.OrbitControls(this.camera, this.renderer.domElement);

            // PUSH CANVAS TO CONTAINER
            this.container.appendChild(this.renderer.domElement);
        },

        initObjects() {
            // GROUND
            this.initGround()
        },

        initGround() {
            let ground = this.initObject(new THREE.BoxGeometry(500, 2, 500), new THREE.MeshBasicMaterial(), new THREE.Vector3(0, 0, 0))
            let texture = new THREE.TextureLoader().load("/textures/wood.jpg");
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            ground.material.map = texture
            ground.material.transparent = true
            ground.material.opacity = .5
            ground.name = "Ground"

            this.scene.add(ground)
        },

        update() {
            let delta = this.clock.getDelta();

            for (let i = 0; i < this.mixers.length; i++) {
                this.mixers[i].update(delta)
            }

            for (let i = 0; i < this.textlabels.length; i++) {
                this.textlabels[i].updatePosition()
            }

            this.stats.update();
        },

        animate() {
            if(this._isDestroyed){
                return
            }

            requestAnimationFrame(this.animate);

            this.update()

            this.renderer.render(this.scene, this.camera);
        }
    },

    computed: {
    },

    components: {
    }
}
</script>

<style scoped="">
    .three {
        position: relative;
        height: 100vh;
        width: 100vw;
    }

    .loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        color: white;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: .4s;
    }

    .fade-out {
        opacity: 0;
        pointer-events: none;
    }
</style>