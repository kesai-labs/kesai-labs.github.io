window.addEventListener("load", function () {
  document.querySelectorAll(".site-nav a, .mobile-nav a").forEach(function (a) {
    if (a.getAttribute("href") === "/blog") a.classList.add("active");
  });
});

// Interactive intent-asymmetry widget
document.addEventListener("DOMContentLoaded", async function () {
  let widgetData = null;
  try {
    const response = await fetch("widget_data.json");
    widgetData = await response.json();
  } catch (error) {
    console.error("Failed to load widget data:", error);
    return;
  }

  const misalignedContainer = document.getElementById("misaligned-container");
  const alignedContainer = document.getElementById("aligned-container");
  const misalignedCanvas = document.getElementById("misaligned-canvas");
  const alignedCanvas = document.getElementById("aligned-canvas");
  const misalignedCtx = misalignedCanvas.getContext("2d");
  const alignedCtx = alignedCanvas.getContext("2d");

  let currentX = 0.5,
    currentY = 0.35;

  function resizeCanvases() {
    const rect = misalignedContainer.getBoundingClientRect();
    misalignedCanvas.width = rect.width;
    misalignedCanvas.height = rect.height;
    alignedCanvas.width = rect.width;
    alignedCanvas.height = rect.height;
    updateVisualization(currentX, currentY);
  }
  window.addEventListener("resize", resizeCanvases);
  resizeCanvases();

  function findNearestTargetPoint(x, y) {
    const imgX = x * widgetData.image_width;
    const imgY = y * widgetData.image_height;
    let minDist = Infinity,
      nearestMisaligned = null,
      nearestAligned = null;
    for (const entry of widgetData.misaligned) {
      if (entry.target_point_image) {
        const [tx, ty] = entry.target_point_image;
        const dist = Math.sqrt((tx - imgX) ** 2 + (ty - imgY) ** 2);
        if (dist < minDist) {
          minDist = dist;
          nearestMisaligned = entry;
        }
      }
    }
    if (nearestMisaligned) {
      const w = nearestMisaligned.target_point_world;
      nearestAligned = widgetData.aligned.find(
        (e) =>
          e.target_point_world[0] === w[0] &&
          e.target_point_world[1] === w[1],
      );
    }
    return { misaligned: nearestMisaligned, aligned: nearestAligned };
  }

  function drawTrajectory(ctx, waypoints, canvasWidth, canvasHeight) {
    if (!waypoints || waypoints.length === 0) return;
    const scaleX = canvasWidth / widgetData.image_width;
    const scaleY = canvasHeight / (widgetData.image_height * 0.75);
    const offsetY = widgetData.image_height * 0.125;
    ctx.strokeStyle = "#FFBE27";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    let started = false;
    for (const wp of waypoints) {
      if (wp) {
        const x = wp[0] * scaleX,
          yy = (wp[1] - offsetY) * scaleY;
        if (!started) {
          ctx.moveTo(x, yy);
          started = true;
        } else {
          ctx.lineTo(x, yy);
        }
      }
    }
    ctx.stroke();
    ctx.fillStyle = "#FFBE27";
    for (const wp of waypoints) {
      if (wp) {
        const x = wp[0] * scaleX,
          yy = (wp[1] - offsetY) * scaleY;
        ctx.beginPath();
        ctx.arc(x, yy, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  function drawTargetPoint(ctx, x, y, offsetY, scaleY) {
    const cy = (y - offsetY) * scaleY;
    const r = 10;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, cy - r, r, Math.PI * 0.25, Math.PI * 0.75, true);
    ctx.lineTo(x, cy + r * 1.2);
    ctx.closePath();
    ctx.fillStyle = "#e06666";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, cy - r, r * 0.42, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
    ctx.restore();
  }

  function updateVisualization(normX, normY) {
    const { misaligned, aligned } = findNearestTargetPoint(normX, normY);
    misalignedCtx.clearRect(0, 0, misalignedCanvas.width, misalignedCanvas.height);
    alignedCtx.clearRect(0, 0, alignedCanvas.width, alignedCanvas.height);
    if (misaligned) {
      drawTrajectory(
        misalignedCtx,
        misaligned.waypoints_image,
        misalignedCanvas.width,
        misalignedCanvas.height,
      );
      if (misaligned.target_point_image) {
        const scaleX = misalignedCanvas.width / widgetData.image_width;
        const scaleY = misalignedCanvas.height / (widgetData.image_height * 0.75);
        const offsetY = widgetData.image_height * 0.125;
        const [tx, ty] = misaligned.target_point_image;
        drawTargetPoint(misalignedCtx, tx * scaleX, ty, offsetY, scaleY);
      }
    }
    if (aligned) {
      drawTrajectory(
        alignedCtx,
        aligned.waypoints_image,
        alignedCanvas.width,
        alignedCanvas.height,
      );
      if (aligned.target_point_image) {
        const scaleX = alignedCanvas.width / widgetData.image_width;
        const scaleY = alignedCanvas.height / (widgetData.image_height * 0.75);
        const offsetY = widgetData.image_height * 0.125;
        const [tx, ty] = aligned.target_point_image;
        drawTargetPoint(alignedCtx, tx * scaleX, ty, offsetY, scaleY);
      }
    }
  }

  function handleInteraction(e, container) {
    const rect = container.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    currentX = Math.max(0, Math.min(1, x / rect.width));
    currentY = Math.max(0, Math.min(1, 0.125 + (y / rect.height) * 0.75));
    updateVisualization(currentX, currentY);
  }

  let isMouseDown = false,
    isDragging = false;
  [misalignedContainer, alignedContainer].forEach((container) => {
    container.addEventListener("dragstart", (e) => e.preventDefault());
    container.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isMouseDown = true;
      handleInteraction(e, container);
    });
    container.addEventListener("mousemove", (e) => {
      if (isMouseDown) {
        e.preventDefault();
        handleInteraction(e, container);
      }
    });
    container.addEventListener("mouseup", (e) => {
      if (isMouseDown) handleInteraction(e, container);
    });
    container.addEventListener("click", (e) => handleInteraction(e, container));
    container.addEventListener("touchstart", (e) => {
      e.preventDefault();
      isDragging = true;
      handleInteraction(e, container);
    });
    container.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (isDragging) handleInteraction(e, container);
    });
  });
  document.addEventListener("mouseup", () => {
    isMouseDown = false;
    isDragging = false;
  });
  document.addEventListener("touchend", () => {
    isDragging = false;
  });

  updateVisualization(currentX, currentY);
});

// Large centered play button for each video. The native <video controls>
// player only exposes a tiny play control in the bottom-left corner, so we
// overlay an amber button that triggers playback and steps out of the way
// once the video is running (the native controls still work underneath).
document.querySelectorAll(".lead-video-embed video").forEach(function (video) {
  const embed = video.parentElement;
  if (!embed) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "lead-video-play";
  btn.setAttribute("aria-label", "Play video");
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  embed.appendChild(btn);

  btn.addEventListener("click", function () {
    video.play();
  });
  video.addEventListener("play", function () {
    embed.classList.add("is-playing");
  });
  video.addEventListener("pause", function () {
    embed.classList.remove("is-playing");
  });
  video.addEventListener("ended", function () {
    embed.classList.remove("is-playing");
  });
});

// SOTA development plot
const INCLUDE_TFV6 = true;
const isTFv6 = (name) => name.includes("TFv6") || name.includes("TransFuser v6");

// The #sotaChart canvas may be commented out in the markup; skip rendering if so.
if (document.getElementById("sotaChart")) {
fetch("sota.json")
  .then((response) => response.json())
  .then((data) => {
    const rows = data.datasets[0].sota.rows;
    let models = rows
      .filter((row) => row.paper_date && row.paper_date !== "null")
      .map((row) => {
        const date =
          row.paper_date.length === 4
            ? new Date(row.paper_date + "-01-01")
            : new Date(row.paper_date);
        return {
          name: row.model_name,
          date,
          score: parseFloat(row.metrics["Driving Score"]),
        };
      })
      .filter((m) => m && !isNaN(m.score))
      .sort((a, b) => a.date - b.date);

    if (!INCLUDE_TFV6) models = models.filter((m) => !isTFv6(m.name));

    const sotaProgression = [];
    let currentBest = 0;
    for (const model of models) {
      if (model.score > currentBest) {
        currentBest = model.score;
        sotaProgression.push(model);
      }
    }
    const sotaDates = new Set(sotaProgression.map((m) => m.date.getTime()));
    const nonSotaModels = models.filter(
      (m) => !sotaDates.has(m.date.getTime()) && !isTFv6(m.name),
    );

    const isMobile = window.innerWidth < 768;
    const sotaColor = (m) => (isTFv6(m.name) ? "#FFBE27" : "#ffffff");
    const ctx = document.getElementById("sotaChart").getContext("2d");

    const tfv6Point = sotaProgression.find((m) => isTFv6(m.name));

    const latestDate = models.reduce(
      (max, m) => (m.date > max ? m.date : max),
      models[0].date,
    );
    const xMax = new Date(latestDate.getTime() + 1000 * 60 * 60 * 24 * 45);

    const tfv6TopPlugin = {
      id: "tfv6top",
      afterDraw(chart) {
        if (!tfv6Point) return;
        const xPx = chart.scales.x.getPixelForValue(tfv6Point.date);
        const yPx = chart.scales.y.getPixelForValue(tfv6Point.score);
        const r = isMobile ? 5 : 7;
        chart.ctx.save();
        chart.ctx.beginPath();
        chart.ctx.arc(xPx, yPx, r, 0, 2 * Math.PI);
        chart.ctx.fillStyle = "#FFBE27";
        chart.ctx.fill();
        chart.ctx.restore();
      },
    };

    new Chart(ctx, {
      type: "line",
      plugins: [ChartDataLabels, tfv6TopPlugin],
      data: {
        datasets: [
          {
            label: "Roofline",
            data: [
              { x: new Date("2022-01-01"), y: 100 },
              { x: xMax, y: 100 },
            ],
            borderColor: "rgba(255, 255, 255, 0.3)",
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
            pointHoverRadius: 0,
            showLine: true,
            fill: false,
            datalabels: { display: false },
          },
          {
            label: "All Models",
            data: nonSotaModels.map((m) => ({ x: m.date, y: m.score, name: m.name })),
            backgroundColor: "rgba(255, 255, 255, 0.28)",
            borderColor: "transparent",
            pointRadius: isMobile ? 2.5 : 4,
            pointHoverRadius: isMobile ? 5 : 6,
            showLine: false,
            datalabels: { display: false },
          },
          {
            label: "SOTA Progression",
            data: sotaProgression.map((m) => ({ x: m.date, y: m.score, name: m.name })),
            backgroundColor: sotaProgression.map(sotaColor),
            borderColor: "#ffffff",
            borderWidth: isMobile ? 2 : 3,
            pointRadius: isMobile ? 5 : 7,
            pointHoverRadius: isMobile ? 6 : 8,
            pointBackgroundColor: sotaProgression.map(sotaColor),
            pointBorderColor: sotaProgression.map(sotaColor),
            pointBorderWidth: 0,
            tension: 0,
            fill: false,
            datalabels: {
              display: true,
              align: "top",
              anchor: "top",
              offset: 8,
              color: (context) => sotaColor(sotaProgression[context.dataIndex]),
              font: { size: isMobile ? 8 : 10, weight: "bold" },
              formatter: (value, context) => sotaProgression[context.dataIndex].name,
            },
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: isMobile ? 1.2 : 1.8,
        layout: {
          padding: {
            left: isMobile ? 0 : 10,
            right: isMobile ? 0 : 10,
            top: 28,
            bottom: 10,
          },
        },
        interaction: { mode: "nearest", intersect: false, axis: "xy" },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { size: isMobile ? 12 : 14, weight: "bold" },
            bodyFont: { size: isMobile ? 11 : 13 },
            padding: isMobile ? 8 : 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (context) => context[0].raw.name,
              label: (context) => {
                const score = context.parsed.y.toFixed(2);
                const dateStr = new Date(context.parsed.x).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                });
                return [`Score: ${score}`, `Date: ${dateStr}`];
              },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            max: xMax,
            time: {
              unit: isMobile ? "quarter" : "month",
              displayFormats: { month: "MMM yyyy", quarter: "MMM yy" },
              tooltipFormat: "MMM yyyy",
            },
            title: { display: false },
            grid: { display: false },
            ticks: {
              font: { size: isMobile ? 9 : 14 },
              color: "rgba(255, 255, 255, 0.7)",
              maxRotation: isMobile ? 45 : 30,
              minRotation: isMobile ? 45 : 0,
              autoSkip: true,
              maxTicksLimit: isMobile ? 6 : 12,
            },
            afterFit: (axis) => {
              axis.paddingRight = 40;
            },
          },
          y: {
            min: 40,
            max: 100,
            title: {
              display: !isMobile,
              text: "Bench2Drive Score",
              font: { size: 16, weight: "normal" },
              color: "rgba(255, 255, 255, 0.7)",
            },
            ticks: {
              font: { size: isMobile ? 10 : 14 },
              color: "rgba(255, 255, 255, 0.7)",
              stepSize: 10,
            },
            grid: { color: "rgba(255, 255, 255, 0.12)", lineWidth: 1 },
          },
        },
      },
    });
  })
  .catch((error) => {
    console.error("Error loading SOTA data:", error);
    const el = document.getElementById("sotaChart");
    if (el)
      el.parentElement.innerHTML =
        '<p style="color:#666;text-align:center;">Unable to load chart data</p>';
  });
}

// Scroll reveal for blog content: paragraphs, figures, and lists
(function () {
  const blogBody = document.querySelector('.blog-body');
  if (!blogBody) return;

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );

  [
    ...blogBody.querySelectorAll('p:not(.section-eyebrow), figure, ol'),
    ...document.querySelectorAll('.blog-references'),
  ].forEach(el => {
    if (el.getBoundingClientRect().top >= window.innerHeight) {
      el.classList.add('reveal');
      io.observe(el);
    }
  });
})();

// Submetrics chart
(function () {
  const ctx = document.getElementById("submetricsChart");
  if (!ctx) return;
  const isMobile = window.innerWidth < 600;
  const fullLabels = {
    "Veh": "Vehicle Collision",
    "Block": "Ego Blocked",
    "Red": "Red Light Infraction",
    "Stat": "Static Obstacle Infraction",
    "OL": "Out of Lane",
    "Dev": "Route Deviation",
    "Ped": "Pedestrian Collision",
    "Stop": "Stop Sign Infraction",
  };
  const labelDescriptions = {
    "Veh": "Collisions with other vehicles, the most common failure mode.",
    "Block": "Ego vehicle is unable to proceed due to a blocked path.",
    "Red": "Running a red light without stopping.",
    "Stat": "Collisions with static scene objects (barriers, props, etc.).",
    "OL": "Driving outside the legal lane boundaries.",
    "Dev": "Departing from the planned route.",
    "Ped": "Collisions with pedestrians.",
    "Stop": "Failing to stop at a stop sign.",
  };
  // Prints each bar's absolute infraction count above it, colored by the trend
  // relative to the bar to its left: green = fewer violations, red = more,
  // white = no change (or the first bar, which has nothing to compare against).
  const trendDeltaPlugin = {
    id: "trendDeltas",
    afterDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      const sets = chart.data.datasets;
      if (sets.length < 2) return;
      const n = chart.data.labels.length;
      const gap = 7;
      const goodColor = "rgba(95,170,99,1)";
      const badColor = "rgba(206,84,84,1)";
      const flatColor = "rgba(255,255,255,0.95)";
      const fontSize = isMobile ? 9 : 11;
      const drawLabel = (x, barY, text, color) => {
        let y = barY - gap;
        if (y < chartArea.top + fontSize) y = chartArea.top + fontSize;
        ctx.save();
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
      };
      // First dataset has no bar to its left, so label it with its absolute
      // count in white rather than a change.
      const firstMeta = chart.getDatasetMeta(0);
      for (let i = 0; i < n; i++) {
        const bar = firstMeta.data[i];
        if (!bar) continue;
        drawLabel(bar.x, bar.y, String(sets[0].data[i]), flatColor);
      }
      for (let di = 1; di < sets.length; di++) {
        const cur = sets[di].data;
        const prev = sets[di - 1].data;
        const meta = chart.getDatasetMeta(di);
        for (let i = 0; i < n; i++) {
          const bar = meta.data[i];
          if (!bar) continue;
          // Print this bar's absolute count, but color it by the trend versus
          // the bar to its left: green if it fell, red if it rose, white if flat.
          const delta = cur[i] - prev[i];
          const text = String(cur[i]);
          const color = delta === 0 ? flatColor : (delta > 0 ? badColor : goodColor);
          drawLabel(bar.x, bar.y, text, color);
        }
      }
    },
  };

  new Chart(ctx.getContext("2d"), {
    type: "bar",
    plugins: [trendDeltaPlugin],
    data: {
      labels: ["Veh", "Block", "Red", "Stat", "OL", "Dev", "Ped", "Stop"],
      datasets: [
        {
          label: "TransFuser v5",
          data: [137, 27, 58, 46, 46, 16, 5, 18],
          backgroundColor: "rgba(255,255,255,0.85)",
          borderColor: "rgba(255,255,255,1)",
          borderWidth: 1,
          categoryPercentage: 0.5,
          barPercentage: 0.7,
        },
        {
          label: "TransFuser v6",
          data: [42, 1, 5, 1, 12, 33, 0, 3],
          backgroundColor: "rgba(255,190,39,1)",
          borderColor: "rgba(214,158,20,1)",
          borderWidth: 1,
          categoryPercentage: 0.5,
          barPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: isMobile ? 1.8 : 3.0,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "rgba(255, 255, 255, 0.8)",
            font: { size: isMobile ? 9 : 11 },
            usePointStyle: true,
            pointStyle: "rect",
          },
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const key = items[0].label;
              const desc = labelDescriptions[key];
              return desc ? [fullLabels[key] || key, desc] : [fullLabels[key] || key];
            },
            label: (c) => c.dataset.label + ": " + c.parsed.y + " infractions/100km",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: { size: isMobile ? 9 : 11 },
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            // Show the full infraction name under each bar, wrapped two words
            // per line so short connectors ("of") stay attached and the label
            // never runs past two lines.
            callback(value) {
              const key = this.getLabelForValue(value);
              const words = (fullLabels[key] || key).split(" ");
              const lines = [];
              for (let i = 0; i < words.length; i += 2) {
                lines.push(words.slice(i, i + 2).join(" "));
              }
              return lines;
            },
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          max: 150,
          title: {
            display: !isMobile,
            text: "Infractions per 100 km",
            color: "rgba(255, 255, 255, 0.7)",
            font: { size: 12 },
          },
          ticks: { color: "rgba(255, 255, 255, 0.7)", font: { size: isMobile ? 9 : 11 }, stepSize: 50 },
          grid: { color: "rgba(255, 255, 255, 0.12)" },
        },
      },
    },
  });
})();
