/* ========================================
   CHARTS.JS — Chart.js Wrapper Utilities
   ======================================== */

const defaultFont = { family: 'Inter', size: 12 };
const gridColor = 'rgba(30, 41, 59, 0.6)';
const textColor = '#94a3b8';

const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { color: textColor, font: defaultFont, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
        tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
            titleFont: { ...defaultFont, weight: '600' },
            bodyFont: defaultFont,
        }
    },
    scales: {
        x: { ticks: { color: textColor, font: defaultFont }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, font: defaultFont }, grid: { color: gridColor } },
    }
};

export function createLineChart(canvasId, labels, datasets) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const existing = Chart.getChart(canvasId);
    if (existing) existing.destroy();
    return new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: datasets.map(ds => ({
            ...ds,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            fill: ds.fill !== undefined ? ds.fill : true,
        }))},
        options: { ...baseOptions }
    });
}

export function createBarChart(canvasId, labels, datasets) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const existing = Chart.getChart(canvasId);
    if (existing) existing.destroy();
    return new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: datasets.map(ds => ({
            ...ds,
            borderRadius: 6,
            borderWidth: 0,
            maxBarThickness: 40,
        }))},
        options: {
            ...baseOptions,
            scales: {
                ...baseOptions.scales,
                y: { ...baseOptions.scales.y, beginAtZero: true },
            }
        }
    });
}

export function createDoughnutChart(canvasId, labels, data, colors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const existing = Chart.getChart(canvasId);
    if (existing) existing.destroy();
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: '#111827',
                borderWidth: 3,
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, font: defaultFont, padding: 16, usePointStyle: true } },
                tooltip: baseOptions.plugins.tooltip,
            }
        }
    });
}
