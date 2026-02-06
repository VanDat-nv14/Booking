// Debug script cho button delete
console.log('🐛 Debug script loaded');

// Function để test button click events
function debugDeleteButtons() {
  console.log('🔍 Starting delete button debug...');
  
  // Tìm tất cả button delete
  const deleteButtons = document.querySelectorAll('button[danger], .ant-btn-dangerous, button:contains("Xóa")');
  console.log('📊 Found delete buttons:', deleteButtons.length);
  
  deleteButtons.forEach((button, index) => {
    console.log(`🔘 Button ${index + 1}:`, {
      text: button.textContent,
      disabled: button.disabled,
      visible: window.getComputedStyle(button).visibility,
      zIndex: window.getComputedStyle(button).zIndex,
      pointerEvents: window.getComputedStyle(button).pointerEvents,
      display: window.getComputedStyle(button).display
    });
    
    // Add debug event listener
    button.addEventListener('click', function(e) {
      console.log(`🚨 Delete button ${index + 1} clicked!`, {
        event: e,
        target: e.target,
        currentTarget: e.currentTarget,
        bubbles: e.bubbles,
        cancelable: e.cancelable,
        defaultPrevented: e.defaultPrevented
      });
    }, true); // Use capture phase
  });
}

// Function để test Modal.confirm
function testModalConfirm() {
  console.log('🧪 Testing Modal.confirm...');
  
  if (window.antd && window.antd.Modal) {
    const { Modal } = window.antd;
    console.log('✅ Modal found:', Modal);
    
    if (Modal.confirm) {
      console.log('✅ Modal.confirm found');
      
      // Test Modal.confirm
      try {
        Modal.confirm({
          title: 'Test Modal',
          content: 'This is a test modal',
          onOk: () => console.log('✅ Test modal OK clicked'),
          onCancel: () => console.log('❌ Test modal cancelled')
        });
        console.log('✅ Modal.confirm executed successfully');
      } catch (error) {
        console.error('❌ Modal.confirm error:', error);
      }
    } else {
      console.error('❌ Modal.confirm not found');
    }
  } else {
    console.error('❌ Antd Modal not found in window');
  }
}

// Function để check console errors
function checkConsoleErrors() {
  console.log('🔍 Checking for console errors...');
  
  // Override console.error để catch errors
  const originalError = console.error;
  console.error = function(...args) {
    console.log('🚨 Console Error Detected:', args);
    originalError.apply(console, args);
  };
}

// Auto run khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      debugDeleteButtons();
      testModalConfirm();
      checkConsoleErrors();
    }, 2000);
  });
} else {
  setTimeout(() => {
    debugDeleteButtons();
    testModalConfirm();
    checkConsoleErrors();
  }, 2000);
}

// Export functions để có thể gọi manual
window.debugDeleteButtons = debugDeleteButtons;
window.testModalConfirm = testModalConfirm;
window.checkConsoleErrors = checkConsoleErrors;

console.log('🚀 Debug functions available: debugDeleteButtons(), testModalConfirm(), checkConsoleErrors()'); 