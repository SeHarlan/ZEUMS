"use client"
import { H1, P } from "@/components/typography/Typography";
import { handleClientError } from "@/utils/handleError";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect, FC } from "react";
import * as THREE from "three";

interface GlitchTextMeshProps {
  title: string;
  subtitle: string;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

const GlitchTextMesh: FC<GlitchTextMeshProps> = ({
  title,
  subtitle,
  canvasRef
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();
  const [mousePos, setMousePos] = useState(new THREE.Vector2(-1, -1));
  const [glitchIntensity, setGlitchIntensity] = useState(0.0);
  const pixelChunkSize = 4;

  // Create text texture
  const textTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    let scale = 2;

    if (size.width < 640) { 
      // scale up for mobile
      scale = 3
    }

    canvas.width = size.width * scale;
    canvas.height = size.height * scale;

    const pixelsInRem = 16;

    // Calculate responsive font sizes
    const titleSize = Math.max(4.5, Math.min(8, canvas.width * (0.005))) * scale; // 7xl - 9xl range
    const subtitleSize =
      Math.max(1.25, Math.min(1.5, canvas.width * (0.001))) * scale; // xl - 2xl

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";

    // Main title
    const titleHeight = canvas.height * 0.45;
    ctx.font = `500 ${titleSize}rem  serif`;
    ctx.fillText(title, canvas.width / 2, titleHeight);

    // Subtitle
    ctx.font = `200 ${subtitleSize}rem  sans-serif`;
    ctx.fillText(
      subtitle,
      canvas.width / 2,
      titleHeight + titleSize * pixelsInRem * 0.85
    );

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [size.width, size.height, title, subtitle]);

  // Shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        texture1: { value: textTexture },
        mouse: { value: new THREE.Vector2(-1, -1) },
        glitchIntensity: { value: 0 },
        resolution: { value: new THREE.Vector2(size.width, size.height) },
        chunk: { value: pixelChunkSize },
        dpr: { value: window.devicePixelRatio || 1 },
        textureResolution: {
          value: new THREE.Vector2(
            textTexture.image.width,
            textTexture.image.height
          ),
        },
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float time;
        uniform vec2 mouse;
        uniform float glitchIntensity;

        
        void main() {
          vUv = uv;
          vec3 pos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D texture1;
        uniform vec2 mouse;
        uniform float glitchIntensity;
        uniform vec2 resolution;
        uniform float chunk;
        uniform vec2 textureResolution;
        varying vec2 vUv;
        uniform float dpr;
        
        // Noise functions
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float randomNegNeuPos(vec2 st, float neuChance) {
          float r = random(st);
          if(r < neuChance) {
            return -1.;
          } else if(r > 1.-neuChance) {
            return 1.;
          } else {
            return 0.;
          }
        }
        
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          
          vec2 u = f * f * (3.0 - 2.0 * f);
          
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        void main() {
          vec2 st = vUv;

          vec2 orgSt = st;
          
          float t = time * 0.001 * .4;
          float blockTime = floor(time * 20.);

          float widthMult = max((1000. / resolution.x), 1.);
          float smallWidthMult = 0.1 + min((resolution.x / 1000.), 1.) * 0.9;

          float radius = 1./6.; // Size of the mouses circle radius
          float fadeWidth = 0.3; // Width of the fade effect at the edges


          vec2 norm_mouse = mouse * .5 + .5;

          float glitchSquared = glitchIntensity * glitchIntensity;
        
          float screenAspectRatio = resolution.x / resolution.y;
          float textureAspect = textureResolution.x / textureResolution.y;          

          vec2 blockSize = chunk / resolution;

          vec2 posBlockFloor = floor(st / blockSize);
          vec2 posBlockOffset = fract(st / blockSize);

          vec2 blockSt = posBlockFloor * blockSize;

          vec2 correctedMousePos = vec2(norm_mouse.x * screenAspectRatio, norm_mouse.y);
          vec2 correctedUV = vec2(blockSt.x * screenAspectRatio, blockSt.y);

          float distNoise = noise(st * vec2(2., 50.) + time ) * -0.25;
          float mouseDist = norm_mouse == vec2(0) ? 1. :  distance(correctedMousePos, correctedUV) + distNoise;

          float centralDist = distance(vec2(0.5 * screenAspectRatio, 0.5), correctedUV);

          if(centralDist > 0.5 + (1.0 - glitchIntensity)) {
            float reverseSize = .85;
            mouseDist += centralDist * centralDist + (centralDist * (reverseSize - glitchIntensity));
            mouseDist = 1. - mouseDist * glitchSquared;
          }
          

          float mouseDisplacement = smoothstep(radius + fadeWidth, radius - fadeWidth, mouseDist);

          bool mouseInView = norm_mouse.x > 0.01 && norm_mouse.y >  0.01 && norm_mouse.x < 0.99 && norm_mouse.y < 0.99;
          
          if(!mouseInView) {
            mouseDisplacement = 0.0;
          }

          //pixel chunk stuff

          st = (posBlockFloor + posBlockOffset) * blockSize;

          bool useGlitch = random(vec2(floor(time * 1.))) < 0.3 + glitchIntensity;

          if(useGlitch) {
          // static displace
            st.y += random(st * vec2(1000.01, .01) + blockTime * 0.1) * 0.002;
          }


          //blocky displace
          st.x += random(posBlockFloor + t) * randomNegNeuPos(posBlockFloor + t, 0.5 * glitchSquared) *  glitchSquared * (0.01+mouseDisplacement) * 0.15;
          st.y += random(posBlockFloor + 10. - t) * randomNegNeuPos(posBlockFloor - t + 10., 0.5 * glitchSquared) * glitchSquared * (0.01 + mouseDisplacement) * .15;


          //ZIGZAG
          ///////////
          float size = .015 + (floor(glitchIntensity * 10.) / 10.) * 0.075;
          float largeTimeBlock = floor(10. + time * .1) * .5;
          float blockTimeZ = floor(2. + time * 1. + largeTimeBlock);
          
          
          float blockSizeMult = max(random(vec2(blockTimeZ)), 0.25);
          
          float strength = .02 / blockSizeMult + glitchIntensity;

          float blockSizeZ = blockSizeMult * size;

          vec2 blockFloor = floor(st / blockSizeZ);
          vec2 blockFract = fract(st / blockSizeZ);
          
          float floorCord = blockFloor.y;
          
          float glitchRan = random(vec2(floorCord) - blockTimeZ);
          bool useGlitchZ = glitchRan < blockSizeMult * 0.33 + glitchIntensity * 0.33;

          float glitchRan2 = random(vec2(floorCord) - blockTimeZ);
          bool useGlitchZ2 = glitchRan2 < 0.01 + glitchIntensity * 0.1;
          
          
          if(useGlitchZ2 || (useGlitchZ && useGlitch)) {
            float fractCoord = blockFract.y;
            
            float directionRan = random(vec2(floorCord) + blockTimeZ + 12.);
            float multRan = random(vec2(floorCord) * blockTimeZ + 20.);
            float stutterRan = random(vec2(floorCord) + time + 30.);
            
            float zagDirection = directionRan < 0.5 ? -1. : 1.;
            
            float timeFract = fract(time + 0.5) * stutterRan;
            
            float stutter = (.5 - abs(0.5 - timeFract));
            float zagMult = multRan * stutter * strength;
            float zagger = (.5 - abs(0.5 - fractCoord));

            float zagAmount = zagMult * zagger;
            
            st.x += zagDirection * zagAmount ;
          }
            
          ///////////
          // Center and scale the texture coordinates to maintain aspect ratio
          vec2 centeredUV = st - 0.5;
          if (screenAspectRatio > textureAspect) {
            centeredUV.x *= screenAspectRatio / textureAspect;
          } else {
            centeredUV.y *= textureAspect / screenAspectRatio;
          }

          vec2 textSt = centeredUV + 0.5;
          
          vec4 text = texture2D(texture1, textSt);
 
          vec3 color = 1.0 - text.rgb;

          vec2 offset = vec2(0.006, -0.003) * (glitchIntensity * 1.5 + 0.45) * (0.45 + 0.7 * random(vec2(floor(time *  5.)))) * widthMult;


          if (useGlitch) {
            float colorLeft = texture2D(texture1, textSt + offset).r;
            float colorRight = texture2D(texture1, textSt - offset).b;
            color.r = 1.0-colorLeft;
            color.b = 1.0-colorRight;
          }

          vec2 rgbChunk = orgSt * vec2(0.001, 50.1) * .1;

          float rgbValue = random(rgbChunk + st + vec2(blockTime, 0.));

          if((rgbValue < mouseDisplacement - 0.5)) {
            float colRan = random(rgbChunk + 100. + vec2(t, blockTime));
            vec3 staticCol = color;
            if(colRan < 0.33) {
              staticCol = vec3(1.,0.,0.);
            } else if (colRan < 0.66) {
              staticCol = vec3(0.,1.,0.);
             }else if(colRan < 0.99) {
              staticCol = vec3(0.,0.,1.);
            }
            color = mix(color, staticCol, (0.1 + mouseDisplacement) * (glitchSquared + 0.1));//glitchSquared * (mouseDisplacement + 0.1));
          }
            
          //static outside text
          if(text.a < 0.5) {
            vec2 pixelCoord = st * resolution;
            vec2 stDpr = floor(pixelCoord / vec2(dpr, 1.)) / resolution;
            vec2 ranSt = mix(stDpr * vec2(.005) - vec2(fract(time * 0.005), 0.), stDpr, 0.1);

            float smallWidthMult = 0.2 + min((resolution.x / 1000.), 1.) * 0.8;

            float ranMult = smallWidthMult * 0.075 +  glitchSquared *  0.1 * (centralDist-0.1) * dpr;
            ranMult += useGlitchZ2 ? 0.05 : 0.;
            color -= random(ranSt) * randomNegNeuPos(ranSt, 0.45) * ranMult;
          }
            
          float shimmer = 0.2 ;
          if( text.a> 0.5) {
            color.r += sin((st.y  - time * 0.2) * 102.) * shimmer;
            color.g += sin((st.y  - time * 0.2) * 101.) * shimmer;
            color.b += sin((st.y  - time * 0.2) * 100.) * shimmer;
          }
        
   
          gl_FragColor = vec4(color,1.);
        }
      `,
      transparent: true,
    });
  }, [textTexture, size]);

  // Update uniforms when size changes
  useEffect(() => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.resolution.value.set(size.width, size.height);
      shaderMaterial.uniforms.textureResolution.value.set(
        textTexture.image.width,
        textTexture.image.height
      );
      shaderMaterial.uniforms.dpr.value = window.devicePixelRatio || 1; // Update DPR
    }
  }, [size, shaderMaterial, textTexture]);

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      shaderMaterial.uniforms.time.value = 100 + (state.clock.elapsedTime % 50);
      shaderMaterial.uniforms.mouse.value.copy(mousePos);
      shaderMaterial.uniforms.glitchIntensity.value = glitchIntensity;
      shaderMaterial.uniforms.chunk.value = pixelChunkSize;
    }
  });

  // Mouse and touch tracking
  useEffect(() => {    
    const updatePosition = (clientX: number, clientY: number) => {
      // Convert screen coordinates to normalized device coordinates
      const x = (clientX / size.width) * 2 - 1;
      const y = -(clientY / size.height) * 2 + 1;

      setMousePos(new THREE.Vector2(x, y));

      // Calculate intensity based on distance from center
      const distance = Math.sqrt(x * x + y * y);
      const intensity = Math.max(0, Math.min(1, 1 - distance / 1.2));
      setGlitchIntensity(0.1 + intensity * intensity);
    };

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
    };

    const preventScrollIfCanvas = (event: TouchEvent) => {
      const isCanvas = canvasRef && (event.target === canvasRef.current || canvasRef.current?.contains(event.target as Node));
      if (isCanvas) event.preventDefault();
    }

    //using preventDefault to stop scrolling in canvas
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updatePosition(touch.clientX, touch.clientY);
      }

      preventScrollIfCanvas(event);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updatePosition(touch.clientX, touch.clientY);
      }

      preventScrollIfCanvas(event);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      // updatePosition(-1, -1);

      preventScrollIfCanvas(event);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [size, canvasRef]);

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[viewport.width, viewport.height]} />
    </mesh>
  );
};

// WebGL detection function
const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e: unknown) {
    handleClientError({
      error: e,
      location: "ZeumsGlitch_isWebGLSupported",
    })
    return false;
  }
};

const FallbackText: FC<GlitchTextMeshProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center space-y-8">
      <H1 className="text-center text-7xl lg:text-9xl">{title}</H1>
      <P className="text-center text-xl lg:text-2xl pb-12">
        {subtitle}
      </P>
    </div>
  );
}

// Main component
const GlitchFeedback: FC<GlitchTextMeshProps> = ({
  title,
  subtitle
}) => {
  const [webglSupported, setWebglSupported] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check WebGL support on mount
    setWebglSupported(isWebGLSupported());
  }, []);

  if (!webglSupported) {
    return (
      <div className="absolute inset-0 left-0 top-0 w-full h-full overflow-hidden font">
        <FallbackText title={title} subtitle={subtitle} />;
      </div>
    )
  }

  return (
    <div className="absolute inset-0 left-0 top-0 w-full h-full bg-transparent pointer-events-none -z-10">
      <Canvas
        ref={canvasRef}
        orthographic
        camera={{
          position: [0, 0, 1],
          zoom: 1,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
        }}
        // Enable resize handling
        resize={{
          scroll: false,
          debounce: { scroll: 50, resize: 5 },
        }}
        fallback={<FallbackText title={title} subtitle={subtitle} />}
      >
        <GlitchTextMesh title={title} subtitle={subtitle} canvasRef={canvasRef} />
      </Canvas>
    </div>
  );
};

export default GlitchFeedback;
