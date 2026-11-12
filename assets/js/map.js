(function () {
  "use strict";

  const mapSection = document.querySelector("[data-map]");
  const mapElement = document.querySelector("[data-map-canvas]");
  const status = document.querySelector("[data-map-status]");
  if (!mapSection || !mapElement) return;

  const places = [
    {
      name: "Gia Định",
      detail: "Tân Hội, Tân Long — nơi Huỳnh Mẫn Đạt sinh năm 1807.",
      coords: [10.7769, 106.7009]
    },
    {
      name: "Định Tường",
      detail: "Vùng Mỹ Tho, gắn với những biến động Nam Kỳ giữa thế kỷ XIX.",
      coords: [10.36, 106.365]
    },
    {
      name: "Nhật Tảo",
      detail: "Nơi Nguyễn Trung Trực đốt tàu Hy Vọng năm 1861.",
      coords: [10.4333, 106.3833]
    },
    {
      name: "Hà Tiên",
      detail: "Vùng biên giới Tây Nam, nơi ông từng giữ trọng trách.",
      coords: [10.3833, 104.4833]
    },
    {
      name: "Rạch Giá",
      detail: "Nơi ông dạy học, viết điếu Nguyễn Trung Trực và an nghỉ.",
      coords: [10.0125, 105.0809]
    }
  ];

  let loaded = false;
  let map = null;

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function loadStylesheet() {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('link[data-leaflet-css]')) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "assets/vendor/leaflet/leaflet.css";
      link.setAttribute("data-leaflet-css", "");
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function loadScript() {
    return new Promise(function (resolve, reject) {
      if (window.L) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "assets/vendor/leaflet/leaflet.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function buildMap() {
    if (!window.L || map) return;

    map = window.L.map(mapElement, {
      center: [10.35, 105.65],
      zoom: 8,
      minZoom: 6,
      maxZoom: 12,
      scrollWheelZoom: false,
      zoomControl: true
    });

    const tiles = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
    }).addTo(map);

    let tileErrors = 0;
    tiles.on("load", function () {
      if (tileErrors >= 4 || mapSection.classList.contains("is-failed")) return;
      mapSection.classList.add("is-ready");
      setStatus("Bản đồ đã sẵn sàng.");
    });
    tiles.on("tileerror", function () {
      tileErrors += 1;
      if (!mapSection.classList.contains("is-ready") && tileErrors >= 4) fail();
    });

    const points = [];

    places.forEach(function (place) {
      const icon = window.L.divIcon({
        className: "map-marker",
        html: '<span class="map-pin"></span>',
        iconSize: [13, 13],
        iconAnchor: [6.5, 6.5],
        popupAnchor: [0, -10]
      });

      window.L.marker(place.coords, { icon: icon, title: place.name })
        .addTo(map)
        .bindTooltip(place.name, { direction: "top", offset: [0, -8] })
        .bindPopup("<strong>" + place.name + "</strong>" + place.detail);

      points.push(place.coords);
    });

    window.L.polyline(points, {
      color: "#873d32",
      weight: 1.5,
      opacity: 0.6,
      dashArray: "6 8"
    }).addTo(map);

    map.fitBounds(points, { padding: [42, 42], maxZoom: 9 });

    window.setTimeout(function () {
      map.invalidateSize();
    }, 180);

    window.setTimeout(function () {
      if (!mapSection.classList.contains("is-ready")) fail();
    }, 12000);
  }

  function fail() {
    mapSection.classList.remove("is-ready");
    mapSection.classList.add("is-failed");
    setStatus("Không tải được bản đồ tương tác. Đang hiển thị bản đồ tư liệu.");
  }

  function init() {
    if (loaded) return;
    loaded = true;
    setStatus("Đang tải bản đồ tương tác…");
    loadStylesheet()
      .then(loadScript)
      .then(buildMap)
      .catch(fail);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          init();
          observer.disconnect();
        });
      },
      { rootMargin: "240px 0px", threshold: 0.01 }
    );
    observer.observe(mapSection);
  } else {
    init();
  }
})();
