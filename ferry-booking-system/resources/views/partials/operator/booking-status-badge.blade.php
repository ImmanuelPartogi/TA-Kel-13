@if($status == 'PENDING')
    <span class="badge badge-warning">Menunggu</span>
@elseif($status == 'CONFIRMED')
    <span class="badge badge-success">Dikonfirmasi</span>
@elseif($status == 'COMPLETED')
    <span class="badge badge-info">Selesai</span>
@elseif($status == 'CANCELLED')
    <span class="badge badge-danger">Dibatalkan</span>
@else
    <span class="badge badge-secondary">{{ $status }}</span>
@endif
