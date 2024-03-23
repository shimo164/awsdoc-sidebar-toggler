document.addEventListener('DOMContentLoaded', function () {
  const saveMessage = document.getElementById('saveMessage');
  const rightSidebarOptions = document.getElementsByName('rightSidebar');
  const leftSidebarOptions = document.getElementsByName('leftSidebar');

  // Load saved settings
  chrome.storage.local.get(['rightSidebar', 'leftSidebar'], function (items) {
    if (items.rightSidebar) {
      rightSidebarOptions.forEach(option => {
        if (option.value === items.rightSidebar) {
          option.checked = true;
        }
      });
    }

    if (items.leftSidebar) {
      leftSidebarOptions.forEach(option => {
        if (option.value === items.leftSidebar) {
          option.checked = true;
        }
      });
    }
  });

  // Save the settings
  document.getElementById('saveOptions').addEventListener('click', function () {
    const selectedRightSidebar = Array.from(rightSidebarOptions).find(option => option.checked).value;
    const selectedLeftSidebar = Array.from(leftSidebarOptions).find(option => option.checked).value;

    chrome.storage.local.set({
      rightSidebar: selectedRightSidebar,
      leftSidebar: selectedLeftSidebar,
    }, function () {
      saveMessage.innerHTML = `Settings saved at ${new Date().toLocaleString()}.`;
    });
  });
});
