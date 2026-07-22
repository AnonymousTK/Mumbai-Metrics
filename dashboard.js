/* ==========================================================================
   MUMBAI REAL ESTATE ANALYTICS DASHBOARD - INTERACTIVE CHARTS & LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.MUMBAI_DATA;

  if (!data || !data.breakdown_records) {
    console.error('MUMBAI_DATA missing breakdown_records. Please ensure build_data_js.py has executed.');
    return;
  }

  const records = data.breakdown_records;
  const chartInstances = {};

  // 1. Populate Filter Dropdowns
  function initFilters() {
    const regionSelect = document.getElementById('filter-region');
    const bhkSelect = document.getElementById('filter-bhk');
    const statusSelect = document.getElementById('filter-status');

    // Populate unique regions
    const regions = Array.from(new Set(records.map(r => r.region))).sort();
    regions.forEach(reg => {
      const opt = document.createElement('option');
      opt.value = reg;
      opt.textContent = reg;
      regionSelect.appendChild(opt);
    });

    // Event listeners
    regionSelect.addEventListener('change', applyGlobalFilters);
    bhkSelect.addEventListener('change', applyGlobalFilters);
    statusSelect.addEventListener('change', applyGlobalFilters);

    const searchInput = document.getElementById('search-locality');
    if (searchInput) {
      searchInput.addEventListener('input', applyGlobalFilters);
    }

    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        regionSelect.value = 'ALL';
        bhkSelect.value = 'ALL';
        statusSelect.value = 'ALL';
        if (searchInput) searchInput.value = '';
        applyGlobalFilters();
      });
    }
  }

  // 2. Filter Dataset Based on UI Selection
  function getFilteredRecords() {
    const selRegion = document.getElementById('filter-region').value;
    const selBHK = document.getElementById('filter-bhk').value;
    const selStatus = document.getElementById('filter-status').value;
    const searchVal = (document.getElementById('search-locality')?.value || '').toLowerCase().trim();

    return records.filter(r => {
      const matchRegion = (selRegion === 'ALL' || r.region === selRegion);
      const matchBHK = (selBHK === 'ALL' || r.bhk_category === selBHK);
      const matchStatus = (selStatus === 'ALL' || r.status === selStatus);
      const matchSearch = (!searchVal || 
        r.locality.toLowerCase().includes(searchVal) || 
        r.region.toLowerCase().includes(searchVal));

      return matchRegion && matchBHK && matchStatus && matchSearch;
    });
  }

  // 3. Compute Aggregated KPIs from Filtered Records
  function computeKPIs(filtered) {
    if (filtered.length === 0) {
      return {
        total_properties: 0,
        total_valuation_crores: 0,
        avg_price_per_sqft: 0,
        avg_expected_roi_pct: 0,
        avg_market_volatility: 0,
        avg_property_liquidity: 0
      };
    }

    let totalCount = 0;
    let totalValuation = 0;
    let sumWeightedPriceSqft = 0;
    let sumWeightedROI = 0;
    let sumWeightedVolatility = 0;
    let sumWeightedLiquidity = 0;

    filtered.forEach(r => {
      const cnt = r.count;
      totalCount += cnt;
      totalValuation += r.total_valuation_crores;
      sumWeightedPriceSqft += r.avg_price_per_sqft * cnt;
      sumWeightedROI += r.avg_roi * cnt;
      sumWeightedVolatility += r.avg_volatility * cnt;
      sumWeightedLiquidity += r.avg_liquidity * cnt;
    });

    return {
      total_properties: totalCount,
      total_valuation_crores: Math.round(totalValuation * 100) / 100,
      avg_price_per_sqft: Math.round(sumWeightedPriceSqft / totalCount),
      avg_expected_roi_pct: Math.round((sumWeightedROI / totalCount) * 100) / 100,
      avg_market_volatility: Math.round((sumWeightedVolatility / totalCount) * 100) / 100,
      avg_property_liquidity: Math.round((sumWeightedLiquidity / totalCount) * 100) / 100
    };
  }

  // 4. Update KPI UI Cards
  function updateKPIs(kpis) {
    document.getElementById('kpi-total-properties').innerText = Number(kpis.total_properties).toLocaleString();
    document.getElementById('kpi-valuation').innerText = `₹${Number(kpis.total_valuation_crores).toLocaleString()} Cr`;
    document.getElementById('kpi-price-sqft').innerText = `₹${Number(kpis.avg_price_per_sqft).toLocaleString()}`;
    document.getElementById('kpi-avg-roi').innerText = `${kpis.avg_expected_roi_pct}%`;
    document.getElementById('kpi-volatility').innerText = `${kpis.avg_market_volatility} / 10`;
    document.getElementById('kpi-liquidity').innerText = `${kpis.avg_property_liquidity} / 10`;
  }

  // 5. Update Locality Performance Table
  function updateLocalityTable(filtered) {
    const tbody = document.querySelector('#table-locality tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No matching property listings found for selected filters.</td></tr>`;
      return;
    }

    // Aggregate filtered records by locality & region
    const localityMap = {};

    filtered.forEach(r => {
      const key = `${r.locality}___${r.region}`;
      if (!localityMap[key]) {
        localityMap[key] = {
          locality: r.locality,
          region: r.region,
          bhk_set: new Set(),
          status_set: new Set(),
          count: 0,
          total_val: 0,
          sum_price_sqft: 0,
          sum_roi: 0,
          sum_volatility: 0
        };
      }
      const locObj = localityMap[key];
      locObj.bhk_set.add(r.bhk_category);
      locObj.status_set.add(r.status);
      locObj.count += r.count;
      locObj.total_val += r.total_valuation_crores;
      locObj.sum_price_sqft += r.avg_price_per_sqft * r.count;
      locObj.sum_roi += r.avg_roi * r.count;
      locObj.sum_volatility += r.avg_volatility * r.count;
    });

    // Convert map to array and sort by count descending
    const list = Object.values(localityMap)
      .map(item => ({
        locality: item.locality,
        region: item.region,
        bhk_summary: Array.from(item.bhk_set).sort().join(', '),
        status_summary: Array.from(item.status_set).join(', '),
        count: item.count,
        avg_price_lakhs: Math.round((item.total_val * 100) / item.count * 100) / 100,
        avg_price_per_sqft: Math.round(item.sum_price_sqft / item.count),
        avg_roi: Math.round((item.sum_roi / item.count) * 100) / 100,
        avg_volatility: Math.round((item.sum_volatility / item.count) * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 75);

    list.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${l.locality}</strong>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
            ${l.bhk_summary} &bull; ${l.status_summary}
          </div>
        </td>
        <td><span class="table-tag tag-blue">${l.region}</span></td>
        <td>${l.count.toLocaleString()}</td>
        <td>₹${l.avg_price_lakhs} L</td>
        <td>₹${l.avg_price_per_sqft.toLocaleString()}</td>
        <td><span class="table-tag tag-emerald">${l.avg_roi}%</span></td>
        <td><span class="table-tag tag-amber">${l.avg_volatility}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 6. Update Region Volume Bar Chart
  function updateRegionChart(filtered) {
    const ctx = document.getElementById('chart-region-volume')?.getContext('2d');
    if (!ctx) return;

    const regionCounts = {};
    filtered.forEach(r => {
      regionCounts[r.region] = (regionCounts[r.region] || 0) + r.count;
    });

    const topRegions = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (chartInstances.region) {
      chartInstances.region.destroy();
    }

    chartInstances.region = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topRegions.map(r => r.region),
        datasets: [{
          label: 'Properties Listed',
          data: topRegions.map(r => r.count),
          backgroundColor: '#10B981',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } }
        }
      }
    });
  }

  // 7. Update Property Type Donut Chart
  function updateTypeChart(filtered) {
    const ctx = document.getElementById('chart-property-type')?.getContext('2d');
    if (!ctx) return;

    const typeCounts = {};
    filtered.forEach(r => {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + r.count;
    });

    const types = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    if (chartInstances.type) {
      chartInstances.type.destroy();
    }

    chartInstances.type = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: types.map(t => t.type),
        datasets: [{
          data: types.map(t => t.count),
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'],
          borderWidth: 2,
          borderColor: '#1E293B'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: '#F8FAFC', font: { size: 12 } } } }
      }
    });
  }

  // 8. Update Price Segment Bar Chart
  function updatePriceSegmentChart(filtered) {
    const ctx = document.getElementById('chart-price-segment')?.getContext('2d');
    if (!ctx) return;

    const segCounts = {};
    filtered.forEach(r => {
      segCounts[r.price_segment] = (segCounts[r.price_segment] || 0) + r.count;
    });

    const order = ['Budget (< 50L)', 'Mid-Segment (50L - 1.5Cr)', 'Premium (1.5Cr - 3Cr)', 'Luxury (> 3Cr)'];
    const segments = order.map(seg => ({ price_segment: seg, count: segCounts[seg] || 0 }));

    if (chartInstances.priceSeg) {
      chartInstances.priceSeg.destroy();
    }

    chartInstances.priceSeg = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: segments.map(s => s.price_segment),
        datasets: [{
          label: 'Total Properties',
          data: segments.map(s => s.count),
          backgroundColor: '#3B82F6',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } }
        }
      }
    });
  }

  // 9. Update BHK Configuration Chart
  function updateBHKChart(filtered) {
    const ctx = document.getElementById('chart-bhk-summary')?.getContext('2d');
    if (!ctx) return;

    const bhkMap = {};
    filtered.forEach(r => {
      if (!bhkMap[r.bhk_category]) {
        bhkMap[r.bhk_category] = { bhk: r.bhk_category, count: 0, val: 0, sum_sqft: 0 };
      }
      const b = bhkMap[r.bhk_category];
      b.count += r.count;
      b.val += r.total_valuation_crores;
      b.sum_sqft += r.avg_price_per_sqft * r.count;
    });

    const order = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
    const list = order.map(cat => {
      const item = bhkMap[cat] || { count: 0, val: 0, sum_sqft: 0 };
      return {
        bhk_category: cat,
        avg_price_lakhs: item.count ? Math.round((item.val * 100) / item.count * 100) / 100 : 0,
        avg_price_per_sqft: item.count ? Math.round(item.sum_sqft / item.count) : 0
      };
    });

    if (chartInstances.bhk) {
      chartInstances.bhk.destroy();
    }

    chartInstances.bhk = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: list.map(b => b.bhk_category),
        datasets: [
          {
            label: 'Avg Price (Lakhs)',
            data: list.map(b => b.avg_price_lakhs),
            backgroundColor: '#10B981',
            borderRadius: 4
          },
          {
            label: 'Avg Price / SqFt (₹)',
            data: list.map(b => b.avg_price_per_sqft),
            backgroundColor: '#8B5CF6',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#F8FAFC' } } },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } }
        }
      }
    });
  }

  // 10. Update Top Localities by Price / SqFt Chart
  function updateTopLocalitiesChart(filtered) {
    const ctx = document.getElementById('chart-top-localities')?.getContext('2d');
    if (!ctx) return;

    const locMap = {};
    filtered.forEach(r => {
      if (!locMap[r.locality]) {
        locMap[r.locality] = { locality: r.locality, count: 0, sum_sqft: 0 };
      }
      locMap[r.locality].count += r.count;
      locMap[r.locality].sum_sqft += r.avg_price_per_sqft * r.count;
    });

    const topLocs = Object.values(locMap)
      .map(l => ({ locality: l.locality, avg_price_per_sqft: Math.round(l.sum_sqft / l.count) }))
      .sort((a, b) => b.avg_price_per_sqft - a.avg_price_per_sqft)
      .slice(0, 10);

    if (chartInstances.topLoc) {
      chartInstances.topLoc.destroy();
    }

    chartInstances.topLoc = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topLocs.map(l => l.locality),
        datasets: [{
          label: 'Avg Price / SqFt (₹)',
          data: topLocs.map(l => l.avg_price_per_sqft),
          backgroundColor: '#F59E0B',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } }
        }
      }
    });
  }

  // 11. Update ROI vs Volatility Scatter Plot
  function updateScatterChart(filtered) {
    const ctx = document.getElementById('chart-roi-volatility')?.getContext('2d');
    if (!ctx) return;

    const locMap = {};
    filtered.forEach(r => {
      const key = `${r.locality}___${r.region}`;
      if (!locMap[key]) {
        locMap[key] = { locality: r.locality, region: r.region, count: 0, sum_roi: 0, sum_vol: 0 };
      }
      locMap[key].count += r.count;
      locMap[key].sum_roi += r.avg_roi * r.count;
      locMap[key].sum_vol += r.avg_volatility * r.count;
    });

    const points = Object.values(locMap).slice(0, 150).map(l => ({
      x: Math.round((l.sum_vol / l.count) * 100) / 100,
      y: Math.round((l.sum_roi / l.count) * 100) / 100,
      locality: l.locality,
      region: l.region
    }));

    if (chartInstances.scatter) {
      chartInstances.scatter.destroy();
    }

    chartInstances.scatter = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Localities (ROI vs Risk)',
          data: points,
          backgroundColor: '#10B981',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const raw = ctx.raw;
                return `${raw.locality} (${raw.region}): Volatility ${raw.x}, ROI ${raw.y}%`;
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Market Volatility Score', color: '#94A3B8' }, ticks: { color: '#94A3B8' }, grid: { color: '#334155' } },
          y: { title: { display: true, text: 'Expected ROI %', color: '#94A3B8' }, ticks: { color: '#94A3B8' }, grid: { color: '#334155' } }
        }
      }
    });
  }

  // 12. Main Global Filter Application
  function applyGlobalFilters() {
    const filtered = getFilteredRecords();
    const kpis = computeKPIs(filtered);

    updateKPIs(kpis);
    updateLocalityTable(filtered);
    updateRegionChart(filtered);
    updateTypeChart(filtered);
    updatePriceSegmentChart(filtered);
    updateBHKChart(filtered);
    updateTopLocalitiesChart(filtered);
    updateScatterChart(filtered);
  }

  // 13. Tab Navigation
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(`tab-${target}`).classList.add('active');
      });
    });
  }

  // Initial Execution
  initFilters();
  initTabs();
  applyGlobalFilters();
});
