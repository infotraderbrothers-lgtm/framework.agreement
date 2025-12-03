// Webhook URL - Updated to your Make.com webhook
const WEBHOOK_URL = 'https://hook.eu2.make.com/c97sl5bvcsqf54pbf7g1myqj7quiapwf';

let signedContractHTML = '';

function submitContract() {
  const name = document.getElementById('clientName').value.trim();
  const position = document.getElementById('clientPosition').value;
  const date = document.getElementById('clientDate').value;
  
  if (!name) {
    alert('Please enter your full name');
    return;
  }
  
  if (!position) {
    alert('Please enter your position');
    return;
  }
  
  if (!clientSignatureData) {
    alert('Please provide your signature');
    return;
  }
  
  if (!date) {
    alert('Please select the date');
    return;
  }
  
  // Format date
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Create signed client section
  const signedClientHTML = `
    <div class="sig-field">
      <div class="sig-label">Name</div>
      <div style="padding: 8px 0; font-weight: bold;">${name}</div>
    </div>
    <div class="sig-field">
      <div class="sig-label">Position</div>
      <div style="padding: 8px 0;">${position}</div>
    </div>
    <div class="sig-field">
      <div class="sig-label">Signature</div>
      <div style="border: 1px solid #ccc; min-height: 60px; background: #fafafa; display: flex; align-items: center; justify-content: center; padding: 10px; margin-top: 5px;">
        <img src="${clientSignatureData}" alt="Signature" style="max-width: 100%; max-height: 50px; height: auto;">
      </div>
    </div>
    <div class="sig-field">
      <div class="sig-label">Date</div>
      <div style="padding: 8px 0;">${formattedDate}</div>
    </div>
  `;
  
  document.getElementById('client-signed-section').innerHTML = signedClientHTML;
  document.getElementById('client-signed-section').style.display = 'block';
  document.getElementById('client-sign-section').style.display = 'none';
  document.getElementById('contract-actions').style.display = 'block';
  
  // Generate complete HTML document
  setTimeout(() => {
    generateFinalDocument(name, position, formattedDate, clientSignatureData);
  }, 300);
}

function generateFinalDocument(clientName, clientPosition, clientDate, clientSig) {
  // Clone the entire document
  const docClone = document.documentElement.cloneNode(true);
  
  // Remove scripts and interactive elements from clone
  const scripts = docClone.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  const popup = docClone.querySelector('#thankYouPopup');
  if (popup) popup.remove();
  
  const actions = docClone.querySelector('#contract-actions');
  if (actions) actions.remove();
  
  // Get the complete HTML
  signedContractHTML = '<!DOCTYPE html>\n' + docClone.outerHTML;
}

function viewContract() {
  // Open signed contract in new window
  const newWindow = window.open('', '_blank');
  newWindow.document.write(signedContractHTML);
  newWindow.document.close();
}

function compressSignature(base64Data) {
  // Create a temporary canvas to compress the signature
  const img = new Image();
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  return new Promise((resolve) => {
    img.onload = () => {
      // Set compressed dimensions (similar to signature tool)
      tempCanvas.width = 300;
      tempCanvas.height = 100;
      
      // Draw the image scaled down
      tempCtx.drawImage(img, 0, 0, 300, 100);
      
      // Return compressed base64
      resolve(tempCanvas.toDataURL('image/png', 0.7));
    };
    img.src = base64Data;
  });
}

async function sendToWebhook() {
  const btn = document.getElementById('sendWebhookBtn');
  btn.disabled = true;
  btn.textContent = 'Sending...';
  
  const clientName = document.getElementById('clientName').value.trim();
  const clientPosition = document.getElementById('clientPosition').value;
  const clientDate = document.getElementById('clientDate').value;
  
  try {
    // Compress the signature before sending
    const compressedSignature = await compressSignature(clientSignatureData);
    const sizeInBytes = Math.round((compressedSignature.length * 3) / 4);
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    // Create FormData to send as separate fields (matching signature tool format)
    const formData = new FormData();
    formData.append('clientName', clientName);
    formData.append('clientPosition', clientPosition);
    formData.append('signatureDate', clientDate);
    formData.append('signature', compressedSignature);
    formData.append('contractHTML', signedContractHTML);
    formData.append('timestamp', new Date().toISOString());
    formData.append('signatureSizeKB', sizeInKB);
    
    // Send to Make.com webhook with no-cors mode (matching signature tool)
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
    
    // Show thank you popup (no-cors doesn't return response, so we assume success)
    document.getElementById('thankYouPopup').style.display = 'flex';
    
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to send contract. Please try again or contact support.');
    btn.disabled = false;
    btn.textContent = 'Send Contract';
  }
}

function closeThankYou() {
  document.getElementById('thankYouPopup').style.display = 'none';
}

function formatTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = today.toLocaleDateString('en-GB', { month: 'long' });
  const year = today.getFullYear();
  return `${day} ${month} ${year}`;
}

// Set today's date and populate fields from URL parameters on page load
document.addEventListener('DOMContentLoaded', function() {
  // Always set today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('clientDate').value = today;
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Auto-populate all placeholder fields from URL parameters
  const placeholders = {
    'ContractingPartyName': urlParams.get('clientCompany'),
    'ContractingPartyJurisdiction': urlParams.get('clientJurisdiction'),
    'ContractingPartyRegistrationNumber': urlParams.get('clientRegNumber'),
    'ContractingPartyAddress': urlParams.get('clientAddress'),
    'YourCompanyName': urlParams.get('contractorCompany'),
    'YourCompanyRegistrationNumber': urlParams.get('contractorRegNumber'),
    'YourCompanyAddress': urlParams.get('contractorAddress'),
    'AgreementDate': formatTodayDate(),
    'AgreementStartDate': urlParams.get('startDate'),
    'AgreementTermYears': urlParams.get('termYears'),
    'PaymentTermsDays': urlParams.get('paymentDays'),
    'RetentionPercentage': urlParams.get('retention'),
    'PLIAmount': urlParams.get('pliAmount'),
    'PIAmount': urlParams.get('piAmount'),
    'TerminationNoticePeriod': urlParams.get('noticePeriod')
  };
  
  // Replace all placeholders in the document
  for (const [key, value] of Object.entries(placeholders)) {
    if (value) {
      const elements = document.querySelectorAll('.placeholder');
      elements.forEach(el => {
        if (el.textContent.includes('{{' + key + '}}')) {
          el.textContent = value;
          el.style.background = 'transparent';
          el.style.padding = '0';
        }
      });
    }
  }
  
  // Auto-populate client name and position fields
  const clientName = urlParams.get('clientName');
  const clientPosition = urlParams.get('clientPosition');
  
  if (clientName) {
    document.getElementById('clientName').value = clientName;
  }
  
  if (clientPosition) {
    document.getElementById('clientPosition').value = clientPosition;
  }
});
