import gsap from 'https://esm.sh/gsap@3.12.5'
import { ScrollTrigger } from 'https://esm.sh/gsap@3.12.5/ScrollTrigger'

// --- Binary Rain Animation Logic ---
        const canvas = document.getElementById('binary-rain-canvas');
        const ctx = canvas.getContext('2d');
        let rainInterval; 

        function startRain() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const fontSize = 12;
            const columns = Math.floor(canvas.width / fontSize);
            const drops = [];
            for (let i = 0; i < columns; i++) {
                drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
            }
            function drawBinaryRain() {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#3498db';
                ctx.font = fontSize + 'px monospace';
                for (let i = 0; i < drops.length; i++) {
                    const text = (Math.random() < 0.5) ? '0' : '1';
                    const x = i * fontSize;
                    const y = drops[i] * fontSize;
                    ctx.fillText(text, x, y);
                    if (y > canvas.height && Math.random() > 0.985) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }
            rainInterval = setInterval(drawBinaryRain, 33); 
        }

        // --- Page Load and Scroll Lock Logic ---
        window.onload = () => {
            const loader = document.getElementById('loader');
            const hero = document.getElementById('home'); 

            /* === Scroll Lock === */
            const scrollY = window.scrollY; 
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollY}px`;

            startRain();
            
            const animationDuration = 926; 
            const fadeDuration = 985;      
                                            
            setTimeout(() => {
                loader.classList.add('hidden');
                hero.style.opacity = '1';

                setTimeout(() => {
                    clearInterval(rainInterval);
                    loader.style.display = 'none';
                    
                    document.body.style.position = '';
                    document.body.style.width = '';
                    document.body.style.top = '';
                    
                    window.scrollTo(0, scrollY); 
                    
                    if (window.runNavUpdate) {
                        window.runNavUpdate();
                    }
                    
                }, fadeDuration);

            }, animationDuration);
        };

gsap.registerPlugin(ScrollTrigger);

        /* ================
        NAVBAR LOGIC
        ================
        */
        const config = {
            spotlight: {
                speed: 0.25,
                deviation: 0.8,
                surface: 0.5,
                specular: 8,
                exponent: 65,
                light: 'hsla(0, 0%, 100%, 0.7)',
                x: 0,
                y: 54,
                z: 82,
                pointer: false,
            },
            ambience: {
                deviation: 0.8,
                surface: 0.5,
                specular: 25,
                exponent: 65,
                light: 'hsla(0, 0%, 100%, 0.4)',
                x: 120,
                y: -154,
                z: 160,
            },
        }

        const nav = document.querySelector('nav')
        const links = nav.querySelectorAll('a')
        const spotlightfeGaussianBlur = document.querySelector(
            '#spotlight feGaussianBlur'
        )
        const spotlightfeSpecularLighting = document.querySelector(
            '#spotlight feSpecularLighting'
        )
        const spotlightfePointLight = document.querySelector('#spotlight fePointLight')
        const ambiencefeGaussianBlur = document.querySelector(
            '#ambience feGaussianBlur'
        )
        const ambiencefeSpecularLighting = document.querySelector(
            '#ambience feSpecularLighting'
        )
        const ambiencefePointLight = document.querySelector('#ambience fePointLight')

        const syncLight = ({ x, y }) => {
            const navBounds = nav.getBoundingClientRect()
            spotlightfePointLight.setAttribute('x', Math.floor(x - navBounds.x))
            spotlightfePointLight.setAttribute('y', Math.floor(y - navBounds.y))
        }
        let monitoring = false
        
        const update = window.runNavUpdate = () => {
            
            setTimeout(() => {
                // set spotlight
                spotlightfeGaussianBlur.setAttribute(
                    'stdDeviation',
                    config.spotlight.deviation
                )
                spotlightfeSpecularLighting.setAttribute(
                    'surfaceScale',
                    config.spotlight.surface
                )
                spotlightfeSpecularLighting.setAttribute(
                    'specularConstant',
                    config.spotlight.specular
                )
                spotlightfeSpecularLighting.setAttribute(
                    'specularExponent',
                    config.spotlight.exponent
                )
                spotlightfeSpecularLighting.setAttribute(
                    'lighting-color',
                    config.spotlight.light
                )
                // set ambience
                ambiencefeGaussianBlur.setAttribute('stdDeviation', config.ambience.deviation)
                ambiencefeSpecularLighting.setAttribute(
                    'surfaceScale',
                    config.ambience.surface
                )
                ambiencefeSpecularLighting.setAttribute(
                    'specularConstant',
                    config.ambience.specular
                )
                ambiencefeSpecularLighting.setAttribute(
                    'specularExponent',
                    config.ambience.exponent
                )
                ambiencefeSpecularLighting.setAttribute(
                    'lighting-color',
                    config.ambience.light
                )
                const anchor = document.querySelector('[data-active="true"]')
                if (!anchor) return; 

                const navBounds = nav.getBoundingClientRect()
                const anchorBounds = anchor.getBoundingClientRect()

                spotlightfePointLight.setAttribute(
                    'x',
                    anchorBounds.left -
                        navBounds.left +
                        anchorBounds.width * 0.5 +
                        config.spotlight.x
                )
                spotlightfePointLight.setAttribute('y', config.spotlight.y)
                spotlightfePointLight.setAttribute('z', config.spotlight.z)

                ambiencefePointLight.setAttribute('x', config.ambience.x)
                ambiencefePointLight.setAttribute('y', config.ambience.y)
                ambiencefePointLight.setAttribute('z', config.ambience.z)

                if (config.spotlight.pointer && !monitoring) {
                    monitoring = true
                    nav.dataset.pointerLighting = true
                    window.addEventListener('pointermove', syncLight)
                } else if (!config.spotlight.pointer) {
                    monitoring = false
                    nav.dataset.pointerLighting = false
                    window.removeEventListener('pointermove', syncLight)
                }
                
                setupScrollAnimations();
                
            }, 0); 
        }

        const selectAnchor = (anchor) => {
            if (!config.pointer) {
                const navBounds = nav.getBoundingClientRect()
                const anchorBounds = anchor.getBoundingClientRect()
                for (const link of links) link.dataset.active = anchor === link
                gsap.to(spotlightfePointLight, {
                    duration: config.spotlight.speed,
                    attr: {
                        x:
                            anchorBounds.left -
                            navBounds.left +
                            anchorBounds.width * 0.5 +
                            config.spotlight.x,
                    },
                })
            }
        }

        nav.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') selectAnchor(event.target)
        })

       
        function setupScrollAnimations() {
            const heroContent = document.querySelector("#home .hero-content");

            if (heroContent) {
                ScrollTrigger.create({
                    trigger: "#home",
                    start: "top 65%",
                    end: "bottom 35%",
                    onEnter: () => {
                        gsap.to(heroContent, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.55,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    },
                    onEnterBack: () => {
                        gsap.to(heroContent, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.55,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    },
                    onLeave: () => {
                        gsap.to(heroContent, {
                            scale: 0.85,
                            opacity: 0,
                            duration: 0.45,
                            ease: "power2.in",
                            overwrite: "auto"
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to(heroContent, {
                            scale: 0.85,
                            opacity: 0,
                            duration: 0.45,
                            ease: "power2.in",
                            overwrite: "auto"
                        });
                    }
                });
            }
        
            const sections = document.querySelectorAll('.full-screen-section');
            
            sections.forEach((section, index) => {
                
                const content = section.querySelector('.content-wrapper');
                
                if (index > 0 && content) { // Only run these on non-hero sections
                    // 2a. Animate content IN
                    gsap.from(content, {
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%", 
                            end: "top 40%",
                            scrub: true,
                        },
                        scale: 0.8,
                        opacity: 0,
                        ease: "power1.out"
                    });
            
                    // 2b. Animate content OUT
                    gsap.to(content, {
                        scrollTrigger: {
                            trigger: section,
                            start: "bottom bottom", 
                            end: "bottom top",
                            scrub: true,
                        },
                        scale: 0.8,
                        opacity: 0,
                        ease: "power1.in"
                    });
                }
                
                const link = document.querySelector(`nav ul.content li a[href="#${section.id}"]`);

                if (link) {
                    ScrollTrigger.create({
                        trigger: section,
                        start: "top 50%",   
                        end: "bottom 50%", 
                        onEnter: () => selectAnchor(link), 
                        onEnterBack: () => selectAnchor(link),
                        onLeave: () => {
                            if (section.id !== 'contact') {
                                const nextSection = document.querySelector(`nav ul.content li a[href="#${section.nextElementSibling?.id}"]`);
                                if (nextSection) selectAnchor(nextSection);
                            }
                        },
                        onLeaveBack: () => {
                            if (section.id !== 'contact') {
                                const prevSection = document.querySelector(`nav ul.content li a[href="#${section.previousElementSibling?.id}"]`);
                                if (prevSection) selectAnchor(prevSection);
                            }
                        }
                    });
                }
                
            });

            const aboutSection = document.getElementById('about');
            const aboutLogo = document.querySelector('.about-logo');
            const aboutText = document.querySelector('.about-text');
            const aboutCertificate = document.querySelector('.about-certificate-container');

            if (aboutSection && aboutLogo && aboutText && aboutCertificate) {
                const showAboutContent = () => {
                    gsap.to(aboutLogo, {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        overwrite: "auto"
                    });

                    gsap.to(aboutText, {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        delay: 0.1,
                        overwrite: "auto"
                    });

                    gsap.to(aboutCertificate, {
                        opacity: 1,
                        y: 0,
                        duration: 0.95,
                        ease: "power2.out",
                        delay: 0.2,
                        overwrite: "auto"
                    });

                    gsap.to(".about-certificate", {
                        boxShadow: "0 0 30px rgba(212, 175, 55, 0.4)",
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                };

                const hideAboutContent = () => {
                    gsap.to(aboutLogo, {
                        opacity: 0,
                        x: -80,
                        duration: 0.45,
                        ease: "power2.in",
                        overwrite: "auto"
                    });

                    gsap.to(aboutText, {
                        opacity: 0,
                        x: 80,
                        duration: 0.45,
                        ease: "power2.in",
                        overwrite: "auto"
                    });

                    gsap.to(aboutCertificate, {
                        opacity: 0,
                        y: 50,
                        duration: 0.45,
                        ease: "power2.in",
                        overwrite: "auto"
                    });

                    gsap.to(".about-certificate", {
                        boxShadow: "0 0 25px rgba(212, 175, 55, 0.3)",
                        duration: 0.35,
                        ease: "power2.in",
                        overwrite: "auto"
                    });
                };

                ScrollTrigger.create({
                    trigger: aboutSection,
                    start: "top 72%",
                    end: "bottom 28%",
                    onEnter: showAboutContent,
                    onEnterBack: showAboutContent,
                    onLeave: hideAboutContent,
                    onLeaveBack: hideAboutContent
                });
            }

            const teamSection = document.getElementById('team');
            const leadershipCards = document.querySelectorAll('.leadership-card');
            const teamCards = document.querySelectorAll('.team-card');

            gsap.from(leadershipCards, {
                scrollTrigger: {
                    trigger: teamSection,
                    start: "top 80%",
                    end: "top 30%",
                    scrub: true,
                },
                opacity: 0,
                y: 50,
                duration: 1,
                stagger: 0.1,
                ease: "power2.out"
            });

            gsap.from(teamCards, {
                scrollTrigger: {
                    trigger: teamSection,
                    start: "top 70%",
                    end: "top 10%",
                    scrub: true,
                },
                opacity: 0,
                y: 50,
                duration: 1.2,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.3
            });
            
            const eventsSection = document.getElementById('events');
            const eventCard = document.querySelector('.event-card');

            gsap.from(eventCard, {
                scrollTrigger: {
                    trigger: eventsSection,
                    start: "top 80%",
                    end: "top 30%",
                    scrub: true,
                },
                opacity: 0,
                y: 50,
                duration: 1.2,
                ease: "power2.out"
            });
        }
        document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("contact-particles");
    if (!canvas) return; 

    const ctx = canvas.getContext("2d");

    function resizeParticles() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resizeParticles();
    window.addEventListener("resize", resizeParticles);

    const particles = [];
    const COUNT = 50; 

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            s: Math.random() * 1.4 + 0.6,
            v: Math.random() * 0.7 + 0.2,
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#D4AF37";

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
            ctx.fill();

            p.y -= p.v;

            if (p.y < -10) p.y = canvas.height + 10;
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
    });

// DOMContentLoaded handler for non-module scripts
document.addEventListener('DOMContentLoaded', () => {
            
            const registerBtn = document.getElementById('register-btn');
            const modalOverlay = document.getElementById('modal-overlay');
            const modalCloseBtn = document.getElementById('modal-close-btn');

            const openModal = () => {
                registerBtn.classList.add('clicked');
                setTimeout(() => {
                    modalOverlay.classList.add('visible');
                    registerBtn.classList.remove('clicked'); 
                }, 150); 
            };

            const closeModal = () => {
                modalOverlay.classList.remove('visible');
            };
        

            //REMOVE THE COMMENT TAG FROM THE NEXT LINE WHEN REGISTRATIONS ARE CLOSED!!!
        
        
        registerBtn.addEventListener('click', openModal);
            modalCloseBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (event) => {
                if (event.target === modalOverlay) {
                    closeModal();
                }
            });
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modalOverlay.classList.contains('visible')) {
                    closeModal();
                }
            });

            const exploreButtons = document.querySelectorAll('.explore-container');
            const teamModals = document.querySelectorAll('.team-modal-overlay');
            const teamModalCloses = document.querySelectorAll('.team-modal-close');

            exploreButtons.forEach(button => {
                const bottom = button.querySelector('.explore-bottom');
                const overlay = button.querySelector('.explore-overlay');
                const count = 110;
                const size = 50;
                
                for (let i = 0; i <= count; i += 1) {
                    const dot = document.createElement("div");
                    dot.classList.add("explore-dot");
                    bottom.appendChild(dot);
                }
                
                const dots = Array.from(button.querySelectorAll(".explore-dot"));
                
                const updateText = (text) => {
                    Array.from(button.querySelectorAll(".explore-text")).forEach(
                        (e) => (e.innerHTML = text)
                    );
                };
                
                const reset = () => {
                    dots.forEach((dot, i) => {
                        const x = (i / count) * (150 + size) - size / 2;
                        const y = Math.random(1) * 52 - size / 2;
                        dot.style.width = `${size}px`;
                        dot.style.height = `${size}px`;
                        dot.style.left = `${x}px`;
                        dot.style.top = `${y}px`;
                        dot.style.opacity = 1;
                        dot.style.transform = "scale(1)";
                    });
                };
                reset();
                
                overlay.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const team = button.getAttribute('data-team');
                    openTeamModal(team);
                    
                    anime({
                        easing: "linear",
                        targets: dots,
                        opacity: [{ value: 0, duration: 600, delay: anime.stagger(10) }],
                        translateX: {
                            value: function () {
                                return anime.random(-30, 30);
                            },
                            duration: 400,
                            delay: anime.stagger(10)
                        },
                        translateY: {
                            value: function () {
                                return anime.random(-30, 30);
                            },
                            duration: 400,
                            delay: anime.stagger(10)
                        },
                        scale: {
                            value: function () {
                                return 0;
                            },
                            duration: 400,
                            delay: anime.stagger(10)
                        }
                    });
                    anime({
                        easing: "linear",
                        delay: 4000,
                        complete: () => {
                            updateText("EXPLORED");
                            setTimeout(() => {
                                updateText("EXPLORE");
                                reset();
                            }, 3000);
                        }
                    });
                });
            });

            function openTeamModal(team) {
                const modal = document.getElementById(`${team}-modal`);
                if (modal) {
                    modal.classList.add('visible');
                }
            }

            function closeTeamModals() {
                teamModals.forEach(modal => {
                    modal.classList.remove('visible');
                });
            }

            teamModalCloses.forEach(closeBtn => {
                closeBtn.addEventListener('click', closeTeamModals);
            });

            teamModals.forEach(modal => {
                modal.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        closeTeamModals();
                    }
                });
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeTeamModals();
                }
            });

            function initWaveBackground() {
                // Configuration with refined blue color theme
                const config = {
                    el: 'wave-background',
                    fov: 75,
                    cameraZ: 75,
                    xyCoef: 60, // Higher value = smoother waves
                    zCoef: 12,  // Moderate wave height
                    lightIntensity: 0.8,
                    // Refined blue palette
                    light1Color: 0x0A1A4A, // Deep navy
                    light2Color: 0x1A2B5A, // Dark blue
                    light3Color: 0x2A3B6A, // Medium blue
                    light4Color: 0x3A4B7A, // Soft blue
                    planeColor: 0x1A2B5A
                };

                let renderer, scene, camera;
                let width, height, wWidth, wHeight;
                let plane;
                const simplex = new SimplexNoise();

                const mouse = new THREE.Vector2();
                const targetMouse = new THREE.Vector2();

                function initThree() {
                    const container = document.getElementById('wave-background-container');
                    width = container.clientWidth;
                    height = container.clientHeight;
                    
                    renderer = new THREE.WebGLRenderer({ 
                        canvas: document.getElementById(config.el), 
                        antialias: true, 
                        alpha: false 
                    });
                    renderer.setClearColor(0x000000);
                    renderer.setSize(width, height);
                    
                    camera = new THREE.PerspectiveCamera(config.fov, width / height);
                    camera.position.z = config.cameraZ;

                    updateSize();
                    window.addEventListener('resize', updateSize, false);

                    document.addEventListener('mousemove', e => {
                        targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                        targetMouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
                    });

                    initScene();
                    animate();
                }

                function initScene() {
                    scene = new THREE.Scene();
                    initLights();

                    let material = new THREE.MeshLambertMaterial({ 
                        color: config.planeColor, 
                        side: THREE.DoubleSide,
                        wireframe: false
                    });
                    
                    let geometry = new THREE.PlaneBufferGeometry(wWidth, wHeight, wWidth / 2, wHeight / 2);
                    plane = new THREE.Mesh(geometry, material);
                    scene.add(plane);

                    plane.rotation.x = -Math.PI / 2 - 0.2;
                    plane.position.y = -25;
                    camera.position.z = 60;
                }

                function initLights() {
                    const r = 30;
                    const y = 10;
                    const lightDistance = 500;

                    const light1 = new THREE.PointLight(config.light1Color, config.lightIntensity, lightDistance);
                    light1.position.set(0, y, r);
                    scene.add(light1);
                    
                    const light2 = new THREE.PointLight(config.light2Color, config.lightIntensity, lightDistance);
                    light2.position.set(0, -y, -r);
                    scene.add(light2);
                    
                    const light3 = new THREE.PointLight(config.light3Color, config.lightIntensity, lightDistance);
                    light3.position.set(r, y, 0);
                    scene.add(light3);
                    
                    const light4 = new THREE.PointLight(config.light4Color, config.lightIntensity, lightDistance);
                    light4.position.set(-r, y, 0);
                    scene.add(light4);
                }

                function animate() {
                    requestAnimationFrame(animate);
                    
                    mouse.lerp(targetMouse, 0.05);
                    
                    animatePlane();
                    animateLights();
                    renderer.render(scene, camera);
                }

                function animatePlane() {
                    const gArray = plane.geometry.attributes.position.array;
                    const time = Date.now() * 0.00008; 
                    
                    for (let i = 0; i < gArray.length; i += 3) {
                        
                        const x = gArray[i] / config.xyCoef;
                        const y = gArray[i + 1] / config.xyCoef;
                        let noise = simplex.noise3D(
                            x + time, 
                            y + time, 
                            mouse.x * 0.3 + mouse.y * 0.3
                        );
                        
                        gArray[i + 2] = noise * config.zCoef;
                    }
                    
                    plane.geometry.attributes.position.needsUpdate = true;
                    plane.geometry.computeVertexNormals();
                }

                function animateLights() {
                    const time = Date.now() * 0.0002;
                    const d = 30; // 
                    
                    // Get lights from scene
                    const lights = scene.children.filter(child => child instanceof THREE.PointLight);
                    
                    if (lights.length >= 4) {
                        
                        lights[0].position.x = Math.sin(time * 0.1) * d;
                        lights[0].position.z = Math.cos(time * 0.15) * d;
                        
                        lights[1].position.x = Math.cos(time * 0.12) * d;
                        lights[1].position.z = Math.sin(time * 0.18) * d;
                        
                        lights[2].position.x = Math.sin(time * 0.14) * d;
                        lights[2].position.z = Math.sin(time * 0.16) * d;
                        
                        lights[3].position.x = Math.sin(time * 0.16) * d;
                        lights[3].position.z = Math.cos(time * 0.12) * d;
                    }
                }

                function updateSize() {
                    const container = document.getElementById('wave-background-container');
                    width = container.clientWidth;
                    height = container.clientHeight;
                    
                    if (renderer && camera) {
                        renderer.setSize(width, height);
                        camera.aspect = width / height;
                        camera.updateProjectionMatrix();
                        
                        const wsize = getRendererSize();
                        wWidth = wsize[0];
                        wHeight = wsize[1];
                    }
                }

                function getRendererSize() {
                    const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect);
                    const vFOV = cam.fov * Math.PI / 180;
                    const height = 2 * Math.tan(vFOV / 2) * Math.abs(config.cameraZ);
                    const width = height * cam.aspect;
                    return [width, height];
                }

                
                initThree();
            }

            
            initWaveBackground();
            
            // --- 3D TEDDY BEAR FOR EVENTS SECTION ---
            function initTeddyBear() {
                let scene, camera, renderer;
                let bearHeadGroup, leftEye, rightEye, leftPupilGroup, rightPupilGroup;
                let leftEyebrow, rightEyebrow; // Eyebrow variables
                
                const clock = new THREE.Clock();
                
                const mousePos = new THREE.Vector2();
                
                let leftPupilInitialPos = new THREE.Vector3();
                let rightPupilInitialPos = new THREE.Vector3();
                const maxPupilMove = 0.15; 

                function createGradientTexture(colorCenter, colorEdge) {
                    const size = 256;
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const context = canvas.getContext('2d');
                    
                    const gradient = context.createRadialGradient(size / 2, size / 2, size / 4, size / 2, size / 2, size / 2);
                    gradient.addColorStop(0, colorCenter);
                    gradient.addColorStop(1, colorEdge);
                    
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, size, size);

                    context.fillStyle = 'rgba(166, 124, 86, 0.2)'; 
                    for (let i = 0; i < 200; i++) {
                        const x = Math.random() * size;
                        const y = Math.random() * size;
                        if (Math.sqrt(Math.pow(x - size/2, 2) + Math.pow(y - size/2, 2)) < size / 2.2) {
                             context.beginPath();
                             context.arc(x, y, Math.random() * 1.5, 0, 2 * Math.PI);
                             context.fill();
                        }
                    }
                    return new THREE.CanvasTexture(canvas);
                }

                function createBlushTexture() {
                    const size = 128;
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const context = canvas.getContext('2d');
                    
                    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
                    gradient.addColorStop(0.2, 'rgba(240, 160, 160, 0.7)');
                    gradient.addColorStop(1, 'rgba(240, 160, 160, 0)');
                    
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, size, size);
                    
                    return new THREE.CanvasTexture(canvas);
                }

                function init() {
                    scene = new THREE.Scene();
                    scene.background = null; 

                    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
                    camera.position.z = 4;

                    const container = document.getElementById('teddy-bear');
                    if (!container) return;

                    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                    renderer.setSize(container.offsetWidth, container.offsetHeight);
                    container.appendChild(renderer.domElement);

                    createBear();

                    document.addEventListener('mousemove', onDocumentMouseMove);
                    document.addEventListener('mouseleave', onMouseLeave);

                    animate();
                }

                function createBear() {
                    bearHeadGroup = new THREE.Group();
                    bearHeadGroup.scale.set(0.6, 0.6, 0.6);
                    scene.add(bearHeadGroup);

                    const bearMaterial = new THREE.MeshBasicMaterial({
                        map: createGradientTexture('#e0ac81', '#a67c56')
                    });
                    const snoutMaterial = new THREE.MeshBasicMaterial({
                        map: createGradientTexture('#f0d5bc', '#e6c1a1')
                    });
                    const innerEarMaterial = new THREE.MeshBasicMaterial({
                        map: createGradientTexture('#e8c4a4', '#b57e55')
                    });
                    const blushMaterial = new THREE.MeshBasicMaterial({
                        map: createBlushTexture(),
                        transparent: true
                    });
                    const eyeBaseMaterial = new THREE.MeshBasicMaterial({ color: 0x5c3d3a });
                    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                    const noseMaterial = new THREE.MeshBasicMaterial({ color: 0x5c6a79 });
                    const smileMaterial = new THREE.MeshBasicMaterial({ color: 0x8a6a4c });
                    const eyebrowMat = new THREE.MeshBasicMaterial({ color: 0x5c3d3a }); // Eyebrow color

                    // --- Geometries ---
                    
                    const headGeo = new THREE.SphereGeometry(1.8, 32, 32);
                    const head = new THREE.Mesh(headGeo, bearMaterial);
                    head.scale.set(1.2, 1.0, 0.7); // Wider (X), normal height (Y), much flatter depth (Z)
                    bearHeadGroup.add(head);

                    const earGeo = new THREE.SphereGeometry(0.6, 32, 32);
                    const leftEar = new THREE.Mesh(earGeo, bearMaterial);
                    leftEar.position.set(-1.8, 1.7, -0.3); // Pushed further out
                    bearHeadGroup.add(leftEar);
                    
                    const rightEar = new THREE.Mesh(earGeo, bearMaterial);
                    rightEar.position.set(1.8, 1.7, -0.3); // Pushed further out
                    bearHeadGroup.add(rightEar);

                    const innerEarGeo = new THREE.SphereGeometry(0.35, 32, 32);
                    const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMaterial);
                    leftInnerEar.position.set(-1.8, 1.7, 0.05); // Pushed further out
                    bearHeadGroup.add(leftInnerEar);

                    const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMaterial);
                    rightInnerEar.position.set(1.8, 1.7, 0.05); // Pushed further out
                    bearHeadGroup.add(rightInnerEar);

                    const snoutGeo = new THREE.SphereGeometry(0.8, 32, 32);
                    const snout = new THREE.Mesh(snoutGeo, snoutMaterial);
                    snout.position.set(0, -0.4, 1.3);
                    snout.scale.set(1.5, 0.8, 0.7);
                    bearHeadGroup.add(snout);

                    const noseGeo = new THREE.SphereGeometry(0.25, 32, 32);
                    const nose = new THREE.Mesh(noseGeo, noseMaterial);
                    nose.position.set(0, -0.1, 1.8);
                    nose.scale.set(1.1, 0.7, 0.7);
                    bearHeadGroup.add(nose);

                    const noseHighlightGeo = new THREE.SphereGeometry(0.04, 16, 16);
                    const noseHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
                    const noseHighlight = new THREE.Mesh(noseHighlightGeo, noseHighlightMat);
                    noseHighlight.scale.set(1.8, 1, 1);
                    noseHighlight.position.set(-0.05, -0.08, 1.95);
                    noseHighlight.rotation.z = THREE.MathUtils.degToRad(30);
                    bearHeadGroup.add(noseHighlight);
                    
                    const smileThickness = 0.04; 
                    const smileRadius = 0.5; 
                    const smileGeo = new THREE.TorusGeometry(smileRadius, smileThickness / 2, 8, 32, Math.PI); // Half torus
                    const smile = new THREE.Mesh(smileGeo, smileMaterial);
                    smile.rotation.x = Math.PI; 
                    smile.position.set(0, -0.5, 1.6);
                    bearHeadGroup.add(smile);

              
                    const eyeOuterGeo = new THREE.SphereGeometry(0.35, 32, 32);
                    leftEye = new THREE.Mesh(eyeOuterGeo, eyeBaseMaterial);
                    leftEye.position.set(-0.7, 0.3, 1.4);
                    bearHeadGroup.add(leftEye);

                    rightEye = new THREE.Mesh(eyeOuterGeo, eyeBaseMaterial);
                    rightEye.position.set(0.7, 0.3, 1.4);
                    bearHeadGroup.add(rightEye);
                    
                    leftPupilGroup = new THREE.Group();
                    rightPupilGroup = new THREE.Group();

                    const mainPupilGeo = new THREE.SphereGeometry(0.1, 32, 32);
                    const subPupilGeo = new THREE.SphereGeometry(0.05, 32, 32);

                    const leftMainPupil = new THREE.Mesh(mainPupilGeo, pupilMaterial);
                    const leftSubPupil = new THREE.Mesh(subPupilGeo, pupilMaterial);
                    leftSubPupil.position.set(0.05, -0.06, 0);
                    leftPupilGroup.add(leftMainPupil, leftSubPupil);
                    
                    const rightMainPupil = new THREE.Mesh(mainPupilGeo, pupilMaterial);
                    const rightSubPupil = new THREE.Mesh(subPupilGeo, pupilMaterial);
                    rightSubPupil.position.set(0.05, -0.06, 0);
                    rightPupilGroup.add(rightMainPupil, rightSubPupil);

                    leftPupilGroup.position.set(-0.7, 0.3, 1.7);
                    rightPupilGroup.position.set(0.7, 0.3, 1.7);
                    
                    leftPupilInitialPos.copy(leftPupilGroup.position);
                    rightPupilInitialPos.copy(rightPupilGroup.position);

                    bearHeadGroup.add(leftPupilGroup, rightPupilGroup);

                    const eyebrowThickness = 0.03;
                    const eyebrowRadius = 0.3; // Curve radius
                    const eyebrowArc = Math.PI / 1.5; // Arc length (e.g., 120 degrees)

                    const eyebrowGeo = new THREE.TorusGeometry(eyebrowRadius, eyebrowThickness / 2, 8, 32, eyebrowArc);

                    leftEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
                    leftEyebrow.position.set(-0.7, 0.6, 1.5); // Position above left eye
                    leftEyebrow.rotation.set(0, 0, THREE.MathUtils.degToRad(40)); // Rotate to be horizontal
                    bearHeadGroup.add(leftEyebrow);
                    
                    rightEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
                    rightEyebrow.position.set(0.7, 0.6, 1.5); // Position above right eye
                    rightEyebrow.rotation.set(0, 0, THREE.MathUtils.degToRad(35)); // Rotate to be horizontal
                    bearHeadGroup.add(rightEyebrow);


                    const blushGeo = new THREE.SphereGeometry(0.4, 32, 32);
                    const leftBlush = new THREE.Mesh(blushGeo, blushMaterial);
                    leftBlush.position.set(-0.95, -0.1, 1.2); 
                    leftBlush.scale.set(1, 0.6, 1);
                    bearHeadGroup.add(leftBlush);
                    
                    const rightBlush = new THREE.Mesh(blushGeo, blushMaterial);
                    rightBlush.position.set(0.95, -0.1, 1.2); 
                    rightBlush.scale.set(1, 0.6, 1);
                    bearHeadGroup.add(rightBlush);
                }

                function onDocumentMouseMove(event) {
                    mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mousePos.y = - (event.clientY / window.innerHeight) * 2 + 1;
                }

                function onMouseLeave(event) {
                    mousePos.x = 0;
                    mousePos.y = 0;
                }

                function lerp(start, end, t) {
                    return start * (1 - t) + end * t;
                }

                function animate() {
                    requestAnimationFrame(animate);
                    
                    const elapsedTime = clock.getElapsedTime();

                    if (bearHeadGroup) {
                        bearHeadGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.03; 
                    }

                    const blinkCycle = elapsedTime % 4; 
                    let blinkScale = 1.0;
                    if (blinkCycle > 3.8) {
                        blinkScale = 0.1;
                    }
                    if (leftEye) {
                        leftEye.scale.y = blinkScale;
                        rightEye.scale.y = blinkScale;
                        leftPupilGroup.visible = blinkScale === 1.0;
                        rightPupilGroup.visible = blinkScale === 1.0;
                    }

                    if (bearHeadGroup) {
                        const maxHeadTilt = 0.15;
                        const targetRotationX = -mousePos.y * maxHeadTilt;
                        const targetRotationY = mousePos.x * maxHeadTilt; 

                        bearHeadGroup.rotation.x = lerp(bearHeadGroup.rotation.x, targetRotationX, 0.1);
                        bearHeadGroup.rotation.y = lerp(bearHeadGroup.rotation.y, targetRotationY, 0.1);
                    }

                    const pupilTargetX = mousePos.x * maxPupilMove;
                    const pupilTargetY = mousePos.y * maxPupilMove;

                    if (leftPupilGroup) {
                        leftPupilGroup.position.x = lerp(leftPupilGroup.position.x, leftPupilInitialPos.x + pupilTargetX, 0.1);
                        leftPupilGroup.position.y = lerp(leftPupilGroup.position.y, leftPupilInitialPos.y + pupilTargetY, 0.1);
                        
                        rightPupilGroup.position.x = lerp(rightPupilGroup.position.x, rightPupilInitialPos.x + pupilTargetX, 0.1);
                        rightPupilGroup.position.y = lerp(rightPupilGroup.position.y, rightPupilInitialPos.y + pupilTargetY, 0.1);
                    }
                    
                    renderer.render(scene, camera);
                }

                init();
            }

            initTeddyBear();
        });

// Additional DOMContentLoaded logic
document.addEventListener("DOMContentLoaded", () => {
    const disposableDomains = [
        "tempmail.com", "10minutemail.com", "mailinator.com",
        "guerrillamail.com", "throwawaymail.com", "sharklasers.com",
        "yopmail.com", "discard.email", "trashmail.com", 
        "temporary-mail.net", "fakeinbox.com"
    ];

    const emailInput = document.querySelector('#contact input[name="email"]') ||
                       document.querySelector('.contact-form input[name="email"]');

    const form = document.querySelector(".contact-form");

    if (!emailInput || !form) return;

    form.addEventListener("submit", (e) => {
        const email = emailInput.value.trim().toLowerCase();
        const domain = email.split("@")[1];

        if (disposableDomains.includes(domain)) {
            e.preventDefault();
            alert("Disposable / temporary emails are not allowed. Please use a valid email.");
            emailInput.focus();
            return;
        }
    });
});

const hamburger = document.querySelector('.hamburger-menu');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.mobile-overlay');
const mobileLinks = document.querySelectorAll('.mobile-menu a');
const mobileRegisterBtn = document.querySelector('.mobile-register-btn');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
}

mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

if (mobileRegisterBtn) {
    mobileRegisterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) registerBtn.click();
        closeMobileMenu();
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMobileMenu();
});

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('#team .leadership-card');
    const canHover = window.matchMedia('(hover: hover)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeCard = null;

    if (!cards.length || !canHover || reducedMotion) return;

    const resetCardGlow = (card) => {
        if (!card) return;
        card.style.setProperty('--card-glow-opacity', '0');
    };

    const activateCardGlow = (card, event) => {
        if (!card) return;
        if (activeCard && activeCard !== card) {
            resetCardGlow(activeCard);
        }
        activeCard = card;
        if (event) {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            card.style.setProperty('--card-glow-x', `${x}px`);
            card.style.setProperty('--card-glow-y', `${y}px`);
        }
        card.style.setProperty('--card-glow-opacity', '0.72');
    };

    cards.forEach((card) => {
        card.addEventListener('pointerenter', (event) => {
            activateCardGlow(card, event);
        });

        card.addEventListener('pointermove', (event) => {
            activateCardGlow(card, event);
        });

        card.addEventListener('pointerleave', () => {
            resetCardGlow(card);
            if (activeCard === card) activeCard = null;
        });
    });
});

// --- Event Toast (TechVerse upcoming) ---
(() => {
    const toast = document.getElementById('event-toast');
    if (!toast) return;
    const closeBtn = document.getElementById('event-toast-close');
    const STORAGE_KEY = 'techverse-toast-v6';
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}

    const show = () => {
        toast.classList.add('visible');
        toast.addEventListener('animationend', (e) => {
            if (e.animationName === 'event-toast-enter' || e.animationName === 'event-toast-enter-mobile') {
                toast.classList.add('settled');
            }
        }, { once: true });
    };
    const dismiss = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        toast.classList.remove('visible', 'settled');
        toast.classList.add('dismissed');
        try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    };

    closeBtn?.addEventListener('click', dismiss);
    toast.addEventListener('click', () => {
        try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    });

    if (dismissed) return;

    const reveal = () => setTimeout(show, 2400);
    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal, { once: true });
})();
