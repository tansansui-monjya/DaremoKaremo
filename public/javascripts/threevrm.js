/* global THREE, JEEFACEFILTERAPI, JeelizResizer */

// const width = window.innerWidth;
// const height = window.innerHeight;
const width = 400;
const height = 300;
// -- renderer -------------------------------------------------------------------------------------
let renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
let element = document.getElementById('container').appendChild( renderer.domElement );
element.id = 'canvas2'
// document.body.appendChild( renderer.domElement );
let one = true;
let syokika = false;
let currentVRM = undefined;

 let jeelizCanvas = document.createElement( 'canvas' ); // jeeliz用のキャンバスを生成
// -- camera ---------------------------------------------------------------------------------------
let camera = new THREE.PerspectiveCamera( 15.0, width / height, 0.01, 10.0 );
// -- scene ----------------------------------------------------------------------------------------
let scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

function threevrm(VRM){
  if(!renderer){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
  }

  // -- avocado (gltf) -------------------------------------------------------------------------------

  function initVRM( gltf ) {
    THREE.VRM.from( gltf ).then( ( vrm ) => {
      scene.add( vrm.scene );
      currentVRM = vrm;

      const hips = vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ); // Hipsボーンを取得
      hips.rotation.y = Math.PI; // Hipsボーンを180度回転、正面を向かせる
      
      vrm.humanoid.setPose( {
        [ THREE.VRMSchema.HumanoidBoneName.LeftShoulder ]: {
          rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, 0.2 ) ).toArray()
        },
        [ THREE.VRMSchema.HumanoidBoneName.RightShoulder ]: {
          rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, -0.2 ) ).toArray()
        },
        [ THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ]: {
          rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, 1.1 ) ).toArray()
        },
        [ THREE.VRMSchema.HumanoidBoneName.RightUpperArm ]: {
          rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, -1.1 ) ).toArray()
        },
        [ THREE.VRMSchema.HumanoidBoneName.LeftLowerArm ]: {
          rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, 0.1 ) ).toArray()
        },
        [ THREE.VRMSchema.HumanoidBoneName.RightLowerArm ]: {
          rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, -0.1 ) ).toArray()
        },
      } );

      const head = vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head );
      camera.position.set( 0.0, head.getWorldPosition(new THREE.Vector3()).y, 2.0 );
      
      vrm.lookAt.target = camera; // 常にカメラ方向を向く
    } );
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    VRM,
    ( gltf ) => { initVRM( gltf ); },
    ( progress ) => { console.info( ( 100.0 * progress.loaded / progress.total ).toFixed( 2 ) + '% loaded' ); },
    ( error ) => { console.error( error ); }
  );

  // -- light ----------------------------------------------------------------------------------------
  const light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1.0, 1.0, 1.0 ).normalize();
  scene.add( light );

  // -- update ---------------------------------------------------------------------------------------
  const clock = new THREE.Clock();
  clock.start();

  function update() {
    requestAnimationFrame( update );

    const delta = clock.getDelta();

    if ( currentVRM ) {
      currentVRM.update( delta );

      const blink = Math.max( 0.0, 1.0 - 10.0 * Math.abs( ( clock.getElapsedTime() % 4.0 ) - 2.0 ) ); // まばたきのウェイト
      currentVRM.blendShapeProxy.setValue( THREE.VRMSchema.BlendShapePresetName.Blink, blink ); // まばたきのウェイトを制御する
    }

    renderer.render( scene, camera );
  };
  update();


  // -- mouse ----------------------------------------------------------------------------------------
  // renderer.domElement.addEventListener( 'mousemove', ( event ) => { // マウスイベントの取得
  //   if ( currentVRM ) { // もしcurrentVRMがあれば
  //     const x = event.clientX / renderer.domElement.clientWidth; // マウスのx位置、正規化されている
  //     currentVRM.blendShapeProxy.setValue( THREE.VRMSchema.BlendShapePresetName.Fun, x ); // マウスのx位置を表情に反映

  //     const y = event.clientY / renderer.domElement.clientHeight; // マウスのy位置、正規化されている
  //     currentVRM.blendShapeProxy.setValue( THREE.VRMSchema.BlendShapePresetName.Sorrow, y ); // マウスのy位置を表情に反映
  //   }
  // } );

  // -- face recognition -----------------------------------------------------------------------------

  function handleJeelizReady( error, spec ) { // jeelizの初期化処理が終わった際の処理
    if ( error ) { console.error( error ); return; } // エラーが有った場合、エラーを出力
  }

  function handleJeelizTrack( state ) { // jeelizのトラッキング情報が取得された際の処理
    //console.log("顔認識してる");
    if ( currentVRM ) { // もしcurrentVRMがあれば
      //console.log("反映もできてるよ");
      const head = currentVRM.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head ); // VRMのHeadを取得
      head.rotation.set( -state.rx, state.ry, state.rz, 'ZXY' ); // 頭の回転をVRMに反映

      const expressionA = state.expressions[ 0 ]; // 口の開き具合
      currentVRM.blendShapeProxy.setValue( THREE.VRMSchema.BlendShapePresetName.A, expressionA ); // 口の開き具合をVRMに反映
    }
  }
  function initJeeliz() {
     JEEFACEFILTERAPI.init( { // jeelizの初期化
      canvas: jeelizCanvas, // 顔認識に使うキャンバス
      NNCpath: 'https://unpkg.com/facefilter@1.1.1/dist/NNC.json', // データセットを指定
      followZRot: true, // Z回転を有効にする
      maxFacedDetected: 1, // 顔の最大認識数を指定
      callbackReady: handleJeelizReady, // 初期化処理が終わった際の処理
      callbackTrack: handleJeelizTrack // トラッキング情報が取得された際の処理
    } );
  }

  if(one){
    JeelizResizer.size_canvas( { // キャンバスを最適なサイズに調整する
      canvas: jeelizCanvas, // 顔認識に使うキャンバス
      callback: initJeeliz // キャンバスサイズ調整後の処理
    } );
    one = false;
  }
}