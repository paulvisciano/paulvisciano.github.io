/**
 * Shared mobile drawer + fixed hash overlay for neural graph pages.
 * Injects the drawer DOM so memory/index.html and claw/memory/index.html stay in sync.
 * Load this script before neural-graph.js. Requires #neural-graph-drawer-mount in the page.
 */
(function() {
    var mount = document.getElementById('neural-graph-drawer-mount');
    if (!mount) return;

    var html =
        '<!-- Mobile bottom sheet: scrim (tap to close) + sheet -->' +
        '<div id="drawerScrim" class="drawer-scrim" aria-hidden="true"></div>' +
        '<div id="bottomDrawer" class="bottom-drawer" role="dialog" aria-label="Node details">' +
        '  <div class="drawer-header">' +
        '    <div class="drawer-handle" aria-hidden="true"></div>' +
        '  </div>' +
        '  <div id="drawerContent" class="drawer-content">' +
        '    <div class="drawer-section jump-to-node-section">' +
        '      <h4 class="drawer-section-title">Jump to node</h4>' +
        '      <div id="drawerNodeList" class="drawer-node-list" role="region" aria-label="Node list by category"></div>' +
        '    </div>' +
        '    <div class="drawer-section">' +
        '      <h4 class="drawer-section-title">Actions</h4>' +
        '      <div class="drawer-actions">' +
        '        <button type="button" class="drawer-action-btn primary" id="drawer-share-btn">⎘ Share</button>' +
        '        <button type="button" class="drawer-action-btn primary" id="drawer-walk-btn">⚡ Random Pulse</button>' +
        '        <button type="button" class="drawer-action-btn primary" id="drawer-clear-btn">✕ Clear</button>' +
        '      </div>' +
        '    </div>' +
        '    <div class="drawer-meta">' +
        '      <div class="drawer-meta-row"><span class="drawer-meta-label">date:</span> <span id="drawer-memory-version">—</span></div>' +
        '      <div class="drawer-meta-row"><span class="drawer-meta-label">count:</span> <span id="drawer-neurons-synapses">—</span></div>' +
        '      <div class="drawer-meta-row"><span class="drawer-meta-label">hash:</span> <span id="drawer-fingerprint-hash" class="drawer-meta-hash">—</span></div>' +
        '    </div>' +
        '  </div>' +
        '</div>' +
        '<div id="fixed-hash-overlay" class="fixed-hash-overlay">' +
        '  <div class="fixed-hash-overlay-inner">' +
        '    <span class="drawer-meta-label">hash:</span> <span id="fingerprint-hash">—</span>' +
        '  </div>' +
        '</div>';

    mount.innerHTML = html;
})();
