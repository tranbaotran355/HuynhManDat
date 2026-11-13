(function () {
  "use strict";

  const mapSection = document.querySelector("[data-map]");
  const mapElement = document.querySelector("[data-map-canvas]");
  const status = document.querySelector("[data-map-status]");
  if (!mapSection || !mapElement) return;

  const STYLE_URL = "assets/maps/style-vintage.json";
  const BRAND = "#873d32";

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
      if (document.querySelector("link[data-maplibre-css]")) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "assets/vendor/maplibre/maplibre-gl.css";
      link.setAttribute("data-maplibre-css", "");
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function loadScript() {
    return new Promise(function (resolve, reject) {
      if (window.maplibregl) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "assets/vendor/maplibre/maplibre-gl.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function hasWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (error) {
      return false;
    }
  }

  function boundsOf(coordsList) {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    coordsList.forEach(function (coords) {
      const lat = coords[0];
      const lng = coords[1];
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
    return [
      [minLng, minLat],
      [maxLng, maxLat]
    ];
  }

  function buildMap() {
    if (!window.maplibregl || map) return;

    if (!hasWebGL()) {
      fail();
      return;
    }

    map = new window.maplibregl.Map({
      container: mapElement,
      style: STYLE_URL,
      center: [105.65, 10.35],
      zoom: 8,
      minZoom: 6,
      maxZoom: 12,
      maxBounds: [
        [102.4, 8.2],
        [109.6, 12.2]
      ],
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: true
    });

    map.scrollZoom.disable();
    map.addControl(
      new window.maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    let errorCount = 0;
    map.on("error", function () {
      errorCount += 1;
      if (!mapSection.classList.contains("is-ready") && errorCount >= 4) fail();
    });

    map.on("load", function () {
      if (mapSection.classList.contains("is-failed")) return;

      const journey = places.map(function (place) {
        return [place.coords[1], place.coords[0]];
      });

      map.addSource("journey", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: journey }
        }
      });

      map.addLayer({
        id: "journey-line",
        type: "line",
        source: "journey",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": BRAND,
          "line-width": 1.5,
          "line-opacity": 0.6,
          "line-dasharray": [2, 2]
        }
      });

      places.forEach(function (place) {
        const popup = new window.maplibregl.Popup({
          offset: 18,
          closeButton: false
        }).setHTML("<strong>" + place.name + "</strong><br>" + place.detail);

        new window.maplibregl.Marker({ color: BRAND })
          .setLngLat([place.coords[1], place.coords[0]])
          .setPopup(popup)
          .addTo(map);
      });

      map.fitBounds(boundsOf(places.map(function (p) { return p.coords; })), {
        padding: 42,
        maxZoom: 9,
        duration: 0
      });

      mapSection.classList.add("is-ready");
      setStatus("Bản đồ đã sẵn sàng.");
    });

    window.setTimeout(function () {
      map.resize();
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
