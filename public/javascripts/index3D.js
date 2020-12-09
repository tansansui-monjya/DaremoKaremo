/* scene(シーン)の作成 */
var scene = new THREE.Scene();

/* camera(カメラ)の作成 */
var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 1000 );
 
/* renderer(レンダラー)の作成　*/
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
 
/* Light(ライト)の設定 */
var ambientLight = new THREE.AmbientLight( 0xcccccc, 2 );
scene.add( ambientLight );
 
/* camera(カメラ)の位置設定　*/
camera.position.z = 250;
 
/* camera(カメラ)をマウス操作する設定　*/   
var controls = new THREE.OrbitControls(camera);
 
/* MTLファイルとObjファイルの読み込み */           
new THREE.MTLLoader().setPath('../assets/')
                     .load('Basehead.mtl',function(materials){
    
    materials.preload();
    
    new THREE.OBJLoader().setPath('../assets/')
                         .setMaterials(materials)
                         .load('Basehead.obj',function (object){
        
        object.position.y = - 95;
        scene.add(object);
        
    }); 
});
 
/* 繰り返しの処理　*/
        
var animate = function () {
    
    requestAnimationFrame( animate );

    renderer.render( scene, camera );
    
};

animate();
                    