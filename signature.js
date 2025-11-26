// Set up client signature pad
const clientCanvas = document.getElementById('clientSignaturePad');
const clientCtx = clientCanvas.getContext('2d');
let isDrawing = false;
let clientSignatureData = null;

// Set canvas size with proper DPI handling
function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = clientCanvas.getBoundingClientRect();
  clientCanvas.width = rect.width * dpr;
  clientCanvas.height = rect.height * dpr;
  clientCtx.scale(dpr, dpr);
  clientCanvas.style.width = rect.width + 'px';
  clientCanvas.style.height = rect.height + 'px';
  
  clientCtx.strokeStyle = '#000';
  clientCtx.lineWidth = 2;
  clientCtx.lineCap = 'round';
  clientCtx.lineJoin = 'round';
}

// Initialize canvas when page loads
if (clientCanvas) {
  setupCanvas();
  
  // Reinitialize canvas on window resize
  window.addEventListener('resize', setupCanvas);
}

function getMousePos(e) {
  const rect = clientCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const scaleX = clientCanvas.width / dpr / rect.width;
  const scaleY = clientCanvas.height / dpr / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function getTouchPos(e) {
  const rect = clientCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const scaleX = clientCanvas.width / dpr / rect.width;
  const scaleY = clientCanvas.height / dpr / rect.height;
  return {
    x: (e.touches[0].clientX - rect.left) * scaleX,
    y: (e.touches[0].clientY - rect.top) * scaleY
  };
}

// Mouse events
clientCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const pos = getMousePos(e);
  clientCtx.beginPath();
  clientCtx.moveTo(pos.x, pos.y);
});

clientCanvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const pos = getMousePos(e);
  clientCtx.lineTo(pos.x, pos.y);
  clientCtx.stroke();
});

clientCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
  clientSignatureData = clientCanvas.toDataURL('image/png');
});

clientCanvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

// Touch events
clientCanvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDrawing = true;
  const pos = getTouchPos(e);
  clientCtx.beginPath();
  clientCtx.moveTo(pos.x, pos.y);
});

clientCanvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!isDrawing) return;
  const pos = getTouchPos(e);
  clientCtx.lineTo(pos.x, pos.y);
  clientCtx.stroke();
});

clientCanvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  isDrawing = false;
  clientSignatureData = clientCanvas.toDataURL('image/png');
});

function clearClientSignature() {
  const dpr = window.devicePixelRatio || 1;
  clientCtx.clearRect(0, 0, clientCanvas.width / dpr, clientCanvas.height / dpr);
  clientSignatureData = null;
}

function toggleNameEdit() {
  const checkbox = document.getElementById('nameCheckbox');
  const input = document.getElementById('clientName');
  
  if (checkbox.checked) {
    input.readOnly = true;
    input.style.background = '#e8f5e9';
    input.style.borderColor = '#4caf50';
  } else {
    input.readOnly = false;
    input.style.background = 'white';
    input.style.borderColor = '#ccc';
  }
}

function togglePositionEdit() {
  const checkbox = document.getElementById('positionCheckbox');
  const input = document.getElementById('clientPosition');
  
  if (checkbox.checked) {
    input.readOnly = true;
    input.style.background = '#e8f5e9';
    input.style.borderColor = '#4caf50';
  } else {
    input.readOnly = false;
    input.style.background = 'white';
    input.style.borderColor = '#ccc';
  }
}
