(function(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const islands = Array.from(document.querySelectorAll(".island"));

  const meWhole = document.getElementById("meWhole");
  const head = document.getElementById("head");
  const eyes = document.getElementById("eyes");

  let activeIsland = null;

  // --- EVENTS (desktop hover, keyboard focus, mobile touch) ---
  islands.forEach(el => {
    // desktop hover
    el.addEventListener("mouseenter", () => { activeIsland = el; });
    el.addEventListener("mouseleave", () => { activeIsland = null; resetPose(); });

    // keyboard accessibility
    el.addEventListener("focus", () => { activeIsland = el; });
    el.addEventListener("blur", () => { activeIsland = null; resetPose(); });

    // mobile touch: set while pressed, reset on release
    el.addEventListener("touchstart", () => {
      activeIsland = el;
    }, { passive: true });

    el.addEventListener("touchend", () => {
      activeIsland = null;
      resetPose();
    }, { passive: true });

    el.addEventListener("touchcancel", () => {
      activeIsland = null;
      resetPose();
    }, { passive: true });
  });

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function getCenter(el){
    const r = el.getBoundingClientRect();
    return { cx: r.left + r.width/2, cy: r.top + r.height/2 };
  }

  function angleTo(targetX, targetY){
    const svg = meWhole?.ownerSVGElement;
    if (!svg) return 0;

    const meRect = svg.getBoundingClientRect();
    const meCX = meRect.left + meRect.width/2;
    const meCY = meRect.top + meRect.height/2;

    const dx = targetX - meCX;
    const dy = targetY - meCY;
    return Math.atan2(dy, dx); // radians
  }

  function applyPoseToIsland(islandEl){
    if (prefersReduced || !islandEl) return;

    const {cx, cy} = getCenter(islandEl);
    const a = angleTo(cx, cy);

    // head turn (small)
    const headDeg = clamp(a * (180/Math.PI), -22, 22);

    // eyes shift (tiny)
    const eyeX = clamp(Math.cos(a) * 4, -4, 4);
    const eyeY = clamp(Math.sin(a) * 3, -3, 3);

    // subtle lean so it feels alive
    const leanDeg = clamp(headDeg * 0.25, -6, 6);

    meWhole.setAttribute("transform", `translate(100 105) rotate(${leanDeg})`);
    head.setAttribute("transform", `translate(0 -30) rotate(${headDeg})`);
    eyes.setAttribute("transform", `translate(${eyeX} ${-6 + eyeY})`);
  }

  function resetPose(){
    meWhole.setAttribute("transform", "translate(100 105)");
    head.setAttribute("transform", "translate(0 -30)");
    eyes.setAttribute("transform", "translate(0 -6)");
  }

  function tick(){
    if (activeIsland){
      applyPoseToIsland(activeIsland);
    }
    requestAnimationFrame(tick);
  }

  tick();
})();
