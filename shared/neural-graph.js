        (function() {
        const CONFIG = window.NEURAL_GRAPH_CONFIG || {};
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d', {alpha: true});
        const infoPanel = document.getElementById('info');
        const panelToggle = document.getElementById('panel-toggle');

        const PANEL_WIDTH = 240;
        let panelOpen = true;

        function getCanvasWidth() {
            if (window.innerWidth <= 768) return window.innerWidth;
            return panelOpen ? window.innerWidth - PANEL_WIDTH : window.innerWidth;
        }
        function resizeCanvas() {
            canvas.width = getCanvasWidth();
            canvas.height = window.innerHeight;
            if (canvas.style) canvas.style.marginRight = window.innerWidth <= 768 ? '0' : (panelOpen ? PANEL_WIDTH + 'px' : '0');
        }
        function togglePanel() {
            panelOpen = !panelOpen;
            infoPanel.classList.toggle('collapsed', !panelOpen);
            panelToggle.textContent = panelOpen ? '‹' : '›';
            panelToggle.setAttribute('aria-label', panelOpen ? 'Collapse panel' : 'Expand panel');
            resizeCanvas();
        }

        resizeCanvas();
        panelToggle.addEventListener('click', togglePanel);

        window.addEventListener('resize', function() {
            resizeCanvas();
        });
        window.addEventListener('orientationchange', function() {
            setTimeout(resizeCanvas, 100);
        });

        const categoryColors = CONFIG.categoryColors || {
            'activity': '#00ffff', 'person': '#ff00aa', 'location': '#00ff88',
            'emotion': '#aa00ff', 'temporal': '#ffaa00', 'region': '#8800ff'
        };

        let nodes = [];
        let edges = [];

        function useFallbackGraph() {
            nodes = CONFIG.fallbackNodes || [
                { id: 0, name: 'Paul', type: 'person', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 10, color: '#FF6B6B', glow: 22, freq: 100, desc: 'Urban Runner, digital nomad' },
                { id: 1, name: 'Volleyball', type: 'activity', x: 80, y: -60, z: 40, vx: 0, vy: 0, vz: 0, size: 9, color: '#00ffff', glow: 20, freq: 50, desc: '18 years of competition, flow state' },
                { id: 2, name: 'Bangkok', type: 'location', x: -70, y: 50, z: -50, vx: 0, vy: 0, vz: 0, size: 8, color: '#00ff88', glow: 18, freq: 40, desc: 'Primary base, Urban Runner epicenter' }
            ];
            edges = CONFIG.fallbackEdges || [
                { from: 0, to: 1, weight: 8 },
                { from: 0, to: 2, weight: 7 },
                { from: 1, to: 2, weight: 6 }
            ];
            populateFilterList();
            render();
            if (nodes.length > 0) {
                selected = Math.floor(Math.random() * nodes.length);
                showNodeDetails(nodes[selected]);
            }
        }

        // Map raw nodes/synapses JSON to internal graph format (shared by initial load and time-travel).
        function mapRawToGraph(rawNodes, rawSynapses) {
            const todayStr = new Date().toISOString().slice(0, 10);
            const today = new Date();
            const todayMoment = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'][today.getMonth()] + '-' + String(today.getDate()).padStart(2, '0') + '-' + today.getFullYear();
            const memoryRefColor = categoryColors.memoryReference || '#fbbf24';
            const mappedNodes = rawNodes.map((n, idx) => {
                const angle = (idx / rawNodes.length) * Math.PI * 2;
                const radius = 280 + Math.random() * 220;
                const x = Math.cos(angle) * radius;
                const y = (Math.random() - 0.5) * 500;
                const z = Math.sin(angle) * radius;
                const baseSize = n.category === 'region' ? 12 : 6;
                const sizeBoost = n.category === 'region' ? 3 : 1;
                const size = baseSize + (n.frequency / 85) * 10 * sizeBoost;
                const glow = size * 2.5;
                const isMemoryRef = n.attributes?.type === 'memory-reference';
                const color = isMemoryRef ? memoryRefColor : (categoryColors[n.category] || n.attributes?.color || '#00ffff');
                const isToday = !!(n.temporal_activations && n.temporal_activations.some(ta => ta.timestamp && ta.timestamp.slice(0, 10) === todayStr))
                    || !!(n.moments && n.moments.length && n.moments.some(m => String(m).toLowerCase().replace(/\s/g, '') === todayMoment.toLowerCase()));
                return {
                    id: idx,
                    idKey: n.id,
                    name: n.label,
                    type: n.category,
                    x, y, z,
                    vx: 0, vy: 0, vz: 0,
                    size,
                    glow,
                    color,
                    freq: n.frequency,
                    desc: n.attributes?.description || '',
                    isToday,
                    sourceDocument: n.sourceDocument || null,
                    isMemoryRef: !!isMemoryRef,
                    target_memory: isMemoryRef ? (n.attributes?.target_memory || '') : undefined,
                    memory_owner: isMemoryRef ? (n.attributes?.memory_owner || '') : undefined,
                    fingerprint_url: isMemoryRef ? (n.attributes?.fingerprint_url || '') : undefined
                };
            });
            const mappedEdges = rawSynapses.map(s => {
                const fromIdx = mappedNodes.findIndex(n => n.idKey === s.source);
                const toIdx = mappedNodes.findIndex(n => n.idKey === s.target);
                if (fromIdx >= 0 && toIdx >= 0) {
                    return { from: fromIdx, to: toIdx, weight: Math.round(s.weight * 10) };
                }
                return null;
            }).filter(e => e !== null);
            return { nodes: mappedNodes, edges: mappedEdges };
        }

        // Load graph: one code path. Uses loadMemory('latest') then inits History UI.
        async function loadGraphData() {
            if (window.location.protocol === 'file:') {
                console.info('Serving from file:// — use a local server (e.g. npx serve) or GitHub Pages to load full data.');
                useFallbackGraph();
                return;
            }
            try {
                const ok = await loadMemory('latest');
                if (ok) console.log(`✅ Loaded ${nodes.length} neurons and ${edges.length} synapses`);
                initTimelineUI();
            } catch (e) {
                console.error('❌ Graph data fetch FAILED:', e.message, e);
                console.log('Attempted to fetch: ./data/nodes.json?t=' + Date.now());
                console.log('Window location:', window.location.href);
                useFallbackGraph();
            }
        }

        let currentTimelineView = null; // null = latest (current), string = commit hash when viewing past
        let timelineCache = null; // timeline.json entries for hash → commit resolution

        function setTimelineActive(commitOrLatest) {
            const container = document.getElementById('timeline-body');
            if (!container) return;
            container.querySelectorAll('.timeline-entry').forEach(btn => {
                const isLatest = btn.dataset.latest === 'true';
                const match = commitOrLatest === null ? isLatest : (!isLatest && btn.dataset.commit === commitOrLatest);
                btn.classList.toggle('active', !!match);
            });
        }

        // Apply loaded graph data to visualization (single code path for all sources).
        function applyGraph(rawNodes, rawSynapses, viewState) {
            if (!rawNodes || !rawNodes.length || !rawSynapses) return;
            const { nodes: n, edges: e } = mapRawToGraph(rawNodes, rawSynapses);
            nodes = n;
            edges = e;
            currentTimelineView = viewState;
            setTimelineActive(viewState);
            populateFilterList();
            render();
            showNodeDetails(null);
        }

        /**
         * Load memory and update the visualization. Single abstraction for all sources.
         * @param {string|{ commit: string }|{ hash: string }} source - 'latest' | null | { commit } | { hash (master hash) }
         * @returns {Promise<boolean>} - true if loaded, false on error
         */
        async function loadMemory(source) {
            const isLatest = source === 'latest' || source == null;
            const commit = source && source.commit;
            const hash = source && source.hash;
            try {
                let rawNodes, rawSynapses;
                if (isLatest) {
                    const [nodesRes, synapsesRes] = await Promise.all([
                        fetch('./data/nodes.json?t=' + Date.now()),
                        fetch('./data/synapses.json?t=' + Date.now())
                    ]);
                    if (!nodesRes.ok || !synapsesRes.ok) throw new Error('Fetch failed');
                    rawNodes = await nodesRes.json();
                    rawSynapses = await synapsesRes.json();
                    applyGraph(rawNodes, rawSynapses, null);
                    console.log('✅ Loaded latest memory');
                    return true;
                }
                if (commit) {
                    const base = CONFIG.rawOrigin && CONFIG.rawCommitBase;
                    if (!base) throw new Error('rawOrigin/rawCommitBase not set');
                    const baseUrl = CONFIG.rawOrigin + '/' + commit + '/' + CONFIG.rawCommitBase;
                    const [nodesRes, synapsesRes] = await Promise.all([
                        fetch(baseUrl + '/nodes.json'),
                        fetch(baseUrl + '/synapses.json')
                    ]);
                    if (!nodesRes.ok || !synapsesRes.ok) throw new Error('Fetch failed');
                    rawNodes = await nodesRes.json();
                    rawSynapses = await synapsesRes.json();
                    applyGraph(rawNodes, rawSynapses, commit);
                    console.log('✅ Loaded memory at commit ' + commit.slice(0, 7));
                    return true;
                }
                if (hash) {
                    const timeline = timelineCache || await fetch('./data/timeline.json?t=' + Date.now()).then(r => r.ok ? r.json() : []).catch(() => []);
                    if (timelineCache == null) timelineCache = Array.isArray(timeline) ? timeline : [];
                    const entry = timelineCache.find(e => e.hash === hash || (e.hash && e.hash.startsWith(hash)));
                    if (!entry) {
                        console.error('No timeline entry for hash:', hash);
                        return false;
                    }
                    return loadMemory({ commit: entry.commit });
                }
                return false;
            } catch (err) {
                console.error('loadMemory failed:', err);
                if (commit) alert('Could not load memory at this commit. It may not exist at that ref.');
                return false;
            }
        }

        // One-click return from time-travel.
        function loadLatestMemory() { return loadMemory('latest'); }
        function loadMemoryAtCommit(commit) { return loadMemory({ commit }); }

        // Build History (time-travel) UI from timeline.json when CONFIG.rawCommitBase is set.
        // Initial load is always latest (quick); user can go back in time via History.
        function initTimelineUI() {
            if (!CONFIG.rawCommitBase || !CONFIG.rawOrigin) return;
            fetch('./data/timeline.json?t=' + Date.now())
                .then(r => r.ok ? r.json() : Promise.reject())
                .then(timeline => {
                    if (!Array.isArray(timeline) || timeline.length === 0) return;
                    timelineCache = timeline;
                    const panelButtons = document.querySelector('.panel-buttons');
                    if (!panelButtons) return;
                    const section = document.createElement('div');
                    section.className = 'filter-section';
                    section.setAttribute('role', 'region');
                    section.setAttribute('aria-label', 'Memory history');
                    const trigger = document.createElement('button');
                    trigger.type = 'button';
                    trigger.className = 'collapsible-trigger';
                    trigger.setAttribute('aria-expanded', 'false');
                    trigger.setAttribute('aria-controls', 'timeline-body');
                    trigger.setAttribute('data-accordion-body', 'timeline-body');
                    trigger.innerHTML = '<span>History</span> <span id="timeline-chevron">▼</span>';
                    const body = document.createElement('div');
                    body.id = 'timeline-body';
                    body.className = 'collapsible-body timeline-body accordion-body';
                    body.setAttribute('role', 'region');
                    body.setAttribute('aria-label', 'Timeline entries');
                    // Latest (current) first — quick to load, easy to return to
                    const latestBtn = document.createElement('button');
                    latestBtn.type = 'button';
                    latestBtn.className = 'filter-btn timeline-entry active';
                    latestBtn.style.display = 'block';
                    latestBtn.style.width = '100%';
                    latestBtn.style.textAlign = 'left';
                    latestBtn.style.marginBottom = '4px';
                    latestBtn.dataset.latest = 'true';
                    latestBtn.textContent = 'Latest (current)';
                    latestBtn.addEventListener('click', () => loadLatestMemory());
                    body.appendChild(latestBtn);
                    const ordered = timeline.slice().reverse();
                    ordered.forEach((entry) => {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'filter-btn timeline-entry';
                        btn.style.display = 'block';
                        btn.style.width = '100%';
                        btn.style.textAlign = 'left';
                        btn.style.marginBottom = '4px';
                        const ts = entry.timestamp ? entry.timestamp.replace(/ \+0700$/, '') : '';
                        btn.textContent = (ts ? ts + ' — ' : '') + entry.neurons + ' neurons · ' + entry.synapses + ' synapses';
                        btn.dataset.commit = entry.commit;
                        btn.addEventListener('click', () => loadMemoryAtCommit(entry.commit));
                        body.appendChild(btn);
                    });
                    section.appendChild(trigger);
                    section.appendChild(body);
                    const actionsSection = document.getElementById('actions-toggle');
                    const insertTarget = actionsSection ? actionsSection.closest('.filter-section') : null;
                    if (insertTarget && insertTarget.parentNode) {
                        insertTarget.parentNode.insertBefore(section, insertTarget);
                    } else {
                        panelButtons.parentNode.insertBefore(section, panelButtons);
                    }
                })
                .catch(() => {});
        }

        let camera = {angle: 0.5, dist: 680, height: 0, pitch: 0};
        let viewZoom = 1;   // 2D scale of the graph (zoom in = focus on nodes, zoom out = big picture)
        const VIEW_ZOOM_MIN = 0.25;
        const VIEW_ZOOM_MAX = 5;
        let selected = null;
        let time = 0;
        let particles = [];

        function project(x, y, z) {
            const cos = Math.cos(camera.angle);
            const sin = Math.sin(camera.angle);
            const rx = x * cos - z * sin;
            const rz = x * sin + z * cos;
            const cp = Math.cos(camera.pitch);
            const sp = Math.sin(camera.pitch);
            const viewY = y * cp - rz * sp;
            const viewZ = y * sp + rz * cp;
            const scale = camera.dist / (camera.dist + viewZ + 200);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            let sx = cx + rx * scale;
            let sy = cy + (viewY + camera.height) * scale;
            // Apply 2D view zoom around center (so pinch/scroll scales the whole graph)
            sx = cx + (sx - cx) * viewZoom;
            sy = cy + (sy - cy) * viewZoom;
            return {
                x: sx,
                y: sy,
                z: viewZ,
                scale: Math.max(0.1, scale) * viewZoom
            };
        }

        function step() {
            // Kill all movement - nodes stay in place
            nodes.forEach(n => {
                n.vx = 0;
                n.vy = 0;
                n.vz = 0;
            });
        }

        function render() {
            try {
                time++;
                
                ctx.fillStyle = '#0a1128';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const sorted = nodes.map(n => {
                    const p = project(n.x, n.y, n.z);
                    return {node: n, proj: p};
                }).sort((a, b) => a.proj.z - b.proj.z);

                // When a node is selected, only it and its connections stay bright
                let activeNodeIds = null;
                if (selected !== null) {
                    activeNodeIds = new Set([selected]);
                    edges.forEach(e => {
                        if (e.from === selected) activeNodeIds.add(e.to);
                        if (e.to === selected) activeNodeIds.add(e.from);
                    });
                }

                // Helper to check if node passes current filter
                const typeForFilter = (CONFIG.filterToType && CONFIG.filterToType[currentFilter]) || currentFilter;
                const passesFilter = (nodeIndex) => {
                    const n = nodes[nodeIndex];
                    if (currentFilter === 'all') return true;
                    if (currentFilter === 'today') return n.isToday === true;
                    return ((n.type || '').toLowerCase() === (typeForFilter || '').toLowerCase());
                };

                // Draw synapses with triple glow
                edges.forEach(e => {
                    // Skip edges if either node is filtered out
                    if (!passesFilter(e.from) || !passesFilter(e.to)) return;
                    
                    const p1 = project(nodes[e.from].x, nodes[e.from].y, nodes[e.from].z);
                    const p2 = project(nodes[e.to].x, nodes[e.to].y, nodes[e.to].z);
                    const isConnected = selected !== null && (e.from === selected || e.to === selected);
                    const strength = 0.4 + (e.weight / 15) * 0.6;
                    
                    if (isConnected) {
                        // Highlight: connected to selected node — yellow/white glow on top
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.strokeStyle = 'rgba(255, 255, 200, 0.35)';
                        ctx.lineWidth = Math.max(8, e.weight / 1.5) + 4;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        ctx.strokeStyle = 'rgba(255, 255, 150, 0.7)';
                        ctx.lineWidth = Math.max(3, e.weight / 2.5) + 1;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        ctx.strokeStyle = '#ffff88';
                        ctx.lineWidth = Math.max(1.5, e.weight / 4);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    } else {
                        // Not connected to selected — dim like non-selected nodes
                        const edgeDimAlpha = activeNodeIds !== null ? 0.22 : 1;
                        ctx.globalAlpha = edgeDimAlpha;
                        ctx.strokeStyle = `rgba(0, 100, 255, ${strength * 0.2})`;
                        ctx.lineWidth = Math.max(4, e.weight / 2.5) + 2;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        ctx.strokeStyle = `rgba(0, 200, 255, ${strength * 0.4})`;
                        ctx.lineWidth = Math.max(2, e.weight / 3.5) + 1;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        ctx.strokeStyle = `rgba(0, 255, 255, ${strength})`;
                        ctx.lineWidth = Math.max(0.5, e.weight / 5);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                });

                // Draw neurons
                const dimAlpha = 0.22;
                sorted.forEach(item => {
                    const n = item.node;
                    const p = item.proj;
                    
                    // Filter logic: check if node should be visible
                    if (currentFilter === 'today' && !n.isToday) return;
                    if (currentFilter === 'memorylinks') {
                        if (!n.isMemoryRef) return;
                    } else if (currentFilter !== 'all') {
                        const typeForFilterNode = (CONFIG.filterToType && CONFIG.filterToType[currentFilter]) || currentFilter;
                        if ((n.type || '').toLowerCase() !== (typeForFilterNode || '').toLowerCase()) return;
                    }
                    
                    const r = n.size * p.scale;
                    let glow = n.glow * p.scale;
                    if (n.isMemoryRef) {
                        const pulse = 1 + 0.15 * Math.sin(time * 0.08);
                        glow *= pulse;
                    }
                    const isDimmed = activeNodeIds !== null && !activeNodeIds.has(n.id);
                    if (isDimmed) ctx.globalAlpha = dimAlpha;

                    // Outer halo
                    const g1 = ctx.createRadialGradient(p.x, p.y, r*0.5, p.x, p.y, glow*2);
                    const [r2, g2, b2] = [
                        parseInt(n.color.slice(1,3), 16),
                        parseInt(n.color.slice(3,5), 16),
                        parseInt(n.color.slice(5,7), 16)
                    ];
                    g1.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, 0.6)`);
                    g1.addColorStop(0.5, `rgba(${r2}, ${g2}, ${b2}, 0.15)`);
                    g1.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0)`);
                    ctx.fillStyle = g1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, glow*2, 0, 6.28);
                    ctx.fill();

                    // Inner glow
                    const g2_grad = ctx.createRadialGradient(p.x, p.y, r*0.2, p.x, p.y, glow);
                    g2_grad.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, 1)`);
                    g2_grad.addColorStop(0.5, `rgba(${r2}, ${g2}, ${b2}, 0.4)`);
                    g2_grad.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0)`);
                    ctx.fillStyle = g2_grad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, glow, 0, 6.28);
                    ctx.fill();

                    // Core neuron
                    ctx.fillStyle = n.color;
                    ctx.shadowColor = n.color;
                    ctx.shadowBlur = 25;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r, 0, 6.28);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Selection highlight
                    if (selected === n.id) {
                        ctx.strokeStyle = '#ffff00';
                        ctx.lineWidth = 4;
                        ctx.globalAlpha = 0.9;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, r + 12, 0, 6.28);
                        ctx.stroke();
                        
                        // Pulsing ring
                        const pulse = Math.sin(time * 0.05) * 0.3 + 0.7;
                        ctx.strokeStyle = `rgba(255, 255, 0, ${pulse * 0.6})`;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, r + 20, 0, 6.28);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }

                    // Label with glow
                    ctx.fillStyle = n.color;
                    ctx.font = 'bold 10px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = n.color;
                    ctx.shadowBlur = 10;
                    ctx.globalAlpha = isDimmed ? dimAlpha * 0.9 : 0.85;
                    ctx.fillText(n.name, p.x, p.y + r + 18);
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                });

                document.getElementById('count').textContent = nodes.length;
                document.getElementById('synapseCount').textContent = edges.length;
                document.getElementById('status').textContent = selected !== null ? `🧠 ${nodes[selected].name}` : '—';

                step();
                requestAnimationFrame(render);
            } catch (e) {
                console.error('Render error:', e);
            }
        }

        // Filter bar functionality (desktop + drawer stay in sync)
        let currentFilter = 'all';
        function setActiveFilter(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.filter === currentFilter);
            });
        }
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setActiveFilter(btn.dataset.filter);
                console.log('Filter applied:', currentFilter);
            });
        });
        
        // Mobile drawer: open/close via button only (no swipe)
        let drawerOpen = false;
        const drawer = document.getElementById('bottomDrawer');
        
        function setDrawerOpen(open) {
            drawerOpen = open;
            const canvas = document.getElementById('canvas');
            const btn = document.getElementById('drawer-toggle');
            const scrim = document.getElementById('drawerScrim');
            if (open) {
                drawer.classList.add('open');
                drawer.style.transform = '';
                if (canvas) canvas.classList.add('drawer-open');
                if (btn) { btn.textContent = '✕'; btn.setAttribute('aria-label', 'Close'); }
                if (scrim) { scrim.classList.add('is-open'); scrim.setAttribute('aria-hidden', 'false'); }
            } else {
                drawer.classList.remove('open');
                drawer.style.transform = '';
                if (canvas) canvas.classList.remove('drawer-open');
                if (btn) { btn.textContent = '▲'; btn.setAttribute('aria-label', 'Open details'); }
                if (scrim) { scrim.classList.remove('is-open'); scrim.setAttribute('aria-hidden', 'true'); }
            }
        }
        
        document.getElementById('drawer-toggle').addEventListener('click', () => {
            if (window.innerWidth > 768) return;
            const willOpen = !drawerOpen;
            setDrawerOpen(willOpen);
            if (willOpen && selected !== null && nodes[selected]) showNodeDetailsInDrawer(nodes[selected]);
        });
        document.getElementById('drawerScrim').addEventListener('click', () => {
            if (window.innerWidth > 768) return;
            setDrawerOpen(false);
        });
        
        // Filter buttons in drawer (setActiveFilter keeps bar + drawer in sync)
        document.querySelectorAll('#drawerFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => setActiveFilter(btn.dataset.filter));
        });

        canvas.addEventListener('click', e => {
            if (hitTestNode(e.clientX, e.clientY)) {
                // Update URL hash for deep linking; on mobile open drawer for non-memory-ref nodes (memory-ref opens sidebar in hitTestNode)
                if (selected !== null) {
                    const selectedNode = nodes[selected];
                    window.location.hash = selectedNode.idKey;
                    if (window.innerWidth <= 768 && !selectedNode.isMemoryRef) {
                        setDrawerOpen(true);
                        showNodeDetailsInDrawer(selectedNode);
                    }
                }
            }
        });
        
        // Helper: build drawer content from node data (no dependency on hidden #detailPanel).
        // Fixes mobile Android where reading from display:none panel can leave drawer empty.
        function showNodeDetailsInDrawer(node) {
            const content = document.getElementById('drawerDetails');
            if (!content) return;
            if (!node) {
                content.innerHTML = '<p class="drawer-detail-desc" style="color: rgba(255,255,255,0.6);">Select a node on the graph to see details.</p>';
                return;
            }
            // Keep desktop panel in sync for URL/hash and full-context button
            showNodeDetails(node);
            let nameHtml, typeText, descText, connectionsHtml;
            if (node.type === 'person' && characterProfiles[node.idKey]) {
                const char = characterProfiles[node.idKey];
                nameHtml = `<img src="${char.avatar}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px;" alt="${char.name}"><span style="color: #fbbf24; font-weight: bold;">${escapeHtml(char.name)}</span>`;
                typeText = char.role || '';
                descText = char.bio || '';
                if (char.episodes && char.episodes.length > 0) {
                    connectionsHtml = '<p style="color: #00ffff; font-weight: bold; margin-top: 12px;">Episodes:</p>' +
                        char.episodes.map(ep => `<div style="margin: 4px 0; color: #fbbf24; font-size: 10px;">${escapeHtml(ep)}</div>`).join('');
                } else {
                    connectionsHtml = '<div style="color: #666; font-size: 10px;">No episodes linked</div>';
                }
            } else {
                nameHtml = escapeHtml(node.name);
                typeText = `Type: ${(node.type || '').charAt(0).toUpperCase() + (node.type || '').slice(1)}`;
                descText = node.desc || '';
                const connected = [];
                edges.forEach(e => {
                    if (e.from === node.id) {
                        const target = nodes[e.to];
                        if (target) connected.push(`→ ${escapeHtml(target.name)} (${target.type})`);
                    } else if (e.to === node.id) {
                        const source = nodes[e.from];
                        if (source) connected.push(`← ${escapeHtml(source.name)} (${source.type})`);
                    }
                });
                connectionsHtml = connected.length > 0
                    ? connected.map(c => `<div style="margin: 4px 0; color: #00ffff;">${c}</div>`).join('')
                    : '<div style="color: #666;">No connections</div>';
            }
            content.innerHTML = `
                <h3 class="drawer-detail-heading">Info</h3>
                <div class="drawer-detail-name">${nameHtml}</div>
                <p class="drawer-detail-type">${escapeHtml(typeText)}</p>
                <p class="drawer-detail-desc">${escapeHtml(descText)}</p>
                <p class="drawer-detail-connections-heading">Connected to</p>
                <div class="drawer-detail-connections">${connectionsHtml}</div>
            `;
        }
        function escapeHtml(s) {
            if (s == null) return '';
            const div = document.createElement('div');
            div.textContent = s;
            return div.innerHTML;
        }

        // Handle URL hash navigation (back/forward, direct link, or in-page hash change)
        function handleHashNavigation() {
            const hash = window.location.hash.substring(1).trim();
            if (hash && nodes.length > 0) {
                const nodeIndex = nodes.findIndex(n => n.idKey === hash);
                if (nodeIndex !== -1) {
                    selected = nodeIndex;
                    const node = nodes[selected];
                    if (node.isMemoryRef) {
                        openMemoryLinkSidebar(node);
                    } else {
                        showNodeDetails(node);
                        if (window.innerWidth <= 768) {
                            setDrawerOpen(true);
                            showNodeDetailsInDrawer(node);
                        }
                    }
                }
            }
        }

        // Listen for hash changes (back/forward buttons, direct URL visits)
        window.addEventListener('hashchange', handleHashNavigation);

        // On load: hash selects node by id (e.g. #paul), no hash = random node
        loadGraphData().then(() => {
            if (window.location.hash) handleHashNavigation();
            if (selected === null && nodes.length > 0) {
                selected = Math.floor(Math.random() * nodes.length);
                showNodeDetails(nodes[selected]);
            }
        });

        window.clearSelection = () => {
            selected = null;
            showNodeDetails(null);
            window.location.hash = '';
        };
        
        let characterProfiles = {};
        async function loadCharacterProfiles() {
            const url = CONFIG.characterProfilesUrl;
            if (!url) return;
            try {
                const response = await fetch(url);
                if (!response.ok) return;
                const text = await response.text();
                // Parse characters array from the JS file
                const match = text.match(/const characters = \[([\s\S]*?)\];/);
                if (match) {
                  eval('characterProfiles = ' + '[' + match[1] + ']');
                  // Build lookup by id
                  const profiles = {};
                  if (Array.isArray(characterProfiles)) {
                    characterProfiles.forEach(char => {
                      profiles[char.id] = char;
                    });
                  }
                  characterProfiles = profiles;
                }
            } catch (e) {
                console.warn('Could not load character profiles:', e);
            }
        }

        function showNodeDetails(node) {
            const panel = document.getElementById('detailPanel');
            const detailName = document.getElementById('detailName');
            const detailType = document.getElementById('detailType');
            const detailDesc = document.getElementById('detailDesc');
            const detailConnections = document.getElementById('detailConnections');
            
            const fullContextBtn = document.getElementById('full-context-btn');
            if (fullContextBtn) {
                fullContextBtn.disabled = !node || !node.sourceDocument;
                fullContextBtn.setAttribute('aria-label', node && node.sourceDocument ? 'View full context: ' + node.sourceDocument : 'Select a node with a source document');
            }
            if (!node) {
                panel.classList.add('is-empty');
                detailName.textContent = '';
                detailType.textContent = '';
                detailDesc.textContent = '';
                detailConnections.innerHTML = '';
                return;
            }
            
            panel.classList.remove('is-empty');
            
            // Check if this is a person node with character profile
            if (node.type === 'person' && characterProfiles[node.idKey]) {
                const char = characterProfiles[node.idKey];
                detailName.innerHTML = `<img src="${char.avatar}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px;" alt="${char.name}">
                                        <span style="color: #fbbf24; font-weight: bold;">${char.name}</span>`;
                detailType.textContent = `${char.role}`;
                detailDesc.textContent = char.bio;
                
                // Add episode links if available
                let connectionHTML = '';
                if (char.episodes && char.episodes.length > 0) {
                    connectionHTML += '<p style="color: #00ffff; font-weight: bold; margin-top: 12px;">Episodes:</p>';
                    connectionHTML += char.episodes.map(ep => 
                        `<div style="margin: 4px 0; color: #fbbf24; font-size: 10px;">${ep}</div>`
                    ).join('');
                }
                detailConnections.innerHTML = connectionHTML || '<div style="color: #666; font-size: 10px;">No episodes linked</div>';
            } else {
                // Standard node display
                detailName.textContent = node.name;
                detailType.textContent = `Type: ${node.type.charAt(0).toUpperCase() + node.type.slice(1)}`;
                detailDesc.textContent = node.desc;
                
                // Find connected nodes
                const connected = [];
                edges.forEach(e => {
                    if (e.from === node.id) {
                        const target = nodes[e.to];
                        connected.push(`→ ${target.name} (${target.type})`);
                    } else if (e.to === node.id) {
                        const source = nodes[e.from];
                        connected.push(`← ${source.name} (${source.type})`);
                    }
                });
                
                detailConnections.innerHTML = connected.length > 0 
                    ? connected.map(c => `<div style="margin: 4px 0; color: #00ffff;">${c}</div>`).join('')
                    : '<div style="color: #666;">No connections</div>';
            }
        }

        // Memory-link sidebar: created in JS so it works for both memory/ and claw/memory/
        let memoryLinkSidebarEl = null;
        let memoryLinkScrimEl = null;
        let memoryLinkEscapeHandler = null;

        function getMemoryLinkSidebar() {
            if (memoryLinkSidebarEl) return memoryLinkSidebarEl;
            const sidebar = document.createElement('div');
            sidebar.id = 'memory-link-sidebar';
            sidebar.setAttribute('role', 'dialog');
            sidebar.setAttribute('aria-labelledby', 'memory-link-sidebar-title');
            sidebar.innerHTML = `
                <div class="memory-link-sidebar-inner">
                    <button type="button" class="memory-link-sidebar-close" aria-label="Close">&times;</button>
                    <h3 id="memory-link-sidebar-title" class="memory-link-sidebar-title">Connected mind</h3>
                    <p class="memory-link-sidebar-url-wrap"><a id="memory-link-sidebar-url" href="#" target="_blank" rel="noopener" class="memory-link-sidebar-url"></a></p>
                    <p class="memory-link-sidebar-meta"><span class="memory-link-sidebar-label">Fingerprint:</span> <span id="memory-link-sidebar-fingerprint">—</span></p>
                    <p class="memory-link-sidebar-meta"><span class="memory-link-sidebar-label">Stats:</span> <span id="memory-link-sidebar-stats">—</span></p>
                    <button type="button" class="memory-link-sidebar-explore" id="memory-link-sidebar-explore">Explore Memory</button>
                </div>`;
            sidebar.style.cssText = 'position:fixed;top:0;right:0;width:280px;max-width:100%;height:100%;background:rgba(15,26,58,0.98);border-left:2px solid rgba(251,191,36,0.5);z-index:100;display:none;overflow-y:auto;';
            const style = document.createElement('style');
            style.textContent = `
                #memory-link-sidebar .memory-link-sidebar-inner { padding: 24px 20px; font-family: monospace; }
                #memory-link-sidebar .memory-link-sidebar-close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; line-height: 1; padding: 4px; }
                #memory-link-sidebar .memory-link-sidebar-close:hover { color: #fbbf24; }
                #memory-link-sidebar .memory-link-sidebar-title { color: #fbbf24; font-size: 16px; margin-bottom: 16px; }
                #memory-link-sidebar .memory-link-sidebar-url-wrap { margin-bottom: 12px; word-break: break-all; }
                #memory-link-sidebar .memory-link-sidebar-url { color: #06b6d4; text-decoration: none; }
                #memory-link-sidebar .memory-link-sidebar-url:hover { text-decoration: underline; }
                #memory-link-sidebar .memory-link-sidebar-meta { font-size: 11px; color: #94a3b8; margin-bottom: 8px; }
                #memory-link-sidebar .memory-link-sidebar-label { color: #64748b; }
                #memory-link-sidebar .memory-link-sidebar-explore { margin-top: 20px; padding: 10px 16px; background: rgba(251,191,36,0.2); border: 1px solid #fbbf24; color: #fbbf24; border-radius: 8px; cursor: pointer; font-family: inherit; font-weight: bold; }
                #memory-link-sidebar .memory-link-sidebar-explore:hover { background: rgba(251,191,36,0.35); }
                .memory-link-sidebar-scrim { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 99; display: none; }
            `;
            document.head.appendChild(style);
            const scrim = document.createElement('div');
            scrim.className = 'memory-link-sidebar-scrim';
            scrim.setAttribute('aria-hidden', 'true');
            document.body.appendChild(scrim);
            document.body.appendChild(sidebar);
            memoryLinkScrimEl = scrim;
            sidebar.querySelector('.memory-link-sidebar-close').addEventListener('click', closeMemoryLinkSidebar);
            scrim.addEventListener('click', closeMemoryLinkSidebar);
            document.getElementById('memory-link-sidebar-explore').addEventListener('click', () => {
                const url = document.getElementById('memory-link-sidebar-url').href;
                if (url && url !== '#') window.open(url, '_blank', 'noopener');
            });
            memoryLinkSidebarEl = sidebar;
            return sidebar;
        }

        function openMemoryLinkSidebar(node) {
            if (!node || !node.isMemoryRef || !node.target_memory) return;
            const sidebar = getMemoryLinkSidebar();
            const owner = (node.memory_owner || 'Unknown').replace(/^./, c => c.toUpperCase());
            document.getElementById('memory-link-sidebar-title').textContent = 'Connected mind: ' + owner;
            const urlEl = document.getElementById('memory-link-sidebar-url');
            urlEl.href = node.target_memory;
            urlEl.textContent = node.target_memory;
            document.getElementById('memory-link-sidebar-fingerprint').textContent = 'Loading…';
            document.getElementById('memory-link-sidebar-stats').textContent = 'Loading…';
            sidebar.style.display = 'block';
            memoryLinkScrimEl.style.display = 'block';
            memoryLinkScrimEl.setAttribute('aria-hidden', 'false');
            memoryLinkEscapeHandler = function(e) { if (e.key === 'Escape') closeMemoryLinkSidebar(); };
            document.addEventListener('keydown', memoryLinkEscapeHandler);
            const fpUrl = node.fingerprint_url;
            if (fpUrl) {
                fetch(fpUrl).then(r => r.ok ? r.json() : Promise.reject(new Error(r.statusText)))
                    .then(data => {
                        const hash = (data.hash || data.masterHash || '—').toString();
                        document.getElementById('memory-link-sidebar-fingerprint').textContent = hash.length > 20 ? hash.slice(0, 20) + '…' : hash;
                        document.getElementById('memory-link-sidebar-fingerprint').title = hash;
                        const neurons = data.neurons != null ? data.neurons : '—';
                        const synapses = data.synapses != null ? data.synapses : '—';
                        document.getElementById('memory-link-sidebar-stats').textContent = neurons + ' neurons · ' + synapses + ' synapses';
                    })
                    .catch(() => {
                        document.getElementById('memory-link-sidebar-fingerprint').textContent = '—';
                        document.getElementById('memory-link-sidebar-stats').textContent = 'Could not load stats';
                    });
            } else {
                document.getElementById('memory-link-sidebar-fingerprint').textContent = '—';
                document.getElementById('memory-link-sidebar-stats').textContent = '—';
            }
        }

        function closeMemoryLinkSidebar() {
            if (!memoryLinkSidebarEl) return;
            memoryLinkSidebarEl.style.display = 'none';
            if (memoryLinkScrimEl) {
                memoryLinkScrimEl.style.display = 'none';
                memoryLinkScrimEl.setAttribute('aria-hidden', 'true');
            }
            if (memoryLinkEscapeHandler) {
                document.removeEventListener('keydown', memoryLinkEscapeHandler);
                memoryLinkEscapeHandler = null;
            }
        }

        // Mobile drawer management
        function openDrawer() {
            const info = document.getElementById('info');
            const canvas = document.getElementById('canvas');
            if (window.innerWidth <= 768) {
                info.classList.add('open');
                canvas.classList.add('drawer-open');
            }
        }

        function closeDrawer() {
            const info = document.getElementById('info');
            const canvas = document.getElementById('canvas');
            info.classList.remove('open');
            canvas.classList.remove('drawer-open');
        }

        window.selectNodeByIndex = function(idx) {
            if (idx < 0 || idx >= nodes.length) return;
            selected = idx;
            const node = nodes[selected];
            if (node.isMemoryRef) {
                openMemoryLinkSidebar(node);
            } else {
                showNodeDetails(node);
                openDrawer();
            }
            window.location.hash = node.idKey;
        };

        const filterCategoryOrder = CONFIG.filterCategoryOrder || ['region', 'person', 'location', 'activity', 'temporal', 'emotion'];
        const filterCategoryLabels = CONFIG.filterCategoryLabels || { region: 'Regions', person: 'People', location: 'Locations', activity: 'Activities', temporal: 'Temporal', emotion: 'Emotions' };

        function populateFilterList() {
            const listEl = document.getElementById('filter-list');
            if (!listEl || nodes.length === 0) return;
            const byCategory = {};
            filterCategoryOrder.forEach(cat => { byCategory[cat] = []; });
            nodes.forEach((n, idx) => {
                const t = (n.type || '').toLowerCase();
                if (byCategory[t]) byCategory[t].push({ node: n, idx });
            });
            if (nodes.some(n => n.isMemoryRef)) {
                byCategory['memoryreference'] = nodes.map((n, idx) => ({ node: n, idx })).filter(({ node }) => node.isMemoryRef);
            }
            listEl.innerHTML = '';
            filterCategoryOrder.forEach(cat => {
                const items = byCategory[cat];
                if (!items || items.length === 0) return;
                const label = filterCategoryLabels[cat] || cat;
                const color = categoryColors[cat] || '#00ffff';
                const heading = document.createElement('h4');
                heading.textContent = label;
                heading.style.color = color;
                listEl.appendChild(heading);
                items.forEach(({ node, idx }) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'filter-node';
                    btn.textContent = node.name;
                    btn.style.color = color;
                    btn.addEventListener('click', () => selectNodeByIndex(idx));
                    listEl.appendChild(btn);
                });
            });
        }

        // Accordion: only one section open at a time
        function closeAllAccordionBodies() {
            document.querySelectorAll('#info .accordion-body').forEach(el => { el.classList.remove('open'); });
        }
        function syncAccordionChevrons() {
            document.querySelectorAll('#info [data-accordion-body]').forEach(trigger => {
                const bodyId = trigger.getAttribute('data-accordion-body');
                const body = document.getElementById(bodyId);
                const chevron = trigger.querySelector('[id$="-chevron"]');
                if (body && chevron) {
                    const isOpen = body.classList.contains('open');
                    chevron.textContent = isOpen ? '▲' : '▼';
                    trigger.setAttribute('aria-expanded', isOpen);
                }
            });
        }
        document.getElementById('info').addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-accordion-body]');
            if (!trigger) return;
            const bodyId = trigger.getAttribute('data-accordion-body');
            const body = document.getElementById(bodyId);
            if (!body) return;
            const wasOpen = body.classList.contains('open');
            closeAllAccordionBodies();
            if (!wasOpen) body.classList.add('open');
            syncAccordionChevrons();
        });

        canvas.addEventListener('wheel', e => {
            e.preventDefault();
            // Scale the whole graph (scroll up / pinch out = zoom in, scroll down = zoom out)
            const zoomSpeed = 0.002;
            viewZoom *= 1 - e.deltaY * zoomSpeed;
            viewZoom = Math.max(VIEW_ZOOM_MIN, Math.min(VIEW_ZOOM_MAX, viewZoom));
        });

        let pinchDist = null;
        let touchStartX = 0, touchStartY = 0, lastTouchX = 0, lastTouchY = 0;
        let touchMoved = false;
        let touchFingerCount = 0;
        const TAP_THRESHOLD = 12;

        function pinchDistance(touches) {
            return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        }

        function hitTestNode(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            const mx = clientX - rect.left;
            const my = clientY - rect.top;
            for (let n of nodes) {
                const p = project(n.x, n.y, n.z);
                const d = Math.hypot(p.x - mx, p.y - my);
                if (d < n.size * p.scale + 25) {
                    selected = selected === n.id ? null : n.id;
                    const selNode = selected !== null ? nodes[selected] : null;
                    if (selNode && selNode.isMemoryRef) {
                        openMemoryLinkSidebar(selNode);
                    } else {
                        showNodeDetails(selNode);
                    }
                    window.location.hash = selected !== null ? nodes[selected].idKey : '';
                    return true;
                }
            }
            return false;
        }

        canvas.addEventListener('touchstart', e => {
            touchFingerCount = e.touches.length;
            if (e.touches.length === 2) {
                pinchDist = pinchDistance(e.touches);
                e.preventDefault();
            } else if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                lastTouchX = touchStartX;
                lastTouchY = touchStartY;
                touchMoved = false;
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const d = pinchDistance(e.touches);
                if (pinchDist === null) { pinchDist = d; return; }
                // Pinch out (d > pinchDist) = zoom in = increase viewZoom
                const ratio = d / pinchDist;
                viewZoom *= ratio;
                viewZoom = Math.max(VIEW_ZOOM_MIN, Math.min(VIEW_ZOOM_MAX, viewZoom));
                pinchDist = d;
            } else if (e.touches.length === 1) {
                const dx = e.touches[0].clientX - lastTouchX;
                const dy = e.touches[0].clientY - lastTouchY;
                if (!touchMoved) touchMoved = Math.hypot(e.touches[0].clientX - touchStartX, e.touches[0].clientY - touchStartY) > TAP_THRESHOLD;
                if (touchMoved) {
                    e.preventDefault();
                    camera.angle += dx * 0.012;
                    camera.pitch += dy * 0.008;
                    camera.pitch = Math.max(-1.2, Math.min(1.2, camera.pitch));
                }
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', e => {
            if (e.touches.length < 2) pinchDist = null;
            if (e.touches.length === 0 && touchFingerCount === 1 && !touchMoved && e.changedTouches[0]) {
                const t = e.changedTouches[0];
                hitTestNode(t.clientX, t.clientY);
            }
        }, { passive: true });

        let drag = null;
        canvas.addEventListener('mousedown', e => {
            drag = {x: e.clientX, y: e.clientY};
        });
        document.addEventListener('mousemove', e => {
            if (drag) {
                camera.angle += (e.clientX - drag.x) * 0.012;
                camera.pitch += (e.clientY - drag.y) * 0.008;
                camera.pitch = Math.max(-1.2, Math.min(1.2, camera.pitch));
                drag = {x: e.clientX, y: e.clientY};
            }
        });
        document.addEventListener('mouseup', () => {
            drag = null;
        });

        window.walk = () => {
            selected = Math.floor(Math.random() * nodes.length);
            const node = nodes[selected];
            if (node.isMemoryRef) {
                openMemoryLinkSidebar(node);
            } else {
                showNodeDetails(node);
                if (window.innerWidth <= 768) {
                    setDrawerOpen(true);
                    showNodeDetailsInDrawer(node);
                }
            }
            window.location.hash = node.idKey;
            openDrawer();
        };

        window.reset = () => {
            camera = {angle: 0.5, dist: 680, height: 0, pitch: 0};
            viewZoom = 1;
            selected = null;
            showNodeDetails(null);
        };

        /** Load memory by source: 'latest' | { commit } | { hash (master hash) }. Updates the graph. */
        window.loadMemory = loadMemory;

        const liveUrl = CONFIG.liveUrl || 'https://paulvisciano.github.io/memory/';
        let fingerprintData = null;
        fetch('./fingerprint.json?t=' + Date.now()).then(r => r.ok ? r.json() : Promise.reject()).then(d => { fingerprintData = d; }).catch(() => {});
        function isLocalhost() {
            const h = window.location.hostname;
            return h === 'localhost' || h === '127.0.0.1';
        }
        function getSharePayload() {
            const lastSyncEl = document.getElementById('memory-version');
            const lastSync = fingerprintData ? fingerprintData.lastSynced : ((lastSyncEl && lastSyncEl.getAttribute('data-last-sync')) || new Date().toISOString().slice(0, 10));
            const n = nodes.length;
            const s = edges.length;
            const currentUrl = window.location.href;
            const url = isLocalhost() ? liveUrl : currentUrl;
            const title = CONFIG.shareTitle || "Neural Mind";
            const shortBoot = CONFIG.shareShortBoot || "Interactive neural graph. The memory is alive.";
            const fingerprint = (fingerprintData && fingerprintData.masterHash) ? fingerprintData.masterHash : '…';
            const verifyUrl = (fingerprintData && fingerprintData.verifyUrl) ? fingerprintData.verifyUrl : (CONFIG.shareVerifyUrlDefault || 'paulvisciano.github.io/memory/BOOT.md');
            const shareHeading = CONFIG.shareHeading || 'Neural Mind';
            const loadLabel = CONFIG.shareLoadMemoryLabel || "Load memory at the start of a new session";
            const lines = [
                shareHeading,
                `Last synced: ${lastSync} · ${n} neurons · ${s} synapses`,
                `Fingerprint: ${fingerprint}`,
                '',
                shortBoot,
                '',
                `${loadLabel}: ${verifyUrl}`,
                '',
                url
            ];
            const text = lines.join('\n');
            return { title, text, url, lastSync, n, s, shortBoot, verifyUrl };
        }
        function escapeHtml(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
        function shareMemory() {
            const { title, text, url, lastSync, n, s, shortBoot, verifyUrl } = getSharePayload();
            const overlay = document.getElementById('share-modal-overlay');
            const preview = document.getElementById('share-preview');
            const fingerprint = (fingerprintData && fingerprintData.masterHash) ? fingerprintData.masterHash : '…';
            const verifyUrlVal = verifyUrl || (fingerprintData && fingerprintData.verifyUrl) || CONFIG.shareVerifyUrlDefault || 'paulvisciano.github.io/memory/BOOT.md';
            const verifyHref = verifyUrlVal.startsWith('http') ? verifyUrlVal : 'https://' + verifyUrlVal;
            const shareHeading = CONFIG.shareHeading || 'Neural Mind';
            const loadLabel = CONFIG.shareLoadMemoryLabel || "Load memory at the start of a new session";
            const lines = [
                shareHeading,
                ``,
                `Last synced: ${escapeHtml(lastSync)}`,
                `Size: ${escapeHtml(n)} neurons · ${escapeHtml(s)} synapses`,
                `Fingerprint: ${escapeHtml(fingerprint)}`,
                ``,
                escapeHtml(shortBoot),
                ``,
                `${loadLabel}: <a href="${escapeHtml(verifyHref)}" target="_blank" rel="noopener">${escapeHtml(verifyUrlVal)}</a>`,
                ``,
                `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`
            ];
            preview.innerHTML = lines.join('\n');
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
        }
        document.getElementById('share-modal-close').addEventListener('click', () => {
            document.getElementById('share-modal-overlay').classList.remove('is-open');
            document.getElementById('share-modal-overlay').setAttribute('aria-hidden', 'true');
        });
        document.getElementById('share-modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'share-modal-overlay') {
                document.getElementById('share-modal-overlay').classList.remove('is-open');
                document.getElementById('share-modal-overlay').setAttribute('aria-hidden', 'true');
            }
        });
        document.getElementById('share-modal-copy').addEventListener('click', () => {
            const { text } = getSharePayload();
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('share-modal-copy');
                const t = btn.textContent; btn.textContent = '✓ Copied';
                setTimeout(() => { btn.textContent = t; }, 2000);
            }).catch(() => alert('Share text copy failed.'));
        });
        document.getElementById('share-modal-native').addEventListener('click', () => {
            const { title, text, url } = getSharePayload();
            if (navigator.share) {
                navigator.share({ title, text, url }).then(() => {
                    document.getElementById('share-modal-overlay').classList.remove('is-open');
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    document.getElementById('share-modal-copy').textContent = '✓ Copied';
                    setTimeout(() => { document.getElementById('share-modal-overlay').classList.remove('is-open'); }, 500);
                });
            }
        });
        document.getElementById('share-memory-btn').addEventListener('click', shareMemory);

        document.getElementById('full-context-btn').addEventListener('click', function openFullContext() {
            if (selected === null || !nodes[selected]) return;
            const node = nodes[selected];
            if (!node.sourceDocument) return;
            const pathOnDisk = node.sourceDocument;
            
            // Handle GitHub URLs
            if (pathOnDisk.startsWith('https://')) {
                fetch(pathOnDisk)
                    .then(r => r.ok ? r.text() : Promise.reject(new Error(r.statusText)))
                    .then(md => {
                        // Use same modal popup as local files for consistency
                        const pre = document.createElement('pre');
                        pre.style.cssText = 'white-space: pre-wrap; max-height: 70vh; overflow: auto; font-size: 12px; text-align: left; padding: 12px; margin: 0;';
                        pre.textContent = md;
                        const d = document.createElement('div');
                        d.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;';
                        const closeBtn = document.createElement('button');
                        closeBtn.textContent = 'Close';
                        closeBtn.className = 'primary';
                        closeBtn.style.marginBottom = '12px';
                        closeBtn.onclick = () => d.remove();
                        d.appendChild(closeBtn);
                        d.appendChild(pre);
                        document.body.appendChild(d);
                    })
                    .catch(err => alert('Error loading: ' + err.message));
                return;
            }
            
            // Local file behavior
            const msg = 'File on disk (relative to project root):\n\n' + pathOnDisk + '\n\nIn Cursor: Cmd+P (or Ctrl+P) and paste this path to open.';
            if (window.location.protocol === 'file:' || window.location.hostname === 'paulvisciano.github.io') {
                console.info('Full Context (local only):', pathOnDisk);
                alert(msg);
                return;
            }
            const fetchUrl = (CONFIG.getFullContextFetchUrl && CONFIG.getFullContextFetchUrl(pathOnDisk)) || (pathOnDisk.startsWith('memory/') ? pathOnDisk.slice(7) : pathOnDisk);
            fetch(fetchUrl)
                .then(r => r.ok ? r.text() : Promise.reject(new Error(r.statusText)))
                .then(md => {
                    const pre = document.createElement('pre');
                    pre.style.cssText = 'white-space: pre-wrap; max-height: 70vh; overflow: auto; font-size: 12px; text-align: left; padding: 12px; margin: 0;';
                    pre.textContent = 'File: ' + pathOnDisk + '\n\n' + md;
                    const d = document.createElement('div');
                    d.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;';
                    const closeBtn = document.createElement('button');
                    closeBtn.textContent = 'Close';
                    closeBtn.className = 'primary';
                    closeBtn.style.marginBottom = '12px';
                    closeBtn.onclick = () => d.remove();
                    d.appendChild(closeBtn);
                    d.appendChild(pre);
                    document.body.appendChild(d);
                })
                .catch(() => alert(msg));
        });

        // Start rendering immediately (will display as data loads)
        render();
        
        // Load character profiles, then graph data
        // Unregister old service workers that were caching aggressively
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(reg => {
                    console.log('Unregistering service worker:', reg);
                    reg.unregister();
                });
            }).catch(err => console.log('No service workers to unregister:', err));
        }
        
        loadCharacterProfiles();
        // Initial selection (hash vs random) is handled by the single loadGraphData().then() above
        })();
