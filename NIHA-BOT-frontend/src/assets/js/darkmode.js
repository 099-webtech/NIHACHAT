export function ToggleDarkMode() {
    const DarkBtnValue = localStorage.getItem('DarkModeOn') === 'true';
    const head = document.head;
    const styleElementId = 'custom-scrollbar-style';

    // Check if the style element already exists
    let styleElement = document.getElementById(styleElementId);

    // Create a style for element if it doesn't exist
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleElementId;
        head.appendChild(styleElement);
    }

    const scrollBarStyle = `::-webkit-scrollbar-track {
        background-color: #042e0f;
    }`;

    // Apply or remove dark mode styles
    if (DarkBtnValue) {
        let elements = document.querySelectorAll('*');
        elements.forEach(function (element) {
            element.classList.add('dark-mode');
        });
        styleElement.textContent = scrollBarStyle;
    } else {
        let elements = document.querySelectorAll('*');
        elements.forEach(function (element) {
            element.classList.remove('dark-mode');
        });
        styleElement.textContent = ''; // Remove the custom scrollbar style
    }
}