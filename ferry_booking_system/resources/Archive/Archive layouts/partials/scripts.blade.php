<!-- layouts/partials/scripts.blade.php -->
<script>
    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert-fade');
        alerts.forEach(alert => {
            alert.style.display = 'none';
        });
    }, 5000);

    // Function to handle sidebar highlight based on current route
    document.addEventListener('DOMContentLoaded', function() {
        // Add any specific initialization scripts here
    });
</script>
