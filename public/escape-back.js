document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented) {
        return;
    }

    const footnoteModal = document.getElementById('footnote-modal');
    if (footnoteModal?.classList.contains('active')) {
        return;
    }

    document.querySelector('.back-btn')?.click();
});
