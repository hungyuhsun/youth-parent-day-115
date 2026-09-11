/**
 * 青年高中 115學年度親師座談會 核心互動腳本
 */

document.addEventListener("DOMContentLoaded", function () {
  // 1. 字級大小切換控制
  const fontBtns = document.querySelectorAll(".font-btn");
  const currentFont = localStorage.getItem("parent_site_font") || "standard";

  function setFontSize(size) {
    document.body.classList.remove("font-lg", "font-xl");
    fontBtns.forEach((btn) => btn.classList.remove("active"));

    if (size === "lg") {
      document.body.classList.add("font-lg");
      document.getElementById("font-btn-lg")?.classList.add("active");
    } else if (size === "xl") {
      document.body.classList.add("font-xl");
      document.getElementById("font-btn-xl")?.classList.add("active");
    } else {
      document.getElementById("font-btn-md")?.classList.add("active");
    }
    localStorage.setItem("parent_site_font", size);
  }

  setFontSize(currentFont);

  document.getElementById("font-btn-md")?.addEventListener("click", () => setFontSize("standard"));
  document.getElementById("font-btn-lg")?.addEventListener("click", () => setFontSize("lg"));
  document.getElementById("font-btn-xl")?.addEventListener("click", () => setFontSize("xl"));

  // 2. 行動版與下拉選單控制 (包含行動端手風琴折疊)
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", function () {
      navMenu.classList.toggle("show");
    });
  }

  // 手機版下拉選單點擊展開/收合 (手風琴效果)
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const parent = this.closest(".nav-item-dropdown");
      if (!parent) return;

      const isOpen = parent.classList.contains("open");
      // 關閉其他已展開的下拉
      document.querySelectorAll(".nav-item-dropdown").forEach((el) => {
        if (el !== parent) el.classList.remove("open");
      });

      if (isOpen) {
        parent.classList.remove("open");
      } else {
        parent.classList.add("open");
      }
    });
  });

  // 點擊頁面其他地方關閉下拉
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item-dropdown")) {
      document.querySelectorAll(".nav-item-dropdown").forEach((el) => el.classList.remove("open"));
    }
  });

  // 點擊任意選單連結後自動關閉行動版選單
  document.querySelectorAll(".nav-link:not(.dropdown-toggle), .dropdown-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("show");
      document.querySelectorAll(".nav-item-dropdown").forEach((el) => el.classList.remove("open"));
    });
  });

  // 3. 處室 Tab 切換控制
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-tab");

      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      this.classList.add("active");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // 4. 榜單篩選與搜尋
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("admissionSearch");
  const tableBody = document.getElementById("admissionsTableBody");
  const countDisplay = document.getElementById("admissionCount");

  let currentCategory = "all";
  let searchKeyword = "";

  function renderAdmissions() {
    if (!window.ADMISSIONS_DATA || !tableBody) return;

    const filtered = window.ADMISSIONS_DATA.filter((item) => {
      // 類別過濾
      let catMatch = true;
      if (currentCategory !== "all") {
        catMatch = item.dept.includes(currentCategory);
      }

      // 搜尋關鍵字過濾
      let kwMatch = true;
      if (searchKeyword.trim() !== "") {
        const kw = searchKeyword.toLowerCase();
        kwMatch =
          item.name.toLowerCase().includes(kw) ||
          item.school.toLowerCase().includes(kw) ||
          item.major.toLowerCase().includes(kw) ||
          item.dept.toLowerCase().includes(kw) ||
          (item.junior && item.junior.toLowerCase().includes(kw));
      }

      return catMatch && kwMatch;
    });

    if (countDisplay) {
      countDisplay.textContent = `顯示 ${filtered.length} 筆（共 ${window.ADMISSIONS_DATA.length} 筆）`;
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">查無符合條件之升學榜單資料</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered
      .map(
        (item) => `
      <tr>
        <td><span class="badge ${getDeptBadgeClass(item.dept)}">${item.dept}</span></td>
        <td><strong>${item.class_no}</strong></td>
        <td><strong>${item.name}</strong></td>
        <td style="color: #1e3a8a; font-weight: 700;">${item.school}</td>
        <td>${item.major}</td>
        <td style="color: #64748b;">${item.junior || "-"}</td>
      </tr>
    `
      )
      .join("");
  }

  function getDeptBadgeClass(dept) {
    if (dept.includes("體育")) return "badge-amber";
    if (dept.includes("藥護") || dept.includes("化工")) return "badge-green";
    if (dept.includes("餐飲")) return "badge-amber";
    if (dept.includes("表演") || dept.includes("音樂")) return "badge-purple";
    return "badge-blue";
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentCategory = this.getAttribute("data-filter");
      renderAdmissions();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchKeyword = this.value;
      renderAdmissions();
    });
  }

  // 初始渲染榜單
  renderAdmissions();

  // 5. 分機即時搜尋器
  const extSearchInput = document.getElementById("extSearchInput");
  const extCards = document.querySelectorAll(".ext-card");

  if (extSearchInput) {
    extSearchInput.addEventListener("input", function () {
      const q = this.value.trim().toLowerCase();

      extCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        if (q === "" || text.includes(q)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  }

  // 6. 手風琴折疊 (Accordion)
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      const item = this.parentElement;
      item.classList.toggle("active");
    });
  });

  // 7. 假別說明切換卡
  const leaveTabs = document.querySelectorAll(".leave-type-btn");
  const leaveDetails = document.querySelectorAll(".leave-detail-card");

  leaveTabs.forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = this.getAttribute("data-leave");

      leaveTabs.forEach((b) => b.classList.remove("active"));
      leaveDetails.forEach((d) => d.classList.remove("active"));

      this.classList.add("active");
      const targetDetail = document.getElementById(`leave-${type}`);
      if (targetDetail) {
        targetDetail.classList.add("active");
      }
    });
  });

  // 8. 回到頂部按鈕
  const backToTopBtn = document.getElementById("backToTop");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
      backToTopBtn?.style.setProperty("display", "flex");
    } else {
      backToTopBtn?.style.setProperty("display", "none");
    }
  });

  backToTopBtn?.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // 9. 多國語言即時翻譯控制 (Google Translate API 橋接)
  const langBtns = document.querySelectorAll(".lang-btn");
  
  function applyLanguage(langCode) {
    // 寫入 Google Translate cookie
    const domain = window.location.hostname;
    document.cookie = `googtrans=/zh-TW/${langCode}; path=/;`;
    if (domain && domain !== 'localhost') {
      document.cookie = `googtrans=/zh-TW/${langCode}; domain=.${domain}; path=/;`;
    }
    
    langBtns.forEach(btn => {
      if (btn.getAttribute("data-lang") === langCode) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change"));
    } else {
      location.reload();
    }
  }

  langBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const lang = this.getAttribute("data-lang");
      applyLanguage(lang);
    });
  });

  // 檢查既有語言
  const match = document.cookie.match(/googtrans=\/zh-TW\/([^;]+)/);
  if (match && match[1]) {
    const currentLang = match[1];
    langBtns.forEach(btn => {
      if (btn.getAttribute("data-lang") === currentLang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // 10. 右側浮動章節電梯 (ScrollSpy 滾動監聽與自動高亮)
  const elevatorItems = document.querySelectorAll(".elevator-item");
  const sections = Array.from(elevatorItems)
    .map((item) => {
      const targetId = item.getAttribute("data-target");
      const el = document.getElementById(targetId);
      return el ? { id: targetId, element: el, link: item } : null;
    })
    .filter(Boolean);

  function updateElevatorScrollSpy() {
    if (sections.length === 0) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollBottom = scrollY + windowHeight;
    const docHeight = document.documentElement.scrollHeight;

    // 若已滾動至頁面最底端附近，高亮最後一個項目
    if (docHeight - scrollBottom < 80) {
      elevatorItems.forEach((item) => item.classList.remove("active"));
      sections[sections.length - 1].link.classList.add("active");
      return;
    }

    let activeSection = null;
    const probe = scrollY + 180; // 檢測線

    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = sections[i];
      const top = sec.element.offsetTop;
      if (probe >= top) {
        activeSection = sec;
        break;
      }
    }

    elevatorItems.forEach((item) => item.classList.remove("active"));
    if (activeSection) {
      activeSection.link.classList.add("active");
    }
  }

  window.addEventListener("scroll", updateElevatorScrollSpy, { passive: true });
  updateElevatorScrollSpy();
});


