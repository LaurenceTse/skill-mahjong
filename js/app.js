(() => {
  const STORAGE_KEY = "skill-mahjong-pool";
  const skills = window.MAHJONG_SKILLS;

  // 微信内置浏览器 100vh 常含地址栏高度，用可视高度修正
  function setAppHeight() {
    const h = window.innerHeight || document.documentElement.clientHeight;
    document.documentElement.style.setProperty("--app-height", `${h}px`);
  }
  setAppHeight();
  window.addEventListener("resize", setAppHeight);
  window.addEventListener("orientationchange", () => {
    setTimeout(setAppHeight, 120);
  });

  const els = {
    mainBtn: document.getElementById("mainBtn"),
    poolBtn: document.getElementById("poolBtn"),
    poolMeta: document.getElementById("poolMeta"),
    displayCard: document.getElementById("displayCard"),
    displayName: document.getElementById("displayName"),
    displayRule: document.getElementById("displayRule"),
    tileFrame: document.getElementById("tileFrame"),
    poolSheet: document.getElementById("poolSheet"),
    skillList: document.getElementById("skillList"),
    selectAllBtn: document.getElementById("selectAllBtn"),
    clearAllBtn: document.getElementById("clearAllBtn"),
    sheetCount: document.getElementById("sheetCount"),
    confirmPool: document.getElementById("confirmPool"),
    closePool: document.getElementById("closePool"),
    sheetBackdrop: document.getElementById("sheetBackdrop"),
    sparkLayer: document.getElementById("sparkLayer"),
  };

  let selectedIds = loadSelectedIds();
  let draftIds = new Set(selectedIds);
  let spinning = false;
  let spinTimer = null;
  let lastIndex = -1;
  let resultSkill = null;

  function loadSelectedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set(skills.map((s) => s.id));
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return new Set(skills.map((s) => s.id));
      }
      const valid = parsed.filter((id) => skills.some((s) => s.id === id));
      return valid.length ? new Set(valid) : new Set(skills.map((s) => s.id));
    } catch (e) {
      return new Set(skills.map((s) => s.id));
    }
  }

  function saveSelectedIds() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedIds]));
    } catch (e) {
      // 微信隐私模式可能禁用 localStorage，忽略即可
    }
  }

  function poolSkills() {
    return skills.filter((s) => selectedIds.has(s.id));
  }

  function updatePoolMeta() {
    const n = selectedIds.size;
    els.poolMeta.textContent = `候选池 · ${n} / ${skills.length}`;
  }

  function renderSkill(skill, hint) {
    const hintEl = els.displayCard.querySelector(".skill-card__hint");
    hintEl.textContent = hint;
    els.displayName.textContent = skill.name;
    els.displayRule.textContent = skill.rule;
  }

  function pickNextSkill(pool) {
    if (pool.length === 1) return pool[0];
    let next = Math.floor(Math.random() * pool.length);
    if (next === lastIndex) {
      next = (next + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
    }
    lastIndex = next;
    return pool[next];
  }

  function burstSparks() {
    const rect = els.tileFrame.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 14; i++) {
      const spark = document.createElement("span");
      spark.className = "spark";
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const dist = 60 + Math.random() * 90;
      spark.style.left = `${cx}px`;
      spark.style.top = `${cy}px`;
      spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      els.sparkLayer.appendChild(spark);
      const remove = () => {
        if (spark.parentNode) spark.parentNode.removeChild(spark);
      };
      spark.addEventListener("animationend", remove);
      spark.addEventListener("webkitAnimationEnd", remove);
      setTimeout(remove, 1000);
    }
  }

  function startSpin() {
    const pool = poolSkills();
    if (pool.length === 0) {
      alert("请先在技能池中至少勾选一条技能");
      openPool();
      return;
    }

    spinning = true;
    resultSkill = null;
    els.mainBtn.textContent = "停止";
    els.mainBtn.classList.add("is-stop");
    els.poolBtn.disabled = true;
    els.tileFrame.classList.add("is-spinning");
    els.tileFrame.classList.remove("is-locked");
    els.displayCard.classList.add("is-racing");
    els.displayCard.classList.remove("is-reveal");

    const tick = () => {
      const skill = pickNextSkill(pool);
      renderSkill(skill, "急速运转中");
    };

    tick();
    spinTimer = setInterval(tick, 55);
  }

  function stopSpin() {
    if (!spinning) return;
    spinning = false;
    clearInterval(spinTimer);
    spinTimer = null;

    const pool = poolSkills();
    const finalSkill = pickNextSkill(pool);
    resultSkill = finalSkill;

    els.tileFrame.classList.remove("is-spinning");
    els.tileFrame.classList.add("is-locked");
    els.displayCard.classList.remove("is-racing");
    els.displayCard.classList.add("is-reveal");
    renderSkill(finalSkill, "本局技能");

    els.mainBtn.textContent = "再抽一次";
    els.mainBtn.classList.remove("is-stop");
    els.poolBtn.disabled = false;

    burstSparks();
  }

  function onMainClick() {
    if (spinning) {
      stopSpin();
    } else {
      startSpin();
    }
  }

  function updateSheetCount() {
    els.sheetCount.textContent = `已选 ${draftIds.size}`;
  }

  function syncCheckedClass(li, checked) {
    if (checked) li.classList.add("is-checked");
    else li.classList.remove("is-checked");
  }

  function renderPoolList() {
    els.skillList.innerHTML = "";
    const frag = document.createDocumentFragment();

    skills.forEach((skill) => {
      const li = document.createElement("li");
      li.className = "skill-item";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `skill-${skill.id}`;
      input.checked = draftIds.has(skill.id);
      syncCheckedClass(li, input.checked);
      input.addEventListener("change", () => {
        if (input.checked) draftIds.add(skill.id);
        else draftIds.delete(skill.id);
        syncCheckedClass(li, input.checked);
        updateSheetCount();
      });

      const body = document.createElement("label");
      body.className = "skill-item__body";
      body.htmlFor = input.id;

      const name = document.createElement("p");
      name.className = "skill-item__name";
      name.textContent = skill.name;

      const rule = document.createElement("p");
      rule.className = "skill-item__rule";
      rule.textContent = skill.rule;

      body.appendChild(name);
      body.appendChild(rule);
      li.appendChild(input);
      li.appendChild(body);
      frag.appendChild(li);
    });

    els.skillList.appendChild(frag);
    updateSheetCount();
  }

  function openPool() {
    if (spinning) return;
    draftIds = new Set(selectedIds);
    renderPoolList();
    els.poolSheet.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closePool() {
    els.poolSheet.hidden = true;
    document.body.style.overflow = "";
  }

  function confirmPool() {
    if (draftIds.size === 0) {
      alert("至少保留一条技能");
      return;
    }
    selectedIds = new Set(draftIds);
    saveSelectedIds();
    updatePoolMeta();
    closePool();

    if (!resultSkill || !selectedIds.has(resultSkill.id)) {
      els.displayCard.classList.remove("is-reveal");
      els.displayName.textContent = "？？？";
      els.displayRule.textContent = "点击下方「开始」抽取本局技能";
      els.displayCard.querySelector(".skill-card__hint").textContent = "等待开局";
      els.mainBtn.textContent = "开始";
    }
  }

  els.mainBtn.addEventListener("click", onMainClick);
  els.poolBtn.addEventListener("click", openPool);
  els.closePool.addEventListener("click", closePool);
  els.sheetBackdrop.addEventListener("click", closePool);
  els.confirmPool.addEventListener("click", confirmPool);

  els.selectAllBtn.addEventListener("click", () => {
    draftIds = new Set(skills.map((s) => s.id));
    renderPoolList();
  });

  els.clearAllBtn.addEventListener("click", () => {
    draftIds.clear();
    renderPoolList();
  });

  updatePoolMeta();
})();
