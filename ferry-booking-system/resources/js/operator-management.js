// resources/js/operator-management.js
document.addEventListener('DOMContentLoaded', function() {
    // Konfirmasi hapus dengan modal
    const deleteButtons = document.querySelectorAll('.confirm-delete');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('form');

            if (confirm('Apakah Anda yakin ingin menghapus operator ini?')) {
                form.submit();
            }
        });
    });

    // Datepicker atau fungsi lain yang mungkin dibutuhkan
});
