if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

//initialize scene
var scene;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
var frustumSize = 150;

//initialize cameras and helpers
var camera,
    cameraOrtho, cameraPersp,
    activeCamera;
var cameraOHelper, cameraPHelper,
    activeHelper, cameraRig;

//initialize renderer and controls
var renderer,
    cameraControlO, cameraControlP;

//initialize light and lighting property
var ambientLight;

var point_light, sphere, pointRep, pointMaterial;
var pointLightColor = 0Xffffff;

var spot_light, sphere1, spotMaterial,  spotHelper;

var direction_light, directionColor;
var arrowHelper1, arrowHelper2, arrowHelper3;
var arrowDirection = new THREE.Vector3();
var arrowPosition1 = new THREE.Vector3();
var arrowPosition2 = new THREE.Vector3();
var arrowPosition3 = new THREE.Vector3();

var diffuseColor = new THREE.Color();
var specularColor = new THREE.Color();


//initialize object and material
var wireMaterial, flatMaterial, smoothMaterial, glossyMaterial, textureMaterial,
    objectGeometry,objectMaterial, material,
    object;
var cubeMat, ballMat, torusMat;

//initialize gui
var gui;
var objectType;
var len=50;
var movelen=100.0;
//the control values initialization
effectController = {
    //object type and material
    objectType: "cube",
    objectTexture: "shiny",

    //object material control
    mdiffuse: 0.8,
    mspecular:0.6,
    mshin:100,
    mred: 0.650,
    mgreen: 0.141,
    mblue: 0.149,
    metallic: false,

    //light control
    ambientLight: true,

    //directional light
    directionLight: true,
    dintensity: 0.55,
    dline:false,

    //point light
    pointLight: false,
    px: 0,
    py: 30,
    pz: 10,
    panimation: false,
    phue: 0.75,
    psaturation: 0.81,
    plightness: 0.99,

    //spot light
    spotLight: false,
    spotx: 10,
    spoty: 20,
    spotz: -10,
    sanimation: false,
    stargetx: 0,
    stargety: 0,
    stargetz: 0,
    sangle: 0.79,
    sline: false,
    scolor: 0xffff00,

    //object rotation, scaling and translation
    rx: 0.001,
    ry: 0.001,
    rz: 0.001,
    tx: 0,
    ty: 0,
    tz: 0,
    sx: 1.0,
    sy: 1.0,
    sz: 1.0,

    //camera control
    cameraType: "orthogonal",

    ortho: true,
    persp: false,

    //orothogonal camera
    left: -75,
    right:75,
    top: 75,
    bottom: -75,
    near: -200,
    far: 200,

    //perspective camera
    fov: 50,
    znear: 1,
    zfar: 300,

    //space help lines
    addcoord: true,
    addgrid: false,
    addground: true,
};


//initialize space help lines
var line,
    xcoordin,ycoordin,zcoordin,
    xarrow, yarrow, zarrow;
var ground;

init();
animate();
render();

//initialization
function init(){

    var container = document.createElement( 'div' );
    document.body.appendChild( container );

    //initialization of scene and all objects
    initScene();
    initLight();
    initObject();
    initGround();
    initGrid();
    initCoordinate();
    initRender();
    initControls();
    initGui();

}

/* ====================================================================================================================
*   
*        the detailed initialization of scene, light, camera, render, control, gui, object and help lines
*
*  ====================================================================================================================
* */
function initScene(){
    scene = new THREE.Scene();

    //small window camera
    camera=new THREE.OrthographicCamera(
        frustumSize * aspect /  -2,  frustumSize * aspect / 2,
        frustumSize / 2, frustumSize / - 2,
        -100000, 100000
    );
    //camera=new THREE.PerspectiveCamera(50, aspect, 1,8000);
    camera.position.set(0,0,-250);
    camera.lookAt(0,0,0);

    //two cameras and helpers for the large window
    cameraOrtho = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2,  frustumSize * aspect / 2,
        frustumSize / 2, frustumSize / - 2,
        -200 , 200
    );
    cameraOrtho.position.set(40,35,90);
    cameraOHelper= new THREE.CameraHelper(cameraOrtho);
    scene.add(cameraOHelper);

    cameraPersp = new THREE.PerspectiveCamera( 50, aspect, 1, 300 );
    cameraPersp.position.set(40,35,130);
    cameraPHelper=new THREE.CameraHelper(cameraPersp);
    scene.add(cameraPHelper);
    cameraPHelper.visible=false;

    cameraRig=new THREE.Group();

    cameraRig.add(cameraOrtho);
    cameraRig.add(cameraPersp);

    scene.add(cameraRig);

    //the camera in use
    activeCamera=cameraOrtho;
    activeHelper=cameraOHelper;

}

function initLight(){
    //ambient light initialization
    ambientLight=new THREE.AmbientLight();
    ambientLight.color.setRGB(0.2,0.2,0.2);
    ambientLight.visible=true;
    scene.add( ambientLight );

    //directional light initialization
    var dist=200;
    directionColor=0xf0f0f0;
    direction_light=new THREE.DirectionalLight(directionColor, 0.55);
    direction_light.visible=true;
    direction_light.castShadow = true;
    direction_light.shadow.camera.near = -dist;
    direction_light.shadow.camera.far = dist;
    direction_light.shadow.camera.right = dist;
    direction_light.shadow.camera.left = - dist;
    direction_light.shadow.camera.top	=dist;
    direction_light.shadow.camera.bottom = - dist;
    direction_light.shadow.mapSize.width = 2048;
    direction_light.shadow.mapSize.height = 2048;
    direction_light.position.set(10,90,-10);
    direction_light.lookAt(scene.position);
    scene.add(direction_light);

    //directional light helper initialization
    arrowDirection.subVectors( scene.position, direction_light.position ).normalize();
    arrowPosition1.copy( direction_light.position );
    arrowHelper1 = new THREE.ArrowHelper( arrowDirection, arrowPosition1, 30, directionColor, 2.5, 0.8 );
    scene.add( arrowHelper1 );
    arrowHelper1.visible=false;

    arrowPosition2.copy( direction_light.position ).add( new THREE.Vector3( 0, 10, 0 ) );
    arrowHelper2 = new THREE.ArrowHelper( arrowDirection, arrowPosition2, 30, directionColor, 2.5, 0.8 );
    scene.add( arrowHelper2 );
    arrowHelper2.visible=false;

    arrowPosition3.copy( direction_light.position ).add( new THREE.Vector3( 0, - 10, 0 ) );
    arrowHelper3 = new THREE.ArrowHelper( arrowDirection, arrowPosition3, 30, directionColor, 2.5, 0.8 );
    scene.add( arrowHelper3 );
    arrowHelper3.visible=false;

    //point light initialization
    sphere = new THREE.SphereGeometry( 1, 8, 8 );
    point_light = new THREE.PointLight( pointLightColor,1.5, 300  );
    pointMaterial= new THREE.MeshBasicMaterial( { color: pointLightColor } );
    pointRep=new THREE.Mesh( sphere,pointMaterial);
    point_light.add(pointRep);
    point_light.position.set( 0, 30, 10 );
    point_light.castShadow=true;
    point_light.shadow.mapSize.width=2048;
    point_light.shadow.mapSize.height=2048;
    point_light.visible=false;
    scene.add( point_light );

    //spot light initialization
    sphere1 = new THREE.SphereGeometry( 1.5, 12, 12 );
    spot_light=new THREE.SpotLight(0xffff00,2,300,0.79,0.05,1);
    spotMaterial=new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    spot_light.add(new THREE.Mesh(sphere1,spotMaterial));
    spot_light.target.position.set(0,0,0);
    spot_light.position.set(10,20,-10);
    spot_light.visible=false;
    spot_light.castShadow=true;
    spot_light.shadow.mapSize.width=1024;
    spot_light.shadow.mapSize.height=1024;
    spot_light.shadow.camera.near=1;
    spot_light.shadow.camera.far=200;
    scene.add(spot_light);
    scene.add(spot_light.target);
    //spot light helper initialization
    spotHelper=new THREE.SpotLightHelper(spot_light);
    spotHelper.visible=false;
    scene.add(spotHelper);

}

function initObject(){
    //material color initialization
    var materialColor = new THREE.Color();
    materialColor.setRGB( 0.650, 0.141, 0.149 );
    materialColor.multiplyScalar(0.8);

    //wire material initialization
    wireMaterial=new THREE.MeshBasicMaterial({
        color: materialColor,
        wireframe: true
    });

    //flat material initialization
    flatMaterial=new THREE.MeshPhongMaterial({
        color: materialColor,
        specular: 0x0,
        shading: THREE.FlatShading,
        side: THREE.DoubleSide
    });

    //shiny material initialization
    glossyMaterial = new THREE.MeshPhongMaterial( {
        color: materialColor,
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide ,
        transparent:true,
        opacity:1.0 ,
        depthTest:true,
        depthWrite: true
    } );
    glossyMaterial.shininess=100;

    /*texture material initialization
     * three types:
     * cube material for cube, cylinder, pyramid
     * torus material for tours
     * ball material for sphere
     * */
    var textureLoader = new THREE.TextureLoader();

    //torus material
    torusMat = new THREE.MeshStandardMaterial( {
        bumpScale: - 0.05,
        color: 0xffffff,
        metalness: 0.2,
        roughness: 0.7,
        shading: THREE.SmoothShading,
        premultipliedAlpha: true,
        transparent: true
    } );

    textureLoader.load( "brick_diffuse.jpg", function( map ) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 9, 0.5 );
        torusMat.map = map;
        torusMat.needsUpdate = true;
    } );
    textureLoader.load( "brick_bump.jpg", function( map ) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 9, 0.5 );
        torusMat.bumpMap = map;
        torusMat.needsUpdate = true;
    } );

    //cube material
    cubeMat = new THREE.MeshStandardMaterial( {
        roughness: 0.7,
        color: 0xffffff,
        bumpScale: 0.002,
        metalness: 0.2
    });

    textureLoader.load( "brick_diffuse.jpg", function( map ) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 1, 1 );
        cubeMat.map = map;
        cubeMat.needsUpdate = true;
    } );
    textureLoader.load( "brick_bump.jpg", function( map ) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 1, 1 );
        cubeMat.bumpMap = map;
        cubeMat.needsUpdate = true;
    } );

    //ball material
    ballMat = new THREE.MeshStandardMaterial( {
        color: 0xffffff,
        roughness: 0.5,
        metalness: 1.0
    });

    textureLoader.load( "earth_atmos_2048.jpg", function( map ) {
        map.anisotropy = 4;
        ballMat.map = map;
        ballMat.needsUpdate = true;
    } );
    textureLoader.load( "earth_specular_2048.jpg", function( map ) {
        map.anisotropy = 4;
        ballMat.metalnessMap = map;
        ballMat.needsUpdate = true;
    } );

    //current material initialization
    objectMaterial=glossyMaterial;

    //object geometry initialization
    objectGeometry=new THREE.BoxGeometry(15,15,15);

    //object initialization
    object = new THREE.Mesh( objectGeometry, objectMaterial );
    object.receiveShadow=true;
    object.castShadow=true;
    scene.add(object);

}

function initGrid(){
    /*grid*/
    // Grid
    var size = 70, step = 5;
    var gridGeometry = new THREE.Geometry();
    for ( var i = - size; i <= size; i += step ) {
        gridGeometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        gridGeometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

        gridGeometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        gridGeometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    }
    material = new THREE.LineBasicMaterial( { color: 0xd0d0d0, transparent:false, depthTest:true, depthWrite:true} );
    line = new THREE.LineSegments( gridGeometry, material );
    line.visible=false;
    scene.add( line );
}

function initCoordinate(){
    //coordinate material color
    var xMaterial=new THREE.MeshBasicMaterial({color: 0xd45c5c});
    var yMaterial=new THREE.MeshBasicMaterial({color: 0x38bd69});
    var zMaterial=new THREE.MeshBasicMaterial({color: 0x5ecfd2});

    //coordinate geometry
    var x1,x2,y1,y2,z1,z2;
    var xGeometry=new THREE.Geometry();
    var yGeometry=new THREE.Geometry();
    var zGeometry=new THREE.Geometry();
    x1=new THREE.Vector3(-len,0,0);
    x2=new THREE.Vector3(len,0,0);
    y1=new THREE.Vector3(0,-len,0);
    y2=new THREE.Vector3(0,len,0);
    z1=new THREE.Vector3(0,0,-len);
    z2=new THREE.Vector3(0,0,len);
    xGeometry.vertices.push(x1);
    xGeometry.vertices.push(x2);
    yGeometry.vertices.push(y1);
    yGeometry.vertices.push(y2);
    zGeometry.vertices.push(z1);
    zGeometry.vertices.push(z2);
    xcoordin=new THREE.LineSegments(xGeometry,xMaterial);
    xcoordin.visible=true;
    ycoordin=new THREE.LineSegments(yGeometry,yMaterial);
    ycoordin.visible=true;
    zcoordin=new THREE.LineSegments(zGeometry,zMaterial);
    zcoordin.visible=true;
    scene.add(xcoordin);
    scene.add(ycoordin);
    scene.add(zcoordin);

    var arrowGeometry=new THREE.ConeGeometry(0.7,2,10,10);

    xarrow = new THREE.Mesh(arrowGeometry,xMaterial);
    xarrow.position.x=len;
    xarrow.rotation.z=-1.55;

    yarrow = new THREE.Mesh(arrowGeometry,yMaterial);
    yarrow.position.y=len;

    zarrow = new THREE.Mesh(arrowGeometry,zMaterial);
    zarrow.position.z=len;
    zarrow.rotation.x=1.55;

    //add coordinate to screen
    xarrow.visible=true;
    yarrow.visible=true;
    zarrow.visible=true;
    scene.add(xarrow);
    scene.add(yarrow);
    scene.add(zarrow);

}

function initGround(){


    var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
    var groundMat = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        specular: 0x050505
    });
    groundMat.color.setHSL( 0.095, 1, 0.75 );

    ground = new THREE.Mesh( groundGeo, groundMat );
    ground.rotation.x = -Math.PI/2;
    ground.position.y = -50;
    ground.visible=true;
    scene.add( ground );

    ground.receiveShadow = true;

}

function initRender(){
    //renderer
    renderer = new THREE.WebGLRenderer({ antialias: true } );
    renderer.depthBuffer=true;
    renderer.setClearColor( 0x010101 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );//use to control the window size
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.autoClear=false;

    document.body.appendChild( renderer.domElement );

    //events
    window.addEventListener( 'resize', onWindowResize, false );

}

function initGui() {

    var h;

    //gui initialization
    gui = new dat.GUI({ autoPlace: false });

    //gui position
    var customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    //save and create new settings
    gui.remember(effectController);

    //drop down menu for object type and texture change
    h=gui.add(effectController,"objectType",["cube","sphere","cylinder","pyramid","torus"]).name("object type").onChange(changeObject);
    h=gui.add(effectController,"objectTexture", ["wire","flat", "shiny","texture"]).name("object texture").onChange(changeTexture);

    //object material control
    h = gui.addFolder("Material control");
    h.add(effectController, "mdiffuse", 0.0,1.0,0.8).name("diffuse strength").onChange(changeMaterialColor);
    h.add(effectController, "mspecular", 0.0,1.0,0.6).name("specular strength").onChange(changeMaterialColor);
    h.add(effectController, "mshin", 0,300,100).name("shininess").onChange(changeShininess);
    h.add(effectController, "metallic").name("metallic").onChange(changeMaterialColor);
    h.add(effectController, "mred", 0.0,1.0,0.650).name("red").onChange(changeMaterialColor);
    h.add(effectController, "mgreen", 0.0,1.0,0.141).name("green").onChange(changeMaterialColor);
    h.add(effectController, "mblue",0.0,1.0,0.149).name("blue").onChange(changeMaterialColor);

    //ambient light is a small white light
    h=gui.add(effectController,"ambientLight").name("ambient light").onChange(addAmbient);

    //directional light control
    h=gui.addFolder("Directional Light control");
    h.add(effectController, "directionLight").name("turn on it").onChange(addDirectionLight);
    h.add(effectController, "dintensity", 0.00,1.00,0.55).name("intensity").onChange(directionalIntensity);
    h.add(effectController, "dline").name("help line").onChange(directionHelper);

    //point light control
    h =gui.addFolder("Point Light control");
    h.add(effectController,"pointLight").name("turn on it").onChange(addPoint);
    h.add(effectController, "px", -movelen,movelen,0).name("move x").onChange(changePointPx);
    h.add(effectController, "py", -movelen,movelen,30).name("move y").onChange(changePointPy);
    h.add(effectController, "pz", -movelen, movelen, 10).name("move z").onChange(changePointPz);
    h.add(effectController, "panimation").name("animation");
    h.add(effectController, "phue", 0.0,1.0,0.75).name("hue").onChange(changePointlightColor);
    h.add(effectController, "psaturation", 0.0,1.0,0.81).name("saturation").onChange(changePointlightColor);
    h.add(effectController, "plightness", 0.0,1.0,0.99).name("lightness").onChange(changePointlightColor);

    //spot light control
    h=gui.addFolder("Spotlight control");
    h.add(effectController,"spotLight").name("turn on it").onChange(addSpotlight);
    h.add(effectController, "spotx", -movelen,movelen,10.0).name("move x").onChange(changeSpotPx);
    h.add(effectController, "spoty", -movelen,movelen,20.0).name("move y").onChange(changeSpotPy);
    h.add(effectController, "spotz", -movelen,movelen,-10.0).name("move z").onChange(changeSpotPz);
    h.add(effectController, "sanimation").name("animation").onChange();
    h.add(effectController, "stargetx", -50.0,50.0,0.0).name("target x").onChange(changeSpotDirectionx);
    h.add(effectController, "stargety", -50.0,50.0,0.0).name("target y").onChange(changeSpotDirectiony);
    h.add(effectController, "stargetz", -50.0,50.0,0.0).name("target z").onChange(changeSpotDirectionz);
    h.addColor(effectController, "scolor").name("light color").onChange(changeSpotColor);
    h.add(effectController, "sangle", 0.00, 1.05, 0.79).name("angle").onChange(changeSpotAngle);
    h.add(effectController, "sline").name("help line").onChange(addHelpline);

    //object scaling control, for x, y, z coordinates
    h=gui.addFolder("Object Scailing");
    h.add(effectController, "sx", 0.0,5.0,1.0).name("x axis").onChange(objectScalex);
    h.add(effectController, "sy", 0.0,5.0,1.0).name("y axis").onChange(objectScaley);
    h.add(effectController, "sz", 0.0,5.0,1.0).name("z axis").onChange(objectScalez);

    //object rotation control, for x, y, z coordinates
    h=gui.addFolder("Object Rotation");
    h.add(effectController, "rx", -3.3,3.3,0.001).name("x axis").onChange(objectRotationx);
    h.add(effectController, "ry", -3.3,3.3,0.001).name("y axis").onChange(objectRotationy);
    h.add(effectController, "rz", -3.3,3.3,0.001).name("z axis").onChange(objectRotationz);

    //object translation control, for x, y, z coordinates
    h=gui.addFolder("Object Translation");
    h.add(effectController, "tx", -movelen,movelen,0.0).name("x axis").onChange(objectMovex);
    h.add(effectController, "ty", -movelen,movelen,0.0).name("y axis").onChange(objectMovey);
    h.add(effectController, "tz", -movelen,movelen,0.0).name("z axis").onChange(objectMovez);

    //change camera type
    h=gui.add(effectController, "cameraType",["orthogonal", "perspective"]).name("camera type").onChange(changeCamera);

    //orthogonal camera settings
    h=gui.addFolder("Orthogonal Camera");
    h.add(effectController, "left", -300,-1,-75).name("left").onChange(changeLeft);
    h.add(effectController, "right", 1,300,75).name("right").onChange(changeRight);
    h.add(effectController, "top", 1,150,75 ).name("top").onChange(changeTop);
    h.add(effectController, "bottom",-150,-1,-75).name("bottom").onChange(changeBottom);
    h.add(effectController, "near", -400,-1,-200).name("near").onChange(changeNear);
    h.add(effectController, "far", 1,400,200).name("far").onChange(changeFar);

    //perspective camera settings
    h=gui.addFolder("Perspective Camera");
    h.add(effectController, "fov", 1,90,50).name("field of viewing").onChange(changeFov);
    h.add(effectController, "znear", 1,200,1).name("near").onChange(changeNearPersp);
    h.add(effectController, "zfar", 100, 600, 300).name("far").onChange(changeFarPersp);

    //space help lines control
    h=gui.add(effectController, "addcoord").name("add coordinate").onChange(addCoordinate);
    h=gui.add(effectController, "addgrid").name("add grid").onChange(addGrid);
    h=gui.add(effectController, "addground").name("add ground").onChange(addGround);

}


function initControls(){
    //camera controls
    cameraControlO = new THREE.OrbitControls(cameraOrtho, renderer.domElement );
    cameraControlO.enableZoom=true;
    cameraControlO.target.set( 0, 0, 0 );
    cameraControlP = new THREE.OrbitControls(cameraPersp, renderer.domElement );
    cameraControlP.target.set( 0, 0, 0 );
    cameraControlP.enableZoom=true;
}

/* ====================================================================================================================
 *   
 *                                          the end of detailed initialization
 *
 *  ====================================================================================================================
 * */

//animation settings
function animate(){

    //refresh the screen
    requestAnimationFrame(animate);

    //use time instead of a loop
    var time = Date.now() * 0.001;

    //point light animation
    if(effectController.panimation==true){
        point_light.position.x = Math.sin( time * 0.7 ) * 50;
        point_light.position.y = Math.cos( time * 0.5 ) * 60;
        point_light.position.z = Math.cos( time * 0.3 ) * 50;
    }

    //spot light animation
    if(effectController.sanimation==true){
        spot_light.position.x = Math.cos( time * 0.4 ) * 55;
        spot_light.position.y = Math.sin( time * 0.6 ) * 65;
        spot_light.position.z = Math.sin( time * 0.9 ) * 55;
    }

}

//render of the scene
function render() {

    //refresh the screen
    requestAnimationFrame( render );

    //update spot helper
    spotHelper.update();

    //update camera and control the camera helper visibility
    if ( activeCamera === cameraPersp ) {
        cameraPersp.updateProjectionMatrix();

        cameraPHelper.update();
        cameraPHelper.visible = true;

        cameraOHelper.visible = false;

    } else {
        cameraOrtho.updateProjectionMatrix();

        cameraOHelper.update();
        cameraOHelper.visible = true;

        cameraPHelper.visible = false;

    }

    //camera focus
    cameraRig.lookAt(scene.position);
    camera.lookAt(scene.position);

    //clear the screen
    renderer.clear();

    //main window
    activeHelper.visible=false;
    renderer.setViewport(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
    renderer.render(scene, activeCamera);

    //small observation window
    activeHelper.visible=true;
    renderer.setViewport( 3*SCREEN_WIDTH/4, 3*SCREEN_HEIGHT/4, SCREEN_WIDTH/4, SCREEN_HEIGHT/4);
    renderer.render(scene, camera);
}

// event handlers
function onWindowResize() {
    SCREEN_WIDTH=window.innerWidth;
    SCREEN_HEIGHT=window.innerHeight;
    aspect=SCREEN_WIDTH/SCREEN_HEIGHT;

    camera.updateProjectionMatrix();

    cameraOrtho.left =  frustumSize * aspect / - 2;
    cameraOrtho.right = frustumSize * aspect / 2;
    cameraOrtho.top = frustumSize / 2;
    cameraOrtho.bottom = frustumSize/- 2;
    cameraOrtho.updateProjectionMatrix();

    cameraPersp.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    cameraPersp.updateProjectionMatrix();//*/

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    render();

}

/* ====================================================================================================================
 *   
 *                                          the functions of controllers on gui
 *
 *  ====================================================================================================================
 * */
function changeShininess(){
    glossyMaterial.shininess=effectController.mshin;
}

function addAmbient(){
    ambientLight.visible=effectController.ambientLight;
}

function addDirectionLight(){
    direction_light.visible=effectController.directionLight;
}

function addPoint(){
    point_light.visible=effectController.pointLight;
}

function changeLeft(){
    cameraOrtho.left=effectController.left*aspect;
}

function changeRight(){
    cameraOrtho.right=effectController.right*aspect;
}

function changeTop(){
    cameraOrtho.top=effectController.top;
}

function changeBottom(){
    cameraOrtho.bottom=effectController.bottom;
}

function changeNear(){
    cameraOrtho.near=effectController.near;
}

function changeFar(){
    cameraOrtho.far=effectController.far;
}

function changeFov(){
    cameraPersp.fov=effectController.fov;
}

function changeNearPersp(){
    cameraPersp.near=effectController.znear;
}

function changeFarPersp(){
    cameraPersp.far=effectController.zfar;
}

function addCoordinate(){
    xcoordin.visible=effectController.addcoord;
    ycoordin.visible=effectController.addcoord;
    zcoordin.visible=effectController.addcoord;
    xarrow.visible=effectController.addcoord;
    yarrow.visible=effectController.addcoord;
    zarrow.visible=effectController.addcoord;
}

function addGrid(){
    line.visible=effectController.addgrid;
}

function addGround(){
    ground.visible=effectController.addground;
}

function changeCamera(){
    if (effectController.cameraType=="orthogonal"){
        activeCamera=cameraOrtho;
        activeHelper=cameraOHelper;
    }
    else {
        activeCamera=cameraPersp;
        activeHelper=cameraPHelper;
    }
}

function changeMaterialColor(){
    if ( effectController.metallic )
    {
        // make colors match to give a more metallic look
        specularColor.copy( diffuseColor );
    }
    else
    {
        // more of a plastic look
        specularColor.setRGB( 1, 1, 1 );
    }
    diffuseColor.setRGB(
                            effectController.mred,
                            effectController.mgreen,
                            effectController.mblue
    );
    diffuseColor.multiplyScalar(effectController.mdiffuse);
    specularColor.multiplyScalar(effectController.mspecular);
    wireMaterial.color.copy(diffuseColor);
    wireMaterial.depthTest=true;

    flatMaterial.color.copy(diffuseColor);

    glossyMaterial.color.copy( diffuseColor );
    glossyMaterial.specular.copy(specularColor);
    glossyMaterial.depthTest=true;

}

function changePointPx(){
    point_light.position.x=effectController.px;
}

function changePointPy(){
    point_light.position.y=effectController.py;
}

function changePointPz(){
    point_light.position.z=effectController.pz;
}

function changePointlightColor(){

    point_light.color.setHSL(
                                effectController.phue,
                                effectController.psaturation,
                                effectController.plightness
    );
    pointMaterial.color.copy(point_light.color);
}

function changeSpotPx(){
    spot_light.position.x=effectController.spotx;
}
function changeSpotPy(){
    spot_light.position.y=effectController.spoty;
}
function changeSpotPz(){
    spot_light.position.z=effectController.spotz;
}

function changeSpotDirectionx(){
    spot_light.target.position.x=effectController.stargetx;
}

function changeSpotDirectiony(){
    spot_light.target.position.y=effectController.stargety;
}

function changeSpotDirectionz(){
    spot_light.target.position.z=effectController.stargetz;
}

function changeSpotColor(){

    spot_light.color.setHex(effectController.scolor);
    spotMaterial.color.copy(spot_light.color);
}

function changeSpotAngle() {
    spot_light.angle=effectController.sangle;
}

function objectScalex(){
    object.scale.x=effectController.sx;
}
function objectScaley(){
    object.scale.y=effectController.sy;
}
function objectScalez(){
    object.scale.z=effectController.sz;
}

function objectRotationx(){
    object.rotation.x=effectController.rx;
}
function objectRotationy(){
    object.rotation.y=effectController.ry;
}
function objectRotationz(){
    object.rotation.z=effectController.rz;
}

function objectMovex() {
    object.position.x=effectController.tx;
}
function objectMovey() {
    object.position.y=effectController.ty;
}
function objectMovez() {
    object.position.z=effectController.tz;
}

function directionalIntensity(){
    direction_light.intensity=effectController.dintensity;
}

function addHelpline(){
        spotHelper.visible=effectController.sline;
}

/*function changeViewing(){

    var currentView = document.getElementById('Type');
    if (currentView.checked === true){
        activeCamera=cameraOrtho;
        activeHelper=cameraOHelper;
    }
    else {
        activeCamera=cameraPersp;
        activeHelper=cameraPHelper;
    }
}//*/


function changeObject(){
    if ( object !== undefined ) {

        object.geometry.dispose();
        scene.remove( object );
    }//*/
    switch (effectController.objectType){
        case "cube":
            objectGeometry=new THREE.BoxGeometry(15,15,15);
            break;
        case "sphere":
            objectGeometry=new THREE.SphereGeometry(10,20,20);
            break;
        case "cylinder":
            objectGeometry=new THREE.CylinderGeometry(10,10,25,20,20);
            break;
        case "pyramid":
            objectGeometry=new THREE.CylinderGeometry(0,15,15,4);
            break;
        case "torus":
            objectGeometry = new THREE.TorusKnotGeometry( 10, 3, 75, 20 );
            break;
    }
    if (effectController.objectTexture!=="texture"){

    }
    else if (effectController.objectType==="sphere"){
        textureMaterial=ballMat;
        objectMaterial=textureMaterial;
    }
    else if(effectController.objectType==="torus") {
        textureMaterial=torusMat;
        objectMaterial=textureMaterial;
    }

    else {
        textureMaterial=cubeMat;
        objectMaterial=textureMaterial;
    }

    /*else if(effectController.objectType!="sphere"&&effectController.objectType!="torus"){
        textureMaterial=cubeMat;
        objectMaterial=textureMaterial;
    }*/

    //not a very good method, may require more memory than needed.
    object = new THREE.Mesh( objectGeometry, objectMaterial );
    object.receiveShadow=true;
    object.castShadow=true;
    objectScalex();
    objectScaley();
    objectScalez();
    objectRotationx();
    objectRotationy();
    objectRotationz();
    objectMovex();
    objectMovey();
    objectMovez();
    scene.add(object);
}

function changeTexture() {
    if ( object !== undefined ) {

        object.material.dispose();
        scene.remove( object );
    }//*/
    switch (effectController.objectTexture){
        case "wire":
            objectMaterial=wireMaterial;
            break;
        case "flat":
            objectMaterial=flatMaterial;
            break;
        case "shiny":
            objectMaterial=glossyMaterial;
            break;
        case "texture":
            if (effectController.objectType==="sphere"){
                textureMaterial=ballMat;
            }
            else if(effectController.objectType==="torus"){
                textureMaterial=torusMat;
            }
            else{
                textureMaterial=cubeMat;
            }
            objectMaterial=textureMaterial;
            break;
    }
    object=new THREE.Mesh(objectGeometry, objectMaterial);
    object.receiveShadow=true;
    object.castShadow=true;
    objectScalex();
    objectScaley();
    objectScalez();
    objectRotationx();
    objectRotationy();
    objectRotationz();
    objectMovex();
    objectMovey();
    objectMovez();
    scene.add(object);
}

function addSpotlight(){

    spot_light.visible=effectController.spotLight;

}

function directionHelper(){
    arrowHelper1.visible=effectController.dline;
    arrowHelper2.visible=effectController.dline;
    arrowHelper3.visible=effectController.dline;
}

/* ====================================================================================================================
 *   
 *                                         the end of functions of controllers on gui
 *
 *  ====================================================================================================================
 * */


