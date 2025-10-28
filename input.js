function setupInput() {
  window.addEventListener("keydown", e => {
    // avoid typing in input triggering game inputs
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") {
      return;
    }
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup", e => {
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") {
      return;
    }
    keys[e.key.toLowerCase()] = false;
  });
}
