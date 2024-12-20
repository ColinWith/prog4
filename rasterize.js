/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const INPUT_PROG_URL = "https://ncsucgclass.github.io/prog4/";
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog4/triangles.json"; // triangles file loc
const INPUT_ELLIPSOIDS_URL = "https://ncsucgclass.github.io/prog4/ellipsoids.json"; // ellipsoids file loc
//const INPUT_ELLIPSOIDS_URL = null; // ellipsoids file loc
const INPUT_DEFAULT_BACKGROUND_URL = "https://ncsucgclass.github.io/prog4/sky.jpg";
var defaultEye = vec3.fromValues(0.5, 0.5, -0.5); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
var lightPosition = vec3.fromValues(-0.5,1.5,-0.5); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press

/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var sortedInputTriangles = []; // the order of inputTriangle indexes to render
var numTriangleSets = 0; // how many triangle sets in input scene
var inputEllipsoids = []; // the ellipsoid data as loaded from input files
var numEllipsoids = 0; // how many ellipsoids in the input scene
var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var normalBuffers = []; // this contains normal component lists by set, in triples
var uvBuffers = []; // this contains UVcoord component lists by set, in triples
var textures = []; // list of textures
var numTextures = 0;
var numOpaqueObjects = 0;
var numTransparentObjects = 0;
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
var viewDelta = 0; // how much to displace view with each key press

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var vNormAttribLoc; // where to put normal for vertex shader
var vUVAttribLoc; // where to put texture for fragment shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader
var alphaULoc; // where to put alpha value for fragment shader
var textureIDULoc; // where to put textureID value for fragment shader
var hasTextureULoc; // where to put whether or not the fragment shader should load a texture
var modulateTexULoc; // where to put whether or not the fragment shader should blend texture colors with lighting

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space

var showTriangles = true;
var showEllispoids = false;
var enableBackFaceCull = true;

var toggleBlendingLightingMode = true;

/* custom content */
var customInputTriangles = [
    {
        "material": { "ambient": [0.11, 0.1, 0.15], "diffuse": [0.8, 0.8, 0.55], "specular": [0.35, 0.35, 0.35], "n": 5, "alpha": 0.9, "texture": "abe.png" },
        "vertices": [
            [
                0.6316648721694946,
                0.299999862909317,
                1.8909039497375488
            ],
            [
                0.8309038281440735,
                0.299999862909317,
                1.9083350896835327
            ],
            [
                0.6490960121154785,
                0.2999998927116394,
                1.6916650533676147
            ],
            [
                0.8483349680900574,
                0.2999998927116394,
                1.7090961933135986
            ],
            [
                0.619096040725708,
                0.7739999294281006,
                1.6916650533676147
            ],
            [
                0.6016649007797241,
                0.7739999294281006,
                1.8909039497375488
            ],
            [
                0.800903856754303,
                0.7799999713897705,
                1.9083350896835327
            ],
            [
                0.8183349967002869,
                0.7799999713897705,
                1.7090961933135986
            ]
        ],
        "normals": [
            [
                -0.6192616820335388,
                -0.583055853843689,
                0.5258904099464417
            ],
            [
                0.5312904715538025,
                -0.5725359320640564,
                0.6244460344314575
            ],
            [
                -0.5182667374610901,
                -0.5821221470832825,
                -0.6265248656272888
            ],
            [
                0.6315568685531616,
                -0.5716339945793152,
                -0.5238039493560791
            ],
            [
                -0.5366640090942383,
                0.5667383074760437,
                -0.6251394748687744
            ],
            [
                -0.6384972929954529,
                0.5620135068893433,
                0.5257965922355652
            ],
            [
                0.5122542381286621,
                0.5888921022415161,
                0.6251412630081177
            ],
            [
                0.6139161586761475,
                0.5892212390899658,
                -0.5252858996391296
            ]
        ],
        "uvs": [[1, 0], [0, 1], [0, 0], [1, 1], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0]],
        "triangles": [
            [2,1,0], [5,7,4],
            [1,7,6], [0,4,2], 
            [2,7,3], [0,6,5],
            [2,3,1], [5,6,7],
            [1,3,7], [0,5,4],
            [2,4,7], [0,1,6]
        ]
    },
    {
        "material": { "ambient": [0.11, 0.1, 0.15], "diffuse": [0.8, 0.8, 0.6], "specular": [0.35, 0.35, 0.35], "n": 5, "alpha": 1.0, "texture": "billie.jpg" },
        "vertices": [
            [
                0.6316648721694946,
                0.2999999225139618,
                1.290903925895691
            ],
            [
                0.8309038281440735,
                0.2999999225139618,
                1.3083350658416748
            ],
            [
                0.6490960121154785,
                0.2999999225139618,
                1.0916650295257568
            ],
            [
                0.8483349680900574,
                0.2999999225139618,
                1.1090961694717407
            ],
            [
                0.6290960311889648,
                0.7829999923706055,
                1.0916650295257568
            ],
            [
                0.611664891242981,
                0.7829999327659607,
                1.290903925895691
            ],
            [
                0.8109038472175598,
                0.7859999537467957,
                1.3083350658416748
            ],
            [
                0.8283349871635437,
                0.7860000133514404,
                1.1090961694717407
            ]
        ],
        "normals": [
            [
                -0.6126802563667297,
                -0.5889710783958435,
                0.5270065665245056
            ],
            [
                0.5380591750144958,
                -0.5673518776893616,
                0.6233811974525452
            ],
            [
                -0.5113211274147034,
                -0.5870319604873657,
                -0.62764972448349
            ],
            [
                0.6379168033599854,
                -0.5655244588851929,
                -0.5227276682853699
            ],
            [
                -0.5419034361839294,
                0.562480628490448,
                -0.6244646906852722
            ],
            [
                -0.6418756246566772,
                0.5606289505958557,
                0.5231546759605408
            ],
            [
                0.5074630975723267,
                0.591605007648468,
                0.6264859437942505
            ],
            [
                0.6086695194244385,
                0.5935331583023071,
                -0.52653568983078
            ]
        ],
        "uvs": [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0]],
        "triangles": [
            [1,7,6], [0,4,2], 
            [2,7,3], [0,6,5],
            [2,3,1], [5,6,7],
            [1,3,7], [0,5,4],
            [2,4,7], [0,1,6],
            [2,1,0], [5,7,4]
        ]
    },
    {
        "material": { "ambient": [0.11, 0.1, 0.15], "diffuse": [0.8, 0.8, 0.65], "specular": [0.35, 0.35, 0.35], "n": 15, "alpha": 1.0, "texture": "retro.jpg" },
        "vertices": [
            [
                0.6316648721694946,
                0.2999999523162842,
                0.690903902053833
            ],
            [
                0.8309038281440735,
                0.2999999523162842,
                0.7083350419998169
            ],
            [
                0.6490960121154785,
                0.29999998211860657,
                0.49166497588157654
            ],
            [
                0.8483349680900574,
                0.29999998211860657,
                0.509096086025238
            ],
            [
                0.6390960216522217,
                0.796000063419342,
                0.4916650056838989
            ],
            [
                0.6216648817062378,
                0.7950000762939453,
                0.6909039616584778
            ],
            [
                0.8209038376808167,
                0.800000011920929,
                0.7083351016044617
            ],
            [
                0.8383349776268005,
                0.800000011920929,
                0.5090961456298828
            ]
        ],
        "normals": [
            [
                -0.6058259606361389,
                -0.5949795246124268,
                0.5281801223754883
            ],
            [
                0.5448213815689087,
                -0.5620293021202087,
                0.622328519821167
            ],
            [
                -0.5041182637214661,
                -0.5919867157936096,
                -0.6288213729858398
            ],
            [
                0.6442514657974243,
                -0.5592983961105347,
                -0.5216562747955322
            ],
            [
                -0.5524780750274658,
                0.5521148443222046,
                -0.6244495511054993
            ],
            [
                -0.6521128416061401,
                0.549311637878418,
                0.5224993228912354
            ],
            [
                0.49638524651527405,
                0.6009581089019775,
                0.6264590620994568
            ],
            [
                0.5977723598480225,
                0.6039150357246399,
                -0.5272141098976135
            ]
        ],
        "uvs": [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 1], [1, 1], [1, 0]],
        "triangles": [
            [2,1,0], [5,7,4],
            [1,7,6], [0,4,2], 
            [2,7,3], [0,6,5],
            [2,3,1], [5,6,7],
            [1,3,7], [0,5,4],
            [2,4,7], [0,1,6]
        ]
    },
    {
        "material": { "ambient": [0.12, 0.2, 0.05], "diffuse": [0.25, 0.4, 0.06], "specular": [0.35, 0.45, 0.65], "n": 5, "alpha": 1.0, "texture": "leaf.small.png" },
        "vertices": [
            [-1.9959999322891235,0.30166882276535034,-0.33097726106643677],
            [-1.9959999322891235, 0.3259684145450592, 3.643077850341797],
            [3.047999858856201, 0.3459685146808624, 3.643078088760376],
            [2.997999906539917, 0.29166892170906067, -0.33097726106643677]
            
        ],
        "normals": [[0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]],
        "uvs": [[1, 1],[1, 0], [0, 0], [0, 1]],
        "triangles": [[0, 1, 2], [2, 3, 0]]
    },
    {
        "material": { "ambient": [0.1, 0.1, 0.15], "diffuse": [0.1, 0.3, 0.0], "specular": [1, 1, 1], "n": 5, "alpha": 0.9, "texture": "tree.png" },
        "vertices": [
            [0.0, 0.32, 2.2], [0.0, 0.57, 2.2], [0.25, 0.57, 2.2], [0.25, 0.32, 2.2]
        ],
        "normals": [[0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]],
        "uvs": [[0, 0], [0, 1], [1, 1], [1, 0]],
        "triangles": [[0, 1, 2], [2, 3, 0]]
    }
]; // the custom triangle data as loaded from input files
var useCustomInput = false;

// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input json file

/**
 * translate given model
 * @param {any} model to translate
 * @param {any} offset to translate by
 */
function translateModel(model, offset) {
    //if (handleKeyDown.modelOn != null)
    if (model != null)
        vec3.add(model.translation, model.translation, offset);
} // end translate model

/** 
 * rotate given model
 * @param {any} model to rotate
 * @param {any} axis to rotate around
 * @param {any} direction to rotate in
 */
function rotateModel(model, axis, direction) {
    if (model != null) {
        var newRotation = mat4.create();

        mat4.fromRotation(newRotation, direction * rotateTheta, axis); // get a rotation matrix around passed axis
        vec3.transformMat4(model.xAxis, model.xAxis, newRotation); // rotate model x axis tip
        vec3.transformMat4(model.yAxis, model.yAxis, newRotation); // rotate model y axis tip
    } // end if there is a highlighted model
} // end rotate model

// does stuff when keys are pressed
function handleKeyDown(event) {
    
    const modelEnum = {TRIANGLES: "triangles", ELLIPSOID: "ellipsoid"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction

    // cycle through models, highlighting the selected one
    function highlightModel(modelType,whichModel) {
        if (handleKeyDown.modelOn != null)
            handleKeyDown.modelOn.on = false;
        handleKeyDown.whichOn = whichModel;
        if (modelType == modelEnum.TRIANGLES)
            handleKeyDown.modelOn = inputTriangles[whichModel]; 
        else
            handleKeyDown.modelOn = inputEllipsoids[whichModel]; 
        handleKeyDown.modelOn.on = true; 
    } // end highlight model
    
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    
    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {
        
        // model selection
        case "Space": 
            if (handleKeyDown.modelOn != null) {
                handleKeyDown.modelOn.on = false; // turn off highlighted model
                handleKeyDown.modelOn = null; // no highlighted model
                handleKeyDown.whichOn = -1; // nothing highlighted
            }
            break;
        case "ArrowRight": // select next triangle set
            highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn+1) % numTriangleSets);
            break;
        case "ArrowLeft": // select previous triangle set
            highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : numTriangleSets-1);
            break;
        case "ArrowUp": // select next ellipsoid
            highlightModel(modelEnum.ELLIPSOID,(handleKeyDown.whichOn+1) % numEllipsoids);
            break;
        case "ArrowDown": // select previous ellipsoid
            highlightModel(modelEnum.ELLIPSOID,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : numEllipsoids-1);
            break;
            
        // view change
        // translates / rotates the Eye and Center vectors
        case "KeyA": // translate view left, rotate left with shift
            Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,-viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "KeyD": // translate view right, rotate right with shift
            Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,viewDelta));
            break;
        case "KeyS": // translate view backward, rotate up with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
                Up = vec3.cross(Up,viewRight,vec3.subtract(lookAt,Center,Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,-viewDelta));
            } // end if shift not pressed
            break;
        case "KeyW": // translate view forward, rotate down with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
                Up = vec3.cross(Up,viewRight,vec3.subtract(lookAt,Center,Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,viewDelta));
            } // end if shift not pressed
            break;
        case "KeyQ": // translate view up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,-viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
            } // end if shift not pressed
            break;
        case "KeyE": // translate view down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
            } // end if shift not pressed
            break;
        case "Escape": // reset view to default
            Eye = vec3.copy(Eye,defaultEye);
            Center = vec3.copy(Center,defaultCenter);
            Up = vec3.copy(Up,defaultUp);
            break;
        case "KeyB": // toggles the lighting & blending mode
            toggleBlendingLightingMode = !toggleBlendingLightingMode;
            break;
        case "Digit1": // toggle custom displa
            if (event.getModifierState("Shift")) {
                useCustomInput = !useCustomInput; // toggle custom mode
                loadModels(); // load in the models from tri fil
            }
            break;
            
        // model transformation
        case "KeyK": // translate left, rotate left with shift
            if (event.getModifierState("Shift"))
                rotateModel(handleKeyDown.modelOn, Up, dirEnum.NEGATIVE);
            else
                translateModel(handleKeyDown.modelOn, vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "Semicolon": // translate right, rotate right with shift
            if (event.getModifierState("Shift"))
                rotateModel(handleKeyDown.modelOn, Up, dirEnum.POSITIVE);
            else
                translateModel(handleKeyDown.modelOn, vec3.scale(temp,viewRight,viewDelta));
            break;
        case "KeyL": // translate backward, rotate up with shift
            if (event.getModifierState("Shift"))
                rotateModel(handleKeyDown.modelOn, viewRight, dirEnum.POSITIVE);
            else
                translateModel(handleKeyDown.modelOn, vec3.scale(temp,lookAt,-viewDelta));
            break;
        case "KeyO": // translate forward, rotate down with shift
            if (event.getModifierState("Shift"))
                rotateModel(handleKeyDown.modelOn, viewRight, dirEnum.NEGATIVE);
            else
                translateModel(handleKeyDown.modelOn, vec3.scale(temp,lookAt,viewDelta));
            break;
        case "KeyI": // translate up, rotate counterclockwise with shift 
            if (event.getModifierState("Shift"))
                rotateModel(handleKeyDown.modelOn, lookAt, dirEnum.POSITIVE);
            else
                translateModel(handleKeyDown.modelOn, vec3.scale(temp,Up,viewDelta));
            break;
        case "KeyP": // translate down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                rotateModel(handleKeyDown.modelOn, lookAt, dirEnum.NEGATIVE);
            else
                translateModel(handleKeyDown.modelOn, vec3.scale(temp,Up,-viewDelta));
            break;
        case "Backspace": // reset model transforms to default
            for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) {
                vec3.set(inputTriangles[whichTriSet].translation,0,0,0);
                vec3.set(inputTriangles[whichTriSet].xAxis,1,0,0);
                vec3.set(inputTriangles[whichTriSet].yAxis,0,1,0);
            } // end for all triangle sets
            for (var whichEllipsoid=0; whichEllipsoid<numEllipsoids; whichEllipsoid++) {
                vec3.set(inputEllipsoids[whichEllipsoid].translation,0,0,0);
                vec3.set(inputEllipsoids[whichTriSet].xAxis,1,0,0);
                vec3.set(inputEllipsoids[whichTriSet].yAxis,0,1,0);
            } // end for all ellipsoids
            break;
    } // end switch
} // end handleKeyDown

// set up the webGL environment
function setupWebGL() {
    
    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed


    var imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
      var cw = imageCanvas.width, ch = imageCanvas.height; 
      imageContext = imageCanvas.getContext("2d"); 
    //  var bkgdImage = new Image(); 
    //  bkgdImage.crossOrigin = "Anonymous";
    //  bkgdImage.src = INPUT_DEFAULT_BACKGROUND_URL;
    //  bkgdImage.onload = function(){
    //      var iw = bkgdImage.width, ih = bkgdImage.height;
    //      imageContext.drawImage(bkgdImage,0,0,iw,ih,0,0,cw,ch);   
    // }

     
    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
        if (gl == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            //gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
            gl.clearDepth(1.0); // use max when we clear the depth buffer
            gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
            gl.enable(gl.BLEND); // enable blending
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            if (enableBackFaceCull) {
                gl.enable(gl.CULL_FACE); // use face culling
                gl.cullFace(gl.BACK); // cull back facing polygons
            }
        }
    } // end tr
    catch(e) {
        console.log(e);
    } // end catch

    loadImage(INPUT_DEFAULT_BACKGROUND_URL, true); // load background image

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true) //flip textures on y

} // end setupWebGL

/**
 * 
 * uses code from: https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
 * @param {any} img image
 * @param {any} url string texture file path
 */
function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        img.crossOrigin = "Anonymous"; // ask for CORS (Cross Origin Resource Sharing) permission
        // "anonymous" = ask for permission but don't send extra info
    }
}

/**
 * Loads image at given url and returns a textureInfo object for it
 * uses code from: https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
 * @param {any} url string texture file path
 * @param {bool} isBackGround
 * @returns textureInfo {width, height, texture, id}
 */
function loadImage(url, isBackGround) {
    try {
        if (url == String.null) {
            throw "Unable to load image file!";
        }
        else {
            ////check if this texture is already loaded
            //for (var whichTex = 0; whichTex < textures.length; whichTex++) {
            //    if (textures[whichTex].path == url) {
            //        return whichTex;
            //    }
            //}

            const tex = gl.createTexture();
            var texID = (numTextures);
            numTextures++; // increment number of textures

            // texture storage
            gl.activeTexture(gl.TEXTURE0 + texID);
            gl.bindTexture(gl.TEXTURE_2D, tex);

            gl.bindTexture(gl.TEXTURE_2D, tex);
            // Fill the texture with a 1x1 blue pixel
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));

            const img = new Image();

            //// texture wrapping & filtering
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            var textureInfo = {
                path: url,
                id: texID,
                width: 1,   // we don't know the size until it loads
                height: 1,
                texture: tex
            };

            var imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
            var cw = imageCanvas.width, ch = imageCanvas.height;
            imageContext = imageCanvas.getContext("2d");
            img.onload = function () {
                textureInfo.width = img.width;
                textureInfo.height = img.height;

                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

                // Check if dimentions are a power of 2
                if (img.width % 2 == 1 && img.height % 2 == 1) {
                    // generate Mipmap for texture
                    gl.generateMipmap(gl.TEXTURE_2D);
                }
                else {
                    // texture wrapping & filtering
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }

                if (isBackGround) {
                    imageContext.drawImage(img, 0, 0, textureInfo.width, textureInfo.height, 0, 0, cw, ch);
                }

            };
            requestCORSIfNotSameOrigin(img, url);
            img.src = url;
            textureInfo.image = img;

            // add texture to texture list
            textures.push(textureInfo);
            //console.log("path: " + url + ", texture: " + textureInfo.texture + ", id: " + textureInfo.id);

            return textureInfo;
        }
    } // end try
    catch (e) {
        console.log(e);
    } // end catch
}

function compareTriSetAlpha(a, b) {
    return b.material.alpha - a.material.alpha;
    
}
function compareEllipsoidAlpha(a, b) {
    return b.alpha - a.alpha;

}

function compareTriZDepth(a, b) {
    var temp = vec3.create(); // an intermediate vec3
    if (a.material.alpha == 1.0 || b.material.alpha == 1.0) { // ingore opaque comparisons
        return 0;
    }
    else {
        // compare distances
        var aDistance = vec3.distance(Eye, vec3.add(temp, a.center, a.translation));
        var bDistance = vec3.distance(Eye, vec3.add(temp, b.center, b.translation));

        //console.log("test1: " + aDistance + " vs " + bDistance);
        return (bDistance - aDistance);
    }
}

function compareEllipsoidZDepth(a, b) {
    if (a.alpha == 1.0 || b.alpha == 1.0) { // ingore opaque comparisons
        return 0;
    }
    else {
        // compare distances
        var aDistance = vec3.create();
        var bDistance = vec3.create();
        var temp = vec3.create(); // an intermediate vec3
        aDistance = vec3.distance(Eye, vec3.add(temp, a.center, a.translation));
        bDistance = vec3.distance(Eye, vec3.add(temp, b.center, b.translation));

        //console.log("test1: " + aDistance + " vs " + bDistance);
        return (bDistance - aDistance);
    }
}

function getTriOrder(inputTris) {
    //for () {

    //}
}

/**
 * read models in, load them into webgl buffers
 */
function loadModels() {
    
    // make an ellipsoid, with numLongSteps longitudes.
    // start with a sphere of radius 1 at origin
    // Returns verts, tris and normals.
    function makeEllipsoid(currEllipsoid,numLongSteps) {
        
        try {
            if (numLongSteps % 2 != 0)
                throw "in makeSphere: uneven number of longitude steps!";
            else if (numLongSteps < 4)
                throw "in makeSphere: number of longitude steps too small!";
            else { // good number longitude steps
            
                //console.log("ellipsoid xyz: "+ ellipsoid.x +" "+ ellipsoid.y +" "+ ellipsoid.z);
                
                // make vertices
                var ellipsoidVertices = [0,-1,0]; // vertices to return, init to south pole
                var angleIncr = (Math.PI+Math.PI) / numLongSteps; // angular increment 
                var latLimitAngle = angleIncr * (Math.floor(numLongSteps/4)-1); // start/end lat angle
                var latRadius, latY; // radius and Y at current latitude
                for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle; latAngle+=angleIncr) {
                    latRadius = Math.cos(latAngle); // radius of current latitude
                    latY = Math.sin(latAngle); // height at current latitude
                    for (var longAngle=0; longAngle<2*Math.PI; longAngle+=angleIncr) // for each long
                        ellipsoidVertices.push(latRadius*Math.sin(longAngle),latY,latRadius*Math.cos(longAngle));
                } // end for each latitude
                ellipsoidVertices.push(0,1,0); // add north pole
                ellipsoidVertices = ellipsoidVertices.map(function(val,idx) { // position and scale ellipsoid
                    switch (idx % 3) {
                        case 0: // x
                            return(val*currEllipsoid.a+currEllipsoid.x);
                        case 1: // y
                            return(val*currEllipsoid.b+currEllipsoid.y);
                        case 2: // z
                            return(val*currEllipsoid.c+currEllipsoid.z);
                    } // end switch
                }); 

                // make normals using the ellipsoid gradient equation
                // resulting normals are unnormalized: we rely on shaders to normalize
                var ellipsoidNormals = ellipsoidVertices.slice(); // start with a copy of the transformed verts
                ellipsoidNormals = ellipsoidNormals.map(function(val,idx) { // calculate each normal
                    switch (idx % 3) {
                        case 0: // x
                            return(2/(currEllipsoid.a*currEllipsoid.a) * (val-currEllipsoid.x));
                        case 1: // y
                            return(2/(currEllipsoid.b*currEllipsoid.b) * (val-currEllipsoid.y));
                        case 2: // z
                            return(2/(currEllipsoid.c*currEllipsoid.c) * (val-currEllipsoid.z));
                    } // end switch
                }); 

                // make UVs
                var ellipsoidUVs = []; // empty list of ellipsoidUVs
                for (var idx = 0; idx < ellipsoidVertices.length; idx += 3) {
                    if (idx % 3 == 0) {
                        var temp = vec3.create();
                        var surfacePoint = vec3.fromValues(ellipsoidVertices[idx], ellipsoidVertices[idx + 1], ellipsoidVertices[idx + 2]);
                        var ellipsoidCenter = vec3.fromValues(currEllipsoid.x, currEllipsoid.y, currEllipsoid.z);
                        var n = vec3.normalize(temp, vec3.subtract(temp, surfacePoint, ellipsoidCenter));
                        var u = Math.atan2(n[0], n[2]) / (2 * Math.PI) + 0.5;
                        var v = n[1] * 0.5 + 0.5;
                        ellipsoidUVs.push(u, v);
                    }
                }
                
                // make triangles, from south pole to middle latitudes to north pole
                var ellipsoidTriangles = []; // triangles to return
                for (var whichLong=1; whichLong<numLongSteps; whichLong++) // south pole
                    ellipsoidTriangles.push(0,whichLong,whichLong+1);
                ellipsoidTriangles.push(0,numLongSteps,1); // longitude wrap tri
                var llVertex; // lower left vertex in the current quad
                for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
                    for (var whichLong=0; whichLong<numLongSteps-1; whichLong++) {
                        llVertex = whichLat*numLongSteps + whichLong + 1;
                        ellipsoidTriangles.push(llVertex,llVertex+numLongSteps,llVertex+numLongSteps+1);
                        ellipsoidTriangles.push(llVertex,llVertex+numLongSteps+1,llVertex+1);
                    } // end for each longitude
                    ellipsoidTriangles.push(llVertex+1,llVertex+numLongSteps+1,llVertex+2);
                    ellipsoidTriangles.push(llVertex+1,llVertex+2,llVertex-numLongSteps+2);
                } // end for each latitude
                for (var whichLong=llVertex+2; whichLong<llVertex+numLongSteps+1; whichLong++) // north pole
                    ellipsoidTriangles.push(whichLong,ellipsoidVertices.length/3-1,whichLong+1);
                ellipsoidTriangles.push(ellipsoidVertices.length/3-2,ellipsoidVertices.length/3-1,
                                        ellipsoidVertices.length/3-numLongSteps-1); // longitude wrap
            } // end if good number longitude steps
            return({vertices:ellipsoidVertices, normals:ellipsoidNormals, uvs:ellipsoidUVs, triangles:ellipsoidTriangles});
        } // end try
        
        catch(e) {
            console.log(e);
        } // end catch
    } // end make ellipsoid

    if (useCustomInput) {
        inputTriangles = customInputTriangles;
    }
    else {
        inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data

    }
    //inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data
    
    try {
        if (inputTriangles == String.null)
            throw "Unable to load triangles file!";
        else {
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var vtxToAdd; // vtx coords to add to the coord array
            var normToAdd; // vtx normal to add to the coord array
            var uvToAdd; // vtx UV to add to the UV array
            var triToAdd; // tri indices to add to the index array
            var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
            var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner

            numTriangleSets = inputTriangles.length; // remember how many tri sets

            // order triangle sets by opacity
            inputTriangles.sort(compareTriSetAlpha);

            // process each triangle set to load webgl vertex and triangle buffers
            for (var whichSet=0; whichSet < numTriangleSets; whichSet++) { // for each tri set

                // set up hilighting, modeling translation and rotation
                inputTriangles[whichSet].center = vec3.fromValues(0,0,0);  // center point of tri set
                inputTriangles[whichSet].on = false; // not highlighted
                inputTriangles[whichSet].translation = vec3.fromValues(0,0,0); // no translation
                inputTriangles[whichSet].xAxis = vec3.fromValues(1,0,0); // model X axis
                inputTriangles[whichSet].yAxis = vec3.fromValues(0,1,0); // model Y axis 

                // set up the vertex and normal arrays, define model center and axes
                inputTriangles[whichSet].glVertices = []; // flat coord list for webgl
                inputTriangles[whichSet].glNormals = []; // flat normal list for webgl
                inputTriangles[whichSet].glUVs = []; // flat UV list for webgl

                inputTriangles[whichSet].index = whichSet;

                var numVerts = inputTriangles[whichSet].vertices.length; // num vertices in tri set
                for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                    vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert]; // get vertex to add
                    normToAdd = inputTriangles[whichSet].normals[whichSetVert]; // get normal to add
                    uvToAdd = inputTriangles[whichSet].uvs[whichSetVert]; // get uv to add
                    inputTriangles[whichSet].glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list
                    inputTriangles[whichSet].glNormals.push(normToAdd[0], normToAdd[1], normToAdd[2]); // put normal in set coord list
                    inputTriangles[whichSet].glUVs.unshift(uvToAdd[0], uvToAdd[1]); // put UV in set coord list (uses unshift to flip texture on x-axis)
                    vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                    vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                    vec3.add(inputTriangles[whichSet].center,inputTriangles[whichSet].center,vtxToAdd); // add to ctr sum
                } // end for vertices in set
                vec3.scale(inputTriangles[whichSet].center,inputTriangles[whichSet].center,1/numVerts); // avg ctr sum


                // send the vertex, normal, and UV cords to webGL
                    // vertices
                vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glVertices),gl.STATIC_DRAW); // data in
                    // normals
                normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glNormals),gl.STATIC_DRAW); // data in
                    // UVs
                uvBuffers[whichSet] = gl.createBuffer(); // init empty webgl set UV component buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].glUVs), gl.STATIC_DRAW); // data in

                // set up the textureIDs for each (if any)
                if (inputTriangles[whichSet].material.texture != String.null
                        && inputTriangles[whichSet].material.texture != "") {
                    inputTriangles[whichSet].glTextureID = loadImage(INPUT_PROG_URL + inputTriangles[whichSet].material.texture, false).id;
                    //console.log("inputTriangles[" + whichSet + "].glTextureID: " + inputTriangles[whichSet].glTextureID);
                }
                else {
                    inputTriangles[whichSet].glTextureID = -1; // no texture
                }
                

                // set up the triangle index array, adjusting indices across sets
                inputTriangles[whichSet].glTriangles = []; // flat index list for webgl
                triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length; // number of tris in this set
                for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                    triToAdd = inputTriangles[whichSet].triangles[whichSetTri]; // get tri to add
                    inputTriangles[whichSet].glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
                } // end for triangles in set

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].glTriangles),gl.STATIC_DRAW); // data in

            } // end for each triangle set

            inputEllipsoids = getJSONFile(INPUT_ELLIPSOIDS_URL,"ellipsoids"); // read in the ellipsoids

            if (inputEllipsoids == String.null)
                throw "Unable to load ellipsoids file!";
            else {

                // sort ellipsoids by alpha
                inputEllipsoids.sort(compareEllipsoidAlpha);

                // init ellipsoid highlighting, translation and rotation; update bbox
                var ellipsoid; // current ellipsoid
                var ellipsoidModel; // current ellipsoid triangular model
                var temp = vec3.create(); // an intermediate vec3
                var minXYZ = vec3.create(), maxXYZ = vec3.create();  // min/max xyz from ellipsoid
                numEllipsoids = inputEllipsoids.length; // remember how many ellipsoids
                for (var whichEllipsoid=0; whichEllipsoid<numEllipsoids; whichEllipsoid++) {
                    
                    // set up various stats and transforms for this ellipsoid
                    ellipsoid = inputEllipsoids[whichEllipsoid];
                    ellipsoid.on = false; // ellipsoids begin without highlight
                    ellipsoid.translation = vec3.fromValues(0,0,0); // ellipsoids begin without translation
                    ellipsoid.xAxis = vec3.fromValues(1,0,0); // ellipsoid X axis
                    ellipsoid.yAxis = vec3.fromValues(0,1,0); // ellipsoid Y axis 
                    ellipsoid.center = vec3.fromValues(ellipsoid.x,ellipsoid.y,ellipsoid.z); // locate ellipsoid ctr
                    vec3.set(minXYZ,ellipsoid.x-ellipsoid.a,ellipsoid.y-ellipsoid.b,ellipsoid.z-ellipsoid.c); 
                    vec3.set(maxXYZ,ellipsoid.x+ellipsoid.a,ellipsoid.y+ellipsoid.b,ellipsoid.z+ellipsoid.c); 
                    vec3.min(minCorner,minCorner,minXYZ); // update world bbox min corner
                    vec3.max(maxCorner,maxCorner,maxXYZ); // update world bbox max corner

                    // make the ellipsoid model
                    ellipsoidModel = makeEllipsoid(ellipsoid,32);
    
                    // send the ellipsoid vertex coords and normals to webGL
                    // vertices
                    vertexBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex coord buffer
                    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[vertexBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.vertices),gl.STATIC_DRAW); // data in
                    // normals
                    normalBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex normal buffer
                    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[normalBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ellipsoidModel.normals), gl.STATIC_DRAW); // data in
                    // UVs
                    uvBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex UV buffer
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffers[uvBuffers.length - 1]); // activate that buffer
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ellipsoidModel.uvs), gl.STATIC_DRAW); // data in

                    // set up ellipsoid textureID
                    if (ellipsoid.texture != String.null
                            && ellipsoid.texture != "") {
                        ellipsoidModel.glTextureID = loadImage(INPUT_PROG_URL + ellipsoid.texture, false).id; // has texture
                    }
                    else {
                        ellipsoidModel.glTextureID = -1; // no texture
                    }

                    triSetSizes.push(ellipsoidModel.triangles.length);
    
                    // send the triangle indices to webGL
                    triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ellipsoidModel.triangles),gl.STATIC_DRAW); // data in
                } // end for each ellipsoid
                
                viewDelta = vec3.length(vec3.subtract(temp,maxCorner,minCorner)) / 100; // set global
            } // end if ellipsoid file loaded
        } // end if triangle file loaded
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end load models

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 aVertexUV; // vertex UV coordinate
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        varying vec2 vVertexUV; // interpolated UV coordinate for frag shader

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z));

            // vertex UV
            vVertexUV = aVertexUV;

        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        uniform float uAlpha; // the alpha value
        uniform sampler2D uTextureID; // ID of texture to use
        uniform bool uHasTexture; // whether or not the shader should read the texture
        uniform bool uModulateTex; // whether or not the shader should blend texture colo with fragment color
        
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
        varying vec2 vVertexUV; // UV of fragment
            
        void main(void) {

            // ambient term
            vec3 ambient = uAmbient * uLightAmbient;
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term

            // combine to output color
            if (uHasTexture) { // if has a texture
                vec4 texelValues = texture2D(uTextureID, vVertexUV);
                vec3 colorOut = ambient + diffuse + specular; // includes texture color
                //vec3 colorOut = vec3(texelValues.x, texelValues.y, texelValues.z); // only texture color

                if (uModulateTex){
                    gl_FragColor = texture2D(uTextureID, vVertexUV) *  vec4(colorOut, uAlpha); // blender texture and frag color
                } else {
                    gl_FragColor = texture2D(uTextureID, vVertexUV); // only texture
                }
                
            }
            else { // if no texture
                vec3 colorOut = ambient + diffuse + specular; // no specular yet

                gl_FragColor = vec4(colorOut, uAlpha); // frag color only
            }

        }
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                vUVAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexUV"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vUVAttribLoc); // connect attrib to array
                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                alphaULoc = gl.getUniformLocation(shaderProgram, "uAlpha"); // ptr to alpha
                textureIDULoc = gl.getUniformLocation(shaderProgram, "uTextureID"); // ptr to textureID
                hasTextureULoc = gl.getUniformLocation(shaderProgram, "uHasTexture"); // ptr to uHasTexture
                modulateTexULoc = gl.getUniformLocation(shaderProgram, "uModulateTex"); // ptr to uModulateTex
                
                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderModels() {
    //inputTriangles.sort(compareTriSetAlpha);
    inputTriangles.sort(compareTriZDepth);
    

    // construct the model transform matrix, based on model state
    function makeModelTransform(currModel) {
        var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

        // move the model to the origin
        mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center)); 
        
        // scale for highlighting if needed
        if (currModel.on)
            mat4.multiply(mMatrix,mat4.fromScaling(temp,vec3.fromValues(1.2,1.2,1.2)),mMatrix); // S(1.2) * T(-ctr)
        
        // rotate the model to current interactive orientation
        vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0,  0, 1);
        mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)
        
        // translate back to model center
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

        // translate model to current interactive orientation
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.translation),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)
        
    } // end make model transfor

    // var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var pvMatrix = mat4.create(); // hand * proj * view matrices
    var pvmMatrix = mat4.create(); // hand * proj * view * model matrices

    window.requestAnimationFrame(renderModels); // set up frame render callback
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // set up projection and view
    // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
    mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
    mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view

    

    // render each triangle set
    gl.depthMask(true);
    //console.log("triOrder: " + inputTriangles[0].material.texture + ", " + inputTriangles[1].material.texture + ", " + inputTriangles[2].material.texture);
    if (showTriangles) {
        var currSet; // the tri set and its material properties
        for (var whichTriSet = 0; whichTriSet < numTriangleSets; whichTriSet++) {
            currSet = inputTriangles[whichTriSet];

            if (currSet.material.alpha != 1.0) {
                gl.depthMask(false);
            }

            // make model transform, add to view project
            makeModelTransform(currSet);
            mat4.multiply(pvmMatrix, pvMatrix, mMatrix); // project * view * model
            gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
            gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix

            // reflectivity: feed to the fragment shader
            gl.uniform3fv(ambientULoc, currSet.material.ambient); // pass in the ambient reflectivity
            gl.uniform3fv(diffuseULoc, currSet.material.diffuse); // pass in the diffuse reflectivity
            gl.uniform3fv(specularULoc, currSet.material.specular); // pass in the specular reflectivity
            gl.uniform1f(shininessULoc, currSet.material.n); // pass in the specular exponent
            gl.uniform1f(alphaULoc, currSet.material.alpha); // pass in the alpha value
            gl.uniform1i(textureIDULoc, currSet.glTextureID); // pass in the textureID value
            gl.uniform1i(hasTextureULoc, (currSet.glTextureID >= 0)); // pass in the hasTexture value
            gl.uniform1i(modulateTexULoc, toggleBlendingLightingMode); // pass in the modulateTex value
            //console.log("| " + whichTriSet + " currSet.glTextureID: " + currSet.glTextureID);

            // vertex buffer: activate and feed into vertex shader
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[inputTriangles[whichTriSet].index]); // activate
            gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed
            // normal buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[inputTriangles[whichTriSet].index]); // activate
            gl.vertexAttribPointer(vNormAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed
            // UV buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffers[inputTriangles[whichTriSet].index]); // activate
            gl.vertexAttribPointer(vUVAttribLoc, 2, gl.FLOAT, false, 0, 0); // feed

            // triangle buffer: activate and render
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[inputTriangles[whichTriSet].index]); // activate
            gl.drawElements(gl.TRIANGLES, 3 * triSetSizes[inputTriangles[whichTriSet].index], gl.UNSIGNED_SHORT, 0); // render

        } // end for each triangle set
    }

    // render each ellipsoid
    gl.depthMask(true);
    if (showEllispoids) {
        var ellipsoid, instanceTransform = mat4.create(); // the current ellipsoid and material

        for (var whichEllipsoid = 0; whichEllipsoid < numEllipsoids; whichEllipsoid++) {
            ellipsoid = inputEllipsoids[whichEllipsoid];

            if (ellipsoid.alpha != 1.0) {
                gl.depthMask(false);
            }

            // define model transform, premult with pvmMatrix, feed to vertex shader
            makeModelTransform(ellipsoid);
            pvmMatrix = mat4.multiply(pvmMatrix, pvMatrix, mMatrix); // premultiply with pv matrix
            gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in model matrix
            gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in project view model matrix

            // reflectivity: feed to the fragment shader
            gl.uniform3fv(ambientULoc, ellipsoid.ambient); // pass in the ambient reflectivity
            gl.uniform3fv(diffuseULoc, ellipsoid.diffuse); // pass in the diffuse reflectivity
            gl.uniform3fv(specularULoc, ellipsoid.specular); // pass in the specular reflectivity
            gl.uniform1f(shininessULoc, ellipsoid.n); // pass in the specular exponent
            gl.uniform1f(alphaULoc, ellipsoid.alpha); // pass in the alpha value
            gl.uniform1i(textureIDULoc, ellipsoid.glTextureID); // pass in the textureID value
            gl.uniform1i(hasTextureULoc, (ellipsoid.glTextureID >= 0)); // pass in the hasTexture value
            gl.uniform1i(modulateTexULoc, toggleBlendingLightingMode); // pass in the hasTexture value

            // vertex bufffer
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[numTriangleSets + whichEllipsoid]); // activate vertex buffer
            gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed vertex buffer to shader
            // normal buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[numTriangleSets + whichEllipsoid]); // activate normal buffer
            gl.vertexAttribPointer(vNormAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed normal buffer to shader
            // UV buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffers[numTriangleSets + whichEllipsoid]); // activate UV buffer
            gl.vertexAttribPointer(vUVAttribLoc, 2, gl.FLOAT, false, 0, 0); // feed UV buffer to shader

            // triangle buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[numTriangleSets + whichEllipsoid]); // activate tri buffer

            // draw a transformed instance of the ellipsoid
            gl.drawElements(gl.TRIANGLES, triSetSizes[numTriangleSets + whichEllipsoid], gl.UNSIGNED_SHORT, 0); // render
        } // end for each ellipsoid
    }
} // end render model

/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadModels(); // load in the models from tri file
  setupShaders(); // setup the webGL shaders
  renderModels(); // draw the triangles using webGL
  //console.log("numEllipsoids: " + numEllipsoids);
  //console.log("numTextures: " + numTextures);
    
} // end main
